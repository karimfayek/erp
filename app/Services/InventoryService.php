<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\ProductInventory;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * تنفيذ حركة مخزون وتحديث الكمية
     */
    public function recordMovement(array $data)
    {
       
        return DB::transaction(function () use ($data) {
            try{
                $movement = InventoryMovement::create([
                    'product_id'         => $data['product_id'],
                    'user_id'            => $data['user_id'] ?? auth()->id(),
                    'type'               => $data['type'], // in | out | adjust
                    'quantity'           => $data['quantity'],
                    'movement_date'      => $data['movement_date'] ?? now(),
                    'from_warehouse_id'  => $data['from_warehouse_id'] ?? null,
                    'to_warehouse_id'    => $data['to_warehouse_id'] ?? null,
                    'movement_type'      => $data['movement_type'], // addition | deduction | transfer | adjustment
                ]);
                if ($data['movement_type'] === 'transfer') {
                    // خصم من المصدر
                    $this->updateInventory($data['product_id'], $data['from_warehouse_id'], -$data['quantity']);
                    // إضافة للهدف
                    $this->updateInventory($data['product_id'], $data['to_warehouse_id'], +$data['quantity']);
                } else {
                    if ($data['type'] === 'in') {
                        $this->updateInventory($data['product_id'], $data['to_warehouse_id'], $data['quantity']);
                    } elseif ($data['type'] === 'out') {
                        $this->updateInventory($data['product_id'], $data['from_warehouse_id'], -$data['quantity']);
                    } elseif ($data['type'] === 'adjust') {
                        $this->updateInventory($data['product_id'], $data['from_warehouse_id'], $data['quantity']);
                    }
                }
            return $movement;

            }catch (\Exception $e) {
            return  $e->getMessage();
        }
           
           
            
           
        });
    }

    /**
     * تحديث الكمية الفعلية في جدول product_inventories
     */
    protected function updateInventory($productId, $warehouseId, $quantityChange)
    {
        //dd($quantityChange);
        $inventory = ProductInventory::firstOrCreate([
            'product_id'   => $productId,
            'warehouse_id' => $warehouseId,
        ], [
            'quantity' => 0,
        ]);
        
        $inventory->quantity += $quantityChange;
        $inventory->save();

        return $inventory;
    }
}
