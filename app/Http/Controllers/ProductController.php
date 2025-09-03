<?php

namespace App\Http\Controllers;
use App\Models\Product ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('inventory' , 'warehouses')->latest()->paginate(10);
        $warehouses = Warehouse::with('branch')->latest()->get();
        return Inertia::render('Products/Index', [
            'products'   => $products->through(fn ($product) => [
                'id'             => $product->id,
                'name'           => $product->name,
                'code'           => $product->code,
                'price'           => $product->price,
                'total_quantity' => $product->total_quantity,
                'warehouses'     => $product->warehouses,
            ]),
            'warehouses' => Warehouse::with('branch')->latest()->get(),
        ]);
    }
    public function store(Request $request)
    {
        //dd($request->all());
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:255',
            'tax_rate' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ]);

        $product = Product::create($data);
        $warehouse = Warehouse::find($request->warehouse_id);
        $warehouse->products()->syncWithoutDetaching([
            $product->id => ['quantity' => $request->stock, 'min_quantity' => 10]
        ]);
        return redirect()->back()->with('success', 'تم إضافة المنتج بنجاح');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'تم حذف المنتج');
    }
}
