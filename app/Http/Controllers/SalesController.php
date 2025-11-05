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

    public function index($maintainance = null )
    {
        
        $user = auth()->user();
        $inv = \App\Models\Warehouse::where('id', $user->warehouse_id)->first();
       
        $customers = Customer::with('representatives')->latest()->get();        
        $users = \App\Models\User::with('warehouse')->where('type', 'user')->get();
        $technicians = \App\Models\User::with('warehouse')->where('type', 'technician')->get();
        $warehouses = Warehouse::where('id', $user->warehouse_id)->get();
        if($maintainance == 'maintainance'){
            $products = Product::latest()->where('maintainance', true)->get();
            $maintainance = true;
        } else {
            $products = Product::latest()->where('maintainance', false)->get();
             $maintainance = false;
        }
        return Inertia::render('Sales/New', [
            'products' => $products,
            'maintainance' => $maintainance,
            'users' => $users,
            'technicians' => $technicians,
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

    public function invoicesOld($maintainance = null , $type = null)
    {
        
        $user = auth()->user();
        $role = $user->roles;
        $query = Sale::query();
         $allowed = auth()->user()->warehouseIds();
        $title = 'كل الفواتير';
         if($maintainance == 'maintainance'){
            if(count($allowed) < 1 ){

                $query->where('maintainance', true);
            }
           
            $maintainance = true;
        } else {

              if(count($allowed) < 1 ){

                $query->where('maintainance', false);
            }
             $maintainance = false;
        }
    // حسب نوع الفواتير (invoice / quote / الكل)
            if ($type === 'invoices') {
                $query->where('is_invoice', 1);
                $title = 'الفواتير';
            } elseif ($type === 'quotes') {
                //dd($type);
                $query->where('is_invoice', 0);
                $title = 'بيان اسعار';
            } elseif ($type === 'draft') {
                
                $query->where('eta_status', null)->where('marked_to_draft', true);
               // dd($query->get());
                $title = 'المسودات';
            } elseif ($type === 'sent') {
                $query->where('eta_status', 'sent');
                $title = 'تم ارساله للمنظومة';
            }else{
               $query = $query;
            }
        if ($role[0]->slug === 'super-admin') {
          
            $sales = $query->with(['customer', 'user', 'creator'])
                       ->latest()
                       ->paginate(50);

        } else {
            // draft allowed warehouses
             
              //dd($allowed);
           if (count($allowed) > 0) {

                    $query->where(function($q) use ($user, $allowed) {
                        $q->where('user_id', $user->id)
                        ->orWhereHas('user', function($qq) use ($allowed) {
                            $qq->whereIn('warehouse_id', $allowed);
                        });
                    });
                    $sales = $query->with('customer', 'user', 'creator')
                            ->latest()
                            ->paginate(50);
                } else {
                $sales = $query->where('user_id', $user->id)->with('customer', 'user' ,'creator')->latest()->paginate(50);
                

            }

            }
            
            if($maintainance == 'maintainance'){
                $maintainance = true;
            } else {
                $maintainance = false;
            }
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'title' => $title,
        ]);
    }
        public function invoices($maintainance = null, $type = null)
        {
            $user = auth()->user();
            if (!$user) {
                abort(403, 'غير مصرح');
            }
        $allowed = method_exists($user, 'warehouseIds')
                    ? (array) $user->warehouseIds()
                    : $user->warehouses()->pluck('id')->map(fn($v) => (int)$v)->toArray();
            // بناء الاستعلام الأساسي
            $query = Sale::query();
            $title = 'كل الفواتير';

            // -------------------------
            // 1) فلتر الصيانة (maintainance)
            // -------------------------
            // نعامل ثلاثة حالات: 'maintainance' أو true/1
            if($maintainance == 'maintainance'){
            if(count($allowed) < 1 ){

                $query->where('maintainance', true);
            }
           
            $maintainance = true;
        } else {

              if(count($allowed) < 1 ){

                $query->where('maintainance', false);
            }
             $maintainance = false;
        }
            // -------------------------
            // 2) فلتر النوع (type)
            // -------------------------
            if ($type === 'invoices') {
                $query->where('is_invoice', 1);
                $title = 'الفواتير';
            } elseif ($type === 'quotes') {
                $query->where('is_invoice', 0);
                $title = 'بيان اسعار';
            } elseif ($type === 'draft') {
                // شرط الدرافت حسب طلبك: marked_to_draft = true و eta_status IS NULL
                $query->whereNull('eta_status')->where('marked_to_draft', true);
                $title = 'المسودات';
            } elseif ($type === 'sent') {
                $query->where('eta_status', 'sent');
                $title = 'تم ارساله للمنظومة';
            }
            // else: نترك كل الفواتير حسب الفلاتر السابقة

            // -------------------------
            // 3) من هو السوبر-ادمن؟
            // -------------------------
            // لا تعتمد على $role[0] لأنها غير آمنة، استخرج الـ slugs بأمان
            $roleSlugs = $user->roles->pluck('slug')->toArray();
            $isSuperAdmin = in_array('super-admin', $roleSlugs, true);

            // -------------------------
            // 4) تطبيق قواعد الوصول
            //   - super-admin: يرى كل النتائج طبق الفلاتر أعلاه
            //   - غيره:
            //       * إذا عنده صلاحيات على فروع (allowed not empty):
            //           - لو type === 'draft' → يرى (فواتيره الخاصة) OR (فواتير المستخدمين الذين ينتمون للـ allowed warehouses)
            //           - غير ذلك → يرى فواتيره الخاصة فقط
            //       * إذا ليس له صلاحيات فروع → يرى فواتيره الخاصة فقط
            // -------------------------
            if ($isSuperAdmin) {
                $sales = $query->with(['customer', 'user', 'creator'])
                            ->latest()
                            ->paginate(50);
            } else {
                // جلب الفروع المسموح بها للمستخدم الحالي (تابع implement لديك)
                // افترض أنك لديك method warehouseIds() كما أشرت سابقًا، وإلا استعمل relation warehouses()
              
//dd($allowed);
                // لو عنده صلاحيات فرعية
                if (!empty($allowed)) {
                    if ($type === 'draft'|| $type === 'sent') {
                       // dd($query->get());
                        // يرى: فواتيره الخاصة OR فواتير المستخدمين الذين يخصهم allowed warehouses
                        $query->where(function ($q) use ($user, $allowed) {
                            $q->where('user_id', $user->id)
                            ->orWhereHas('user', function ($qq) use ($allowed) {
                                $qq->whereIn('warehouse_id', $allowed);
                            });
                        });

                        $sales = $query->with(['customer', 'user', 'creator'])
                                    ->latest()
                                    ->paginate(50);
                    } else {
                        // غير درافت: يرى فقط فواتيره الخاصة
                        $sales = $query->where('user_id', $user->id)
                                    ->with(['customer', 'user', 'creator'])
                                    ->latest()
                                    ->paginate(50);
                    }
                } else {
                    // ليس له أي صلاحية على فروع أخرى → يرى فواتيره الخاصة فقط
                    $sales = $query->where('user_id', $user->id)
                                ->with(['customer', 'user', 'creator'])
                                ->latest()
                                ->paginate(50);
                }
            }

       
//dd($sales);
            return Inertia::render('Sales/Index', [
                'sales' => $sales,
                'title' => $title,
            ]);
        }


    public function qtyCheck(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);
        $product = Product::find($request->product_id);
       
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
 if($product->type == 'service'){
            return response()->json(['available_qty' => 100 , 'all_quantities' => [], 'inv' =>$warehouse]);
        }
        return response()->json(['available_qty' => $quantity, 'all_quantities' => $allQuantities , 'inv' =>$warehouse]);
    }

    public function store(Request $request)
    {
    
   // dd($totalTransportation);
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.inv' => 'required|exists:warehouses,id',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);
        $data = $request->validate([
            'date' => 'required|date|max:255',
            'transportation' => 'nullable|numeric',
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
            'maintainance' => 'required|boolean',
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
        
    $totalTransportation = collect($request['technicians'])->sum('transportation');
    $data['transportation'] = ( $totalTransportation ?? 0);
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
        if($request->maintainance){
        // تسجيل عمولة الفنيين
        if ($request->has('technicians') && is_array($request->technicians)) {
            if (!$sale || !$sale->id) {
             // log or throw
            throw new \RuntimeException('Invoice not created, cannot attach technicians.');
        }
            foreach ($request->technicians as $tech) {
                if(isset($tech['commission_percent'])){
                    $transport = (float)($tech['transportation'] ?? 0);
                } else{
                      $transport = 0.00;
                }
                if (isset($tech['technician_id']) && isset($tech['commission_percent'])) {
                    
                    $sale->technicians()->attach($tech['technician_id'], [
                        'commission_percent' => $tech['commission_percent'],
                        'transportation' => $transport,
                    ]);
                }
            }
            $totalProfit = $sale->items->sum(function($item) {
               // dd($item->unit_price - $item->product->cost_price);
                return ($item->unit_price - $item->product->cost_price) * $item->qty;
            });   //1000
            $expenses = floatval($sale->expenses ?? 0); // 50
            $discoutVal = ( floatval($sale->subtotal ?? 0) /100) * ( $sale->discount_percentage ?? 0) ; // 200
            $afterDiscount = floatval($sale->subtotal ?? 0) - ($discoutVal ?? 0); //1800
            $otherTax = floatval($sale->other_tax ?? 0) ; // 3%
            $otherTaxValue =  $afterDiscount / 100 * $otherTax ; // 1800 /100 *3 = 54
            $profitAfterExpenses = $totalProfit - ($expenses) - ($discoutVal ?? 0) - ($otherTaxValue ?? 0); // 1000 - 50 - 200 - 54 = 696

            foreach ($sale->technicians as $tech) {
                $amount = $profitAfterExpenses * ($tech->pivot->commission_percent / 100);

//dd($amount);
                $tech->pivot->commission_amount = $amount;
                $tech->pivot->save();
            }
        }
    }

        return redirect()->back()->with('success', 'تم  الانشاء');
    }

    public function show($id)
    {
        $sale = Sale::with(['customer', 'items', 'items.product', 'user' ,'technicians','user.warehouse.branch'])->findOrFail($id);

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
      public function draft($id)
    {
       // dd('here');
        $sale = Sale::with(['customer', 'items', 'items.product', 'user' ,'user.warehouse.branch'])->findOrFail($id);

         $warehouseId = $sale->user?->warehouse?->id;
        //dd($warehouseId);
        // dd(auth()->user()->hasAccessToWarehouse($warehouseId));
         if (!auth()->user()->hasAccessToWarehouse($warehouseId)) {
            abort(403, 'غير مسموح لك بإدارة فواتير هذا الفرع');
        }
        return Inertia::render('Sales/Draft', [
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
}

    public function toggleMarkDraft(Request $request, Sale $invoice)
    {
       // dd($request->all());
        $request->validate([
            'marked_to_draft' => 'required|boolean',
        ]);

        $invoice->marked_to_draft = $request->marked_to_draft;
        $invoice->save();

        if ($request->expectsJson()) {
    // الرد على axios أو fetch أو أي API call
   
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة المسودة بنجاح',
            'is_delivered' => $invoice->is_delivered,
        ]);

    }

// الرد على Inertia form أو POST عادي
return back()->with('success', 'تم تحديث حالة المسودة بنجاح');
    }
      public function toggleDraft(Request $request, Sale $invoice)
    {
        $warehouseId = $invoice->user?->warehouse?->id;
         if (!auth()->user()->hasAccessToWarehouse($warehouseId)) {
            abort(403, 'غير مسموح لك بإدارة فواتير هذا الفرع');
        }
        $request->validate([
            'draft' => 'nullable|string|in:draft,sent',
        ]);

        $invoice->eta_status = $request->draft;
        $invoice->save();

        if ($request->expectsJson()) {
    // الرد على axios أو fetch أو أي API call
   
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة المسودة بنجاح',
            'is_delivered' => $invoice->is_delivered,
        ]);
}

// الرد على Inertia form أو POST عادي
return back()->with('success', 'تم تحديث حالة المسودة بنجاح');
    }

    // ✅ لتحديث المبلغ المحصل
    public function updateCollection(Request $request, Sale $invoice)
    {
        $request->validate([
            'collected_amount' => 'required|numeric|min:0',
        ]);

        $invoice->collected = $request->collected_amount;
        $invoice->postponed = $invoice->total - $invoice->collected;
        $invoice->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المبلغ المحصل بنجاح',
            'collected_amount' => $invoice->collected_amount,
            'postponed' => $invoice->postponed,
        ]);
    }
}
