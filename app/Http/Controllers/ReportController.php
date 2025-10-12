<?php
// app/Http/Controllers/ReportController.php
namespace App\Http\Controllers;

use App\Models\Sale as Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end   = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Total sales
        $totalSales = Invoice::whereBetween('created_at', [$start, $end])
            ->sum('subtotal');

        // Daily sales
        $dailySales = Invoice::selectRaw('DATE(created_at) as date, SUM(subtotal) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
            return [
                'date' => Carbon::parse($row->date)->toDateString(),
                'total' => $row->total,
            ];
            });

        // User sales
        $userSales = Invoice::selectRaw('user_id, SUM(subtotal) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('user_id')
            ->with('user:id,name')
            ->get()
            ->map(function ($row) {
            return [
                'user' => $row->user->name ?? 'غير محدد',
                'total' => $row->total,
            ];
            });
        // Latest invoices
        $latestInvoices = Invoice::with('customer:id,name')->latest()->take(10)->get();
        

        return Inertia::render('Reports/Dashboard', [
            'filters' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
             'totalSales' => $totalSales,
            'dailySales' => $dailySales,
            'userSales' => $userSales,
            'latestInvoices' => $latestInvoices,
        ]);
    }



     public function branch(Request $request, $branch_id)
    {
        $branch = \App\Models\Branch::find($branch_id);
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end   = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Total sales
       $totalSales = Invoice::whereBetween('created_at', [$start, $end])
    ->whereHas('user.warehouse', function ($query) use ($branch_id) {
        $query->where('branch_id', $branch_id);
    })
    ->sum('subtotal');

        // Daily sales
       $dailySales = Invoice::selectRaw('DATE(created_at) as date, SUM(subtotal) as total')
    ->whereBetween('created_at', [$start, $end])
    ->whereHas('user.warehouse', function ($query) use ($branch_id) {
        $query->where('branch_id', $branch_id);
    })
    ->groupBy(\DB::raw('DATE(created_at)'))
    ->orderBy('date')
    ->get()
    ->map(function ($row) {
        return [
            'date' => \Carbon\Carbon::parse($row->date)->toDateString(),
            'total' => $row->total,
        ];
    });
       $userSales = Invoice::selectRaw('user_id, SUM(subtotal) as total')
    ->whereBetween('created_at', [$start, $end])
    ->whereHas('user.warehouse', function ($query) use ($branch_id) {
        $query->where('branch_id', $branch_id);
    })
    ->groupBy('user_id')
    ->with('user:id,name')
    ->get()
    ->map(function ($row) {
        return [
            'user' => $row->user->name ?? 'غير محدد',
            'total' => $row->total,
        ];
    });
       
        // Latest invoices
        $latestInvoices = Invoice::with('customer:id,name')
        ->whereHas('user.warehouse', function ($query) use ($branch_id) {
        $query->where('branch_id', $branch_id);
    })
        ->latest()->take(10)->get();
        

        return Inertia::render('Reports/Branch', [
            'filters' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
             'totalSales' => $totalSales,
            'dailySales' => $dailySales,
            'latestInvoices' => $latestInvoices,
            'userSales' => $userSales ,
            'branch' => $branch
        ]);
    }
     public function user(Request $request, $user_id)
    {
        $user = \App\Models\User::find($user_id);
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end   = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Total sales
       $totalSales = Invoice::whereBetween('created_at', [$start, $end])
    ->where('user_id' , $user_id)
    ->sum('subtotal');

        // Daily sales
       $dailySales = Invoice::selectRaw('DATE(created_at) as date, SUM(subtotal) as total')
    ->whereBetween('created_at', [$start, $end])
    ->where('user_id' , $user_id)
    ->groupBy(\DB::raw('DATE(created_at)'))
    ->orderBy('date')
    ->get()
    ->map(function ($row) {
        return [
            'date' => \Carbon\Carbon::parse($row->date)->toDateString(),
            'total' => $row->total,
        ];
    });
    
          $userSales = Invoice::selectRaw('user_id, SUM(subtotal) as total')
    ->whereBetween('created_at', [$start, $end])
  ->where('user_id' , $user_id)
    ->groupBy('user_id')
    ->with('user:id,name')
    ->get()
    ->map(function ($row) {
        return [
            'user' => $row->user->name ?? 'غير محدد',
            'total' => $row->total,
        ];
    });
        // Latest invoices
        $latestInvoices = Invoice::with('customer:id,name')
        ->where('user_id' , $user_id)
        ->latest()->take(10)->get();
        

        return Inertia::render('Reports/User', [
            'filters' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
             'totalSales' => $totalSales,
            'dailySales' => $dailySales,
            'latestInvoices' => $latestInvoices,
            'user' => $user,
            'userSales' => $userSales
        ]);
    }
public function invoices(Request $request)
{
     $query =  \App\Models\Sale::with(['user', 'items.product', 'customer']);
       if ($request->status === 'delivered') {
            $query->where('is_delivered', 1);
        } elseif ($request->status === 'pending') {
            $query->where('is_delivered', 0);
        } elseif ($request->status === 'partial') {
            $query->whereColumn('collected', '<', 'total');
        }
        if ($request->rep && $request->rep != 'all') {
            $query->where('user_id', $request->rep);
        }
          if ($request->product && $request->product != 'all') {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('product_id', $request->product);
            });
        }
         if ($request->customer && $request->customer != 'all') {
           
            $query->where('customer_id', $request->customer);
        }
           if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }
        if ($request->filled('from_date')) {
    $query->whereDate('date', '>=', $request->from_date);
}

if ($request->filled('to_date')) {
    $query->whereDate('date', '<=', $request->to_date);
}

          $invoicesInfo = $query->get();
          $collected = $query->sum('collected');
          $expenses= $query->sum('expenses');
         $invoices = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();
              
          //dd($invoicesInfo);
        $reps = \App\Models\User::select('id', 'name')->get();
        $products = \App\Models\Product::select('id', 'name')->get();
         $customers = \App\Models\Customer::select('id', 'name')->get();
            return Inertia::render('Reports/Invoices', [                    
                    'invoices' => $invoices,
                    'reps' => $reps,
                    'products' => $products,
                    'customers' => $customers,
                    'info' => [
                    'invoicesTotals' => $invoicesInfo->sum('total'),
                    'collected' =>number_format((float) $collected, 2, '.', ','),
                    'postponed' => $invoicesInfo->sum('postponed'),
                    'expenses' => number_format((float) $expenses, 2, '.', ','),
                    ]
                ]);
        }

}
