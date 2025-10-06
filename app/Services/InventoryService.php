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
        if ($data['movement_type'] === 'transfer') {
            try {
                $prevQtyOut = \App\Models\ProductInventory::where('warehouse_id', $data['from_warehouse_id'])->first() ;
                $qtyOut = $prevQtyOut->quantity ?? 0 ;
                $outMovement = InventoryMovement::create([
                    'product_id'        => $data['product_id'],
                    'user_id'           => $data['user_id'] ?? auth()->id(),
                    'type'              => 'out',
                    'quantity'          => $data['quantity'],
                    'movement_date'     => now(),
                    'prev_quantity'     =>$qtyOut,
                    'from_warehouse_id' => $data['from_warehouse_id'],
                    'to_warehouse_id'   => $data['to_warehouse_id'],
                    'movement_type'     => 'transfer',
                    'notes'   => $data['notes'] ?? null,
                ]);
    
            $this->updateInventory($data['product_id'], $data['from_warehouse_id'], -$data['quantity']);
                 // ✅ حركة IN للهدف
                  $wh = \App\Models\ProductInventory::where('warehouse_id', $data['to_warehouse_id'])->first() ;
                $prevQtyIn = $wh->quantity ?? 0 ;
            $inMovement = InventoryMovement::create([
                'product_id'        => $data['product_id'],
                'user_id'           => $data['user_id'] ?? auth()->id(),
                'type'              => 'in',
                'quantity'          => $data['quantity'],
                'movement_date'     => now(),
                'prev_quantity'     =>$prevQtyIn,
                'from_warehouse_id' => $data['from_warehouse_id'],
                'to_warehouse_id'   => $data['to_warehouse_id'],
                'movement_type'     => 'transfer',
                    'notes'   => $data['notes'] ?? null,
            ]);

            $this->updateInventory($data['product_id'], $data['to_warehouse_id'], +$data['quantity']);

            return [$outMovement, $inMovement];

            } catch (\Exception $e){
                dd($e);
            }

           
        }

        // غير كده (إضافة/خصم/تسوية)
        try {
            $movement = InventoryMovement::create([
                'product_id'        => $data['product_id'],
                'user_id'           => $data['user_id'] ?? auth()->id(),
                'type'              => $data['type'], // in | out | adjust
                'quantity'          => $data['quantity'],                
                'prev_quantity'     =>$data['prev_quantity'],
                'movement_date'     => $data['movement_date'] ?? now(),
                'from_warehouse_id' => $data['from_warehouse_id'] ?? null,
                'notes'   => $data['notes'] ?? null,
                'to_warehouse_id' => match ($data['type']) {
                'adjust' => $data['from_warehouse_id'] ?? null,
                'sale'   => null,
                'in' => $data['to_warehouse_id'] ,
                default  => $data['from_warehouse_id'] ?? null,
            },
                'movement_type'     => $data['movement_type'],
            ]);
        } catch (\Exception $e){
            dd($e);
        }

        if ($data['type'] === 'in') {
            $this->updateInventory($data['product_id'], $data['to_warehouse_id'], $data['quantity']);
        } elseif ($data['type'] === 'out') {
            $this->updateInventory($data['product_id'], $data['from_warehouse_id'], -$data['quantity']);
        } elseif ($data['type'] === 'adjust') {
            $this->updateInventory($data['product_id'], $data['from_warehouse_id'], $data['quantity'] , 'adjust');
        } elseif ($data['type'] === 'sale') {
            $this->updateInventory($data['product_id'], $data['from_warehouse_id'], $data['quantity'] , 'sale');
        }

        return $movement;
    });
    }

    /**
     * تحديث الكمية الفعلية في جدول product_inventories
     */
    protected function updateInventory($productId, $warehouseId, $quantityChange , $type = null)
    {
       try{

           $inventory = ProductInventory::firstOrCreate([
               'product_id'   => $productId,
               'warehouse_id' => $warehouseId,
           ], [
               'quantity' => 0,
           ]);
          if($type === 'adjust'){
            $inventory->quantity = $quantityChange;
          } elseif($type === 'sale'){
            $inventory->quantity -= $quantityChange;
          } else{

              $inventory->quantity += $quantityChange;
          }
           $inventory->save();
        return $inventory;
        }catch (\Exception $e) {
    dd([
        'inventory' => $inventory ?? null,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
 
    }
}
