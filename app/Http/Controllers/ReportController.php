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


}
