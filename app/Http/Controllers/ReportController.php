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
}
