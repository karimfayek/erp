<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Representative;
use App\Models\Sale;
use App\Models\SalesItem;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $users = \App\Models\User::with('warehouse')->get();
        $customers = Customer::with('representatives')->latest()->get();
        $products = Product::latest()->get();
        $warehouses = Warehouse::where('id', $user->warehouse_id)->get();

        return Inertia::render('Sales/New', [
            'sales' => $sales,
            'products' => $products,
            'users' => $users,
            'user' => $user,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'inventory' => $inv,
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
                    ->unique(fn ($rep) => $rep['id'])
                    ->values();

                return [$customer->id => $allReps];
            }),

        ]);
    }

    public function invoices()
    {
        $user = auth()->user();
        $role = $user->roles;
        // dd($role[0]);
        if ($role[0]->slug === 'super-admin') {
            $sales = Sale::with('customer', 'user' ,'creator')->latest()->paginate(50);

        } else {

            $sales = $user->sales()->with('user' , 'customer','creator')->paginate(50);
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
        // send avilable qty in requested warehouse and send avilabe qtys in all warehouses for that product
        $allQuantities = \App\Models\ProductInventory::where('product_id', $request->product_id)
            ->pluck('quantity', 'warehouse_id');
        // send warehousename with qty

        $allQuantities = $allQuantities->mapWithKeys(function ($qty, $warehouse_id) {
            $warehouse = Warehouse::find($warehouse_id);

            return [$warehouse->name => $qty];
        });
$warehouse = Warehouse::where('id' ,  $request->warehouse_id)->get();
        return response()->json(['available_qty' => $quantity, 'all_quantities' => $allQuantities , 'inv' =>$warehouse]);
    }

    public function store(Request $request)
    {
      //dd($request->all());
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
            'user_id' => 'required|exists:users,id',
            'representative_id' => 'nullable|exists:representatives,id',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'subtotal' => 'required|numeric',
            'total' => 'required|numeric',
            'collected' => 'nullable|numeric',
            'postponed' => 'required|numeric',
            'tax' => 'required|numeric',
            'other_tax' => 'nullable|numeric',
            'expenses' => 'required|numeric',
            'document_type' => 'required',
            'invoice_type' => 'required',
            'payment_method' => 'required',
            'is_delivered' => 'required|boolean',
            'is_invoice' => 'required|boolean',
        ]);

        $user = \App\Models\User::find($data['user_id']);
        $branchCode = $user->warehouse->branch->code ;
      
       $nextId = Sale::max('id') + 1;
        $data['internal_id'] = 'SYS-' . date('Y') . '-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

        // تسلسل منفصل لكل نوع
        if ($data['is_invoice']) {
            // فواتير عادية
            $nextInvoiceNumber = Sale::where('is_invoice', 1)->count() + 1;
            $data['invoice_number'] = 'INV/' . date('Y') . '/' . str_pad($nextInvoiceNumber, 4, '0', STR_PAD_LEFT). '/' . $branchCode;
        } else {
            // بيانات أسعار
            $nextQuotationNumber = Sale::where('is_invoice', 0)->count() + 1;
            $data['invoice_number'] = 'QTN/' . date('Y') . '/' . str_pad($nextQuotationNumber, 4, '0', STR_PAD_LEFT). '/' . $branchCode;
        }
        $data['issued_at'] = now();
        
        $data['created_by'] = auth()->id();

        /*   $representative = Representative::find($data['representative_id']);
          if ($representative) {
              $data['customer_branch_id'] = $representative->customer_branch_id;
          } */
        // create sale
        $sale = Sale::create($data);
        // create items
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
                'from_warehouse_id' =>$user->warehouse_id,
            ]);
        }

        return redirect()->back()->with('success', 'تم  الانشاء');
    }

    public function show($id)
    {
        $sale = Sale::with(['customer', 'items', 'items.product', 'user' ,'user.warehouse.branch'])->findOrFail($id);

        return Inertia::render('Sales/Show', [
            'invoice' => $sale,
        ]);

    }
     public function details($id)
    {
        $sale = Sale::with(['customer', 'items', 'items.product', 'user' ,'user.warehouse.branch'])->findOrFail($id);

        return Inertia::render('Sales/Details', [
            'invoice' => $sale,
        ]);

    }

    public function destroy(Sale $sale)
    {
        try {
            foreach ($sale->items as $item) {
                // dd($item);
                $this->inventoryService->recordMovement([
                    'product_id' => $item['product_id'],
                    'type' => 'in',
                    'notes' => 'مسح فاتورة',
                    'quantity' => $item['qty'],
                    'prev_quantity' => $item->product->total_quantity,
                    'movement_type' => 'adjustment',
                    'to_warehouse_id' => $sale->user->warehouse_id,
                ]);
            }

        } catch (\Exception $e) {
            dd($e);

            return redirect()->back()->with('error', 'حدث خطأ أثناء تعديل المخزون: '.$e->getMessage());
        }
        try {

            $sale->delete();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ أثناء الحذف: '.$e->getMessage());
        }

        return redirect()->back()->with('success', 'تم حذف الفاتورة');
    }
    public function toggleDelivery(Request $request, Sale $invoice)
    {
        $request->validate([
            'delivered' => 'required|boolean',
        ]);

        $invoice->is_delivered = $request->delivered;
        $invoice->save();

        if ($request->expectsJson()) {
    // الرد على axios أو fetch أو أي API call
   
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة التسليم بنجاح',
            'is_delivered' => $invoice->is_delivered,
        ]);
}

// الرد على Inertia form أو POST عادي
return back()->with('success', 'تم تحديث حالة التسليم بنجاح');
    }

    // ✅ لتحديث المبلغ المحصل
    public function updateCollection(Request $request, Sale $invoice)
    {
        $request->validate([
            'collected_amount' => 'required|numeric|min:0',
        ]);

        $invoice->collected = $request->collected_amount;
        $invoice->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المبلغ المحصل بنجاح',
            'collected_amount' => $invoice->collected_amount,
        ]);
    }
}
