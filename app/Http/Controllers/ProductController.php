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

    public function index($m = null)
    {
            $warehouses = Warehouse::with('branch')->latest()->get();
        if($m == 'maintainance'){
                 if (!\Auth::user()->canDO('maintenance.products')) {
            abort(403, 'ليس لديك صلاحية  للوصول إلى هذه الصفحة.');
         }
            $products = Product::with('inventory' , 'warehouses')->latest()->where('maintainance', true)->get();
           // dd($warehouses);
            $maintainance = true;
        } else {
            if (!\Auth::user()->canDO('products.view')) {
                abort(403, 'ليس لديك صلاحية  للوصول إلى هذه الصفحة.');
            }
            $products = Product::with('inventory' , 'warehouses')->latest()->where('maintainance', false)->get();
             $maintainance = false;
        }
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
            'warehouses' =>$warehouses,
            'maintainance' =>$maintainance,
        ]);
    }

       public function edit(Product $product)
    {
        //dd(\Auth::user()->canDO('maintenance.products'));
        if (!\Auth::user()->canDO('products.view') && !\Auth::user()->canDO('maintenance.products')) {
                abort(403, 'ليس لديك صلاحية  للوصول إلى هذه الصفحة.');
            }
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
            'maintainance'=>'nullable|boolean',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'cost_price' => 'nullable|numeric',
            'stock' => 'nullable|integer',
            'type' => 'nullable|string|max:255',
            'warehouse_id' => 'nullable|exists:warehouses,id',
        ]);
        $data['user_id'] = auth()->id();
        $data['maintainance'] = $request->maintainance ? $request->maintainance : false;
        $data['type'] = $request->is_service ? 'service' : 'product';
        $data['cost_price'] = $request->is_service ? 0 : $request->cost_price;
        //dd( $data);
        $product = Product::create($data);
        if($request->warehouse_id && !$request->is_service){
            $warehouse = Warehouse::find($request->warehouse_id);
            $warehouse->products()->syncWithoutDetaching([
                $product->id => ['quantity' => $request->stock, 'min_quantity' => 10]
            ]);
        }
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
            'cost_price' => 'nullable|numeric',
        ]);

        $data['cost_price'] = $request->is_service ? 0 : $request->cost_price;
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
