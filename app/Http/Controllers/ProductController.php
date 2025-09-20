<?php

namespace App\Http\Controllers;
use App\Models\Product ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Services\InventoryService;
class ProductController extends Controller
{

     protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $products = Product::with('inventory' , 'warehouses')->latest()->get();
        $warehouses = Warehouse::with('branch')->latest()->get();
        return Inertia::render('Products/Index', [
            'products'   => $products->map(fn ($product) => [
                'id'             => $product->id,
                'name'           => $product->name,
                'internal_code'  => $product->internal_code,
                'brand_id'           => $product->brand_id,
                'price'           => $product->price,
                'total_quantity' => $product->total_quantity,
                'warehouses'     => $product->warehouses,
                 'inventories'      => $product->inventory,
            ]),
            'warehouses' => Warehouse::with('branch')->latest()->get(),
        ]);
    }

       public function edit(Product $product)
    {
          $warehouses = Warehouse::with('branch')->latest()->get();
        return Inertia::render('Products/Edit', [
            'product' => $product->load('inventory' , 'inventory.warehouse'),
            'warehouses' => $warehouses,
        ]);
    }
    public function store(Request $request)
    {
        //dd($request->all());
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'item_code' => 'nullable|string|max:255',
            'brand_id'=> 'nullable|string|max:255',
            'item_type' => 'nullable|string|max:255',
            'internal_code' => 'nullable|string|max:255',
            'unit_type' => 'nullable|string|max:255',
            'tax_percentage' => 'nullable|numeric|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ]);
        $data['user_id'] = auth()->id();
        $product = Product::create($data);
        $warehouse = Warehouse::find($request->warehouse_id);
        $warehouse->products()->syncWithoutDetaching([
            $product->id => ['quantity' => $request->stock, 'min_quantity' => 10]
        ]);
        return redirect()->back()->with('success', 'تم إضافة المنتج بنجاح');
    }
        public function update(Request $request , Product $product)
    {
        //dd($request->all());
        $data = $request->validate([
           'name' => 'required|string|max:255',
            'item_code' => 'nullable|string|max:255',
            'item_type' => 'nullable|string|max:255',
            'internal_code' => 'nullable|string|max:255',
            'brand_id'=> 'nullable|string|max:255',
            'unit_type' => 'nullable|string|max:255',
            'tax_percentage' => 'nullable|numeric|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
        ]);

        $product->update($data);
       // $warehouse = Warehouse::find($request->warehouse_id);
      /*   $warehouse->products()->syncWithoutDetaching([
            $product->id => ['quantity' => $request->stock, 'min_quantity' => 10]
        ]); */
        return redirect()->back()->with('success', 'تم تعديل المنتج بنجاح');
    }
    public function updateInventory(Request $request , Product $product)
    {
        
    }
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'تم حذف المنتج');
    }
}
