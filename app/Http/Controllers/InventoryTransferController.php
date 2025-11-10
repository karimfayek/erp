<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Product ;
use App\Models\Warehouse ;

use App\Services\InventoryService;
use Inertia\Inertia;
class InventoryTransferController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $products = Product::where('maintainance' , 0)->where('type' , 'product')->with('warehouses')->get();
        $movements = \App\Models\InventoryMovement::with('product' , 'fromWarehouse' , 'toWarehouse' , 'user')->paginate(100);
        $warehouses = Warehouse::with('branch')->get();
        return Inertia::render('Transfer/Index', [
            'products' => $products,
            'warehouses' => $warehouses,
            'movements' => $movements,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|different:from_warehouse_id|exists:warehouses,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);
        try {
             $product = \App\Models\Product::find($validated['product_id']);
            $movement = $this->inventoryService->recordMovement([
            'product_id'        => $validated['product_id'],
            'quantity'          => $validated['quantity'],
            'from_warehouse_id' => $validated['from_warehouse_id'],
            'to_warehouse_id'   => $validated['to_warehouse_id'],
            'movement_type'     => 'transfer',            
            'prev_quantity'      => $product->total_quantity,
            'user_id'           => auth()->id(),
        ]);
    
    
            return back()->with('message' , 'تم نقل المنتج');
        } catch (\Exception $e) {
            return back()->withError(['message' => $e->getMessage()], 400);
        }
    }
    
    public function update(Request $request, $productId)
    {
        $data = $request->validate([
            'inventories' => 'required|array',
            'inventories.*.warehouse_id' => 'required|integer',
            'inventories.*.quantity' => 'required|integer|min:0',
        ]);
        
        foreach ($data['inventories'] as $inv) {
        try {
        $wh = \App\Models\ProductInventory::where('warehouse_id', $inv['warehouse_id'])
        ->where('product_id' ,$productId)
        ->first() ;
       // dd($inv['quantity']);
        $movement = $this->inventoryService->recordMovement([
            'product_id'        =>$productId,
            'type'              => 'adjust', 
            'quantity'          => $inv['quantity'],
            'from_warehouse_id' => $inv['warehouse_id'],
            'prev_quantity'      => $wh->quantity,
            'movement_type'     => 'adjustment',
            'user_id'           => auth()->id(),
        ]);
    } catch (\Exception $e) {
        return back()->withErrors(['message' => $e->getMessage()], 400);
    }
}

        

        return back()->with(['message' => 'Inventory updated successfully']);
    }
}
