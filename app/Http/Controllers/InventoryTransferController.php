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
        $products = Product::with('warehouses')->get();
        $movements = \App\Models\InventoryMovement::with('product' , 'fromWarehouse' , 'toWarehouse')->paginate(10);
        $warehouses = Warehouse::all();
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
            $movement = $this->inventoryService->recordMovement([
                'product_id'        => $validated['product_id'],
                'type'              => 'out', // حركة أساسية out
                'quantity'          => $validated['quantity'],
                'movement_type'     => 'transfer',
                'from_warehouse_id' => $validated['from_warehouse_id'],
                'to_warehouse_id'   => $validated['to_warehouse_id'],
                'user_id'           => auth()->id(),
            ]);
    
            return back()->with('message' , 'تم نقل المنتج');
        } catch (\Exception $e) {
            return back()->withError(['message' => $e->getMessage()], 400);
        }
    }
}
