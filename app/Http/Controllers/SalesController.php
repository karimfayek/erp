<?php

namespace App\Http\Controllers;
use App\Models\Sale ;
use App\Models\SalesItem ;
use App\Models\Customer ;
use App\Models\Product ;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Services\InventoryService;
class SalesController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $sales = Sale::latest()->paginate(10);
        $customers = Customer::latest()->get();
        $products = Product::latest()->get();
        return Inertia::render('Sales/New', [
            'sales' => $sales,
            'products' => $products,
            'customers' => $customers,
        ]);
    }
    
    public function invoices()
    {
        $sales = Sale::with('customer')->latest()->paginate(2);
        $customers = Customer::latest()->get();
        $products = Product::latest()->get();
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'products' => $products,
            'customers' => $customers,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);
        $data = $request->validate([
            'date' => 'required|date|max:255',
            'customer_id' => 'required|exists:customers,id',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'subtotal' => 'required|numeric',
            'collected' => 'nullable|numeric',
            'postponed' => 'required|numeric',
            'tax' => 'required|numeric',
            'expenses' => 'required|numeric',
            'invoice_number' => 'required|string',
        ]);
        $data['user_id'] = auth()->id();
        $sale = Sale::create($data);
        foreach ($validated['items'] as $item) {
            SalesItem::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['qty'],
                'price' => $item['unit_price'],
                'total' => $item['unit_price'] * $item['qty'],
            ]);
            $this->inventoryService->recordMovement([
                'product_id' => $item['product_id'],
                'type' => 'out',
                'quantity' => $item['qty'],
                'movement_type' => 'deduction',
                'from_warehouse_id' => 1,
            ]);
        }

        return redirect()->back()->with('success', 'تم  الانشاء');
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return redirect()->back()->with('success', 'تم حذف الفاتورة');
    }
}
