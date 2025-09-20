<?php

namespace App\Http\Controllers;
use App\Models\Sale ;
use App\Models\SalesItem ;
use App\Models\Customer ;
use App\Models\Product ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Representative ;
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
         $user = auth()->user();
         $inv = \App\Models\Warehouse::where('id', $user->warehouse_id)->first();
        $customers = Customer::with('representatives')->latest()->get();
        $products = Product::latest()->get();
        $warehouses = Warehouse::where('id', $user->warehouse_id)->get();
        return Inertia::render('Sales/New', [
            'sales' => $sales,
            'products' => $products,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'inventory' => $inv,
            //edit the folwing to send representatives also for customers who has representatives in customer branches
            //group representatives by customer_id  
            'representativesByCustomer' => $customers->mapWithKeys(function ($customer) {
                // Collect direct representatives
                $directReps = $customer->representatives->map(function ($rep) {
    return ['id' => $rep->id, 'name' => $rep->name];
})->values();

                // Collect representatives from branches (if branches relation exists)
              $branchReps = collect();
if ($customer->relationLoaded('branches') || method_exists($customer, 'branches')) {
    foreach ($customer->branches as $branch) {
        if ($branch->relationLoaded('representatives') || method_exists($branch, 'representatives')) {
            $branchReps = $branchReps->merge(
                $branch->representatives->map(function ($rep) {
                    return ['id' => $rep->id, 'name' => $rep->name];
                })->values()
            );
        }
    }
}

                // Merge and unique by representative id
               $allReps = collect($directReps)
    ->merge($branchReps)
    ->unique(fn($rep) => $rep['id'])
    ->values();

                return [$customer->id => $allReps];
            }),
               
        ]);
    }
    
    public function invoices()
    {
        $user = auth()->user();
        $role = $user->roles ;
        //dd($role[0]);
        if($role[0] ->slug === 'super-admin'){
        $sales = Sale::with('customer')->latest()->paginate(50);

        }else{

            $sales = $user->sales()->paginate(50);
        }
        $customers = Customer::latest()->get();
        $products = Product::latest()->get();
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'products' => $products,
            'customers' => $customers,
        ]);
    }
    public function qtyCheck(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);

        $quantity = \App\Models\ProductInventory::where('product_id', $request->product_id)
            ->where('warehouse_id', $request->warehouse_id)
            ->value('quantity') ?? 0;
        //send avilable qty in requested warehouse and send avilabe qtys in all warehouses for that product     
        $allQuantities = \App\Models\ProductInventory::where('product_id', $request->product_id)
            ->pluck('quantity', 'warehouse_id');
            //send warehousename with qty

            $allQuantities = $allQuantities->mapWithKeys(function ($qty, $warehouse_id) {
                $warehouse = Warehouse::find($warehouse_id);
                return [$warehouse->name => $qty];
            });
        return response()->json(['available_qty' => $quantity, 'all_quantities' => $allQuantities]);
    }
    public function store(Request $request)
    {
      // dd($request->all());
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.inv' => 'required|exists:warehouses,id',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);
        $data = $request->validate([
            'date' => 'required|date|max:255',
            'customer_id' => 'required|exists:customers,id',
            'representative_id' => 'nullable|exists:representatives,id',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'subtotal' => 'required|numeric',
            'collected' => 'nullable|numeric',
            'postponed' => 'required|numeric',
            'tax' => 'required|numeric',
            'expenses' => 'required|numeric',
        ]);
        
        //generate internal_id and invoice_number
        $nextNumber = Sale::max('id') + 1;
        $data['user_id'] = auth()->id();
        $data['internal_id'] = 'SYS-' . date('Y') . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
        $data['invoice_number'] = date('Y') . '/' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        $data['issued_at']   = now();

      /*   $representative = Representative::find($data['representative_id']);
        if ($representative) {
            $data['customer_branch_id'] = $representative->customer_branch_id;
        } */
        //create sale
        $sale = Sale::create($data);

        //create items
        foreach ($validated['items'] as $item) {
        $product = \App\Models\Product::find($item['product_id']);
            SalesItem::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'product_code' => $product->internal_code,
                'qty' => $item['qty'],
                'unit_price' => $item['unit_price'],
                'total' => $item['unit_price'] * $item['qty'],
                'product_name' => $product->name,
            ]);
            
       
            $this->inventoryService->recordMovement([
                'product_id' => $item['product_id'],
                'type' => 'sale',
                'quantity' => $item['qty'],
                'prev_quantity' => $product->total_quantity,
                'movement_type' => 'deduction',
                'from_warehouse_id' => auth()->user()->warehouse_id,
            ]);
        }

        return redirect()->back()->with('success', 'تم  الانشاء');
    }
public function show($id)
    {
          $sale = Sale::with(['customer', 'items' ,'items.product' ,'user'])->findOrFail($id);

         return Inertia::render('Sales/Show', [
            'invoice' => $sale,
        ]);

    }
    public function destroy(Sale $sale)
    {
        try {

            $sale->delete();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ أثناء الحذف: ' . $e->getMessage());   
        }
        return redirect()->back()->with('success', 'تم حذف الفاتورة');
    }
}
