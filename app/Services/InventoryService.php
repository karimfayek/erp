<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductInventory;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InventoryService
{
    /**
     * تسجيل حركة مخزون وتحديث الكمية الفعلية.
     *
     * الأنواع المدعومة:
     * in, out, adjust, sale
     *
     * أنواع الحركة:
     * addition, deduction, transfer, adjustment
     */
    public function recordMovement(array $data)
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);

            // الخدمات لا تحتاج إلى حركات مخزون.
            if ($product->type === 'service') {
                return null;
            }

            $type = $data['type'] ?? null;
            $movementType = $data['movement_type'] ?? null;
            $quantity = (int) ($data['quantity'] ?? 0);

            if ($quantity < 0) {
                throw new InvalidArgumentException(
                    'يجب أن تكون كمية الحركة صفرًا أو أكثر.'
                );
            }

            // نقل المنتجات بين مخزنين.
            if ($movementType === 'transfer') {
                return $this->recordTransfer($data, $quantity);
            }

            if (!in_array($type, ['in', 'out', 'adjust', 'sale'], true)) {
                throw new InvalidArgumentException(
                    'نوع حركة المخزون غير صالح.'
                );
            }

            $warehouseId = match ($type) {
                'in' => $data['to_warehouse_id'] ?? null,
                default => $data['from_warehouse_id'] ?? null,
            };

            if (!$warehouseId) {
                throw new InvalidArgumentException(
                    'يجب تحديد المخزن المطلوب.'
                );
            }

            $warehouseId = (int) $warehouseId;

            // قفل سجل المخزون لمنع تحديثين متزامنين على نفس السجل.
            $inventory = $this->lockInventory(
                (int) $product->id,
                $warehouseId
            );

            $previousQuantity = (int) $inventory->quantity;

            $movement = InventoryMovement::create([
                'product_id' => $product->id,
                'user_id' => $data['user_id'] ?? auth()->id(),
                'type' => $type,
                'quantity' => $quantity,
                'prev_quantity' => $data['prev_quantity']
                    ?? $previousQuantity,
                'movement_date' => $data['movement_date'] ?? now(),
                'from_warehouse_id' =>
                    $data['from_warehouse_id'] ?? null,
                'to_warehouse_id' => match ($type) {
                    'in' => $data['to_warehouse_id'],
                    'adjust' => $data['from_warehouse_id'] ?? null,
                    default => null,
                },
                'movement_type' => $movementType,
                'notes' => $data['notes'] ?? null,
            ]);

            switch ($type) {
                case 'in':
                    $inventory->quantity += $quantity;
                    break;

                case 'out':
                case 'sale':
                    // الكمية صفر تسجل الحركة دون تغيير المخزون.
                    $inventory->quantity -= $quantity;
                    break;

                case 'adjust':
                    // التسوية تعيّن الرصيد النهائي.
                    $inventory->quantity = $quantity;
                    break;
            }

            $inventory->save();

            return $movement;
        }, 3);
    }

    /**
     * تسجيل حركتي النقل وتحديث المخزنين.
     */
    private function recordTransfer(array $data, int $quantity)
    {
        $productId = (int) $data['product_id'];
        $fromWarehouseId = (int) ($data['from_warehouse_id'] ?? 0);
        $toWarehouseId = (int) ($data['to_warehouse_id'] ?? 0);

        if (
            !$fromWarehouseId ||
            !$toWarehouseId ||
            $fromWarehouseId === $toWarehouseId
        ) {
            throw new InvalidArgumentException(
                'يجب تحديد مخزنين مختلفين لإتمام النقل.'
            );
        }

        // قفل السجلات بترتيب ثابت لتقليل احتمالات التعارض.
        $warehouseIds = [$fromWarehouseId, $toWarehouseId];
        sort($warehouseIds);

        $inventories = [];

        foreach ($warehouseIds as $warehouseId) {
            $inventories[$warehouseId] = $this->lockInventory(
                $productId,
                $warehouseId
            );
        }

        $fromInventory = $inventories[$fromWarehouseId];
        $toInventory = $inventories[$toWarehouseId];

        $userId = $data['user_id'] ?? auth()->id();
        $movementDate = $data['movement_date'] ?? now();

        $outMovement = InventoryMovement::create([
            'product_id' => $productId,
            'user_id' => $userId,
            'type' => 'out',
            'quantity' => $quantity,
            'movement_date' => $movementDate,
            'prev_quantity' => $fromInventory->quantity,
            'from_warehouse_id' => $fromWarehouseId,
            'to_warehouse_id' => $toWarehouseId,
            'movement_type' => 'transfer',
            'notes' => $data['notes'] ?? null,
        ]);

        $inMovement = InventoryMovement::create([
            'product_id' => $productId,
            'user_id' => $userId,
            'type' => 'in',
            'quantity' => $quantity,
            'movement_date' => $movementDate,
            'prev_quantity' => $toInventory->quantity,
            'from_warehouse_id' => $fromWarehouseId,
            'to_warehouse_id' => $toWarehouseId,
            'movement_type' => 'transfer',
            'notes' => $data['notes'] ?? null,
        ]);

        $fromInventory->quantity -= $quantity;
        $toInventory->quantity += $quantity;

        $fromInventory->save();
        $toInventory->save();

        return [$outMovement, $inMovement];
    }

    /**
     * إنشاء سجل المخزون عند عدم وجوده ثم قفله.
     */
    private function lockInventory(
        int $productId,
        int $warehouseId
    ): ProductInventory {
        ProductInventory::firstOrCreate(
            [
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
            ],
            [
                'quantity' => 0,
            ]
        );

        return ProductInventory::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->lockForUpdate()
            ->firstOrFail();
    }
}
