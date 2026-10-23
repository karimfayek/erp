<?php
// app/Http/Controllers/ReportController.php
namespace App\Http\Controllers;

use App\Models\Sale as Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
class ReportController extends Controller
{
    public function Dashboard()
    {
        $user = auth()->user();

        // هل المستخدم سوبر أدمن وله صلاحية تجاوز الفلترة؟
        $isSuperAdmin = $user->hasPermission('bypass');
        $invoicesQuery = Invoice::query()->whereDate('date', Carbon::today());

        //  لو ليس سوبر أدمن يتم فلترة الفواتير حسب الـ branch_id
        if (!$isSuperAdmin && $user->warehouse) {
            $branchId = $user->warehouse->branch_id;

            $invoicesQuery->whereHas('user.warehouse', function ($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            });
        }
        return Inertia::render(
            'dashboard',
            [
                'stats' => [
                    'branches' => \App\Models\Branch::count(),
                    'warehouses' => \App\Models\Warehouse::count(),
                    'products' => \App\Models\Product::count(),
                    'transfers' => \App\Models\InventoryTransfer::whereDate('created_at', today())->count(),
                    'sales' => (clone $invoicesQuery)->sum('total'),
                ],
                'dailySales' => (clone $invoicesQuery)
                    ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                    ->groupBy(\DB::raw('DATE(created_at)'))
                    ->orderBy('date')
                    ->get()
                    ->map(function ($row) {
                        return [
                            'date' => Carbon::parse($row->date)->toDateString(),
                            'total' => $row->total,
                        ];
                    }),
            ]
        );

    }
    public function index(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasPermission('bypass');
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);
        $invoicesQuery = Invoice::query();

        // لو مش سوبر أدمن نفلتر بالـ branch_id
        if (!$isSuperAdmin && $user->warehouse) {
            $branchId = $user->warehouse->branch_id;

            $invoicesQuery->whereHas('user.warehouse', function ($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            });
        }
        // Total sales
        $totalSales = (clone $invoicesQuery)
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');

        // Daily sales
        $dailySales = (clone $invoicesQuery)
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
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
        $userSales = (clone $invoicesQuery)
            ->selectRaw('user_id, SUM(total) as total')
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
        $latestInvoices = (clone $invoicesQuery)
            ->with('customer:id,name,phone,company_name,address')
            ->latest()
            ->take(10)
            ->get();


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
        $user = auth()->user();
        $isSuperAdmin = $user->hasPermission('bypass');
        if (!$isSuperAdmin) {

            $branch = \App\Models\Branch::find($branch_id);
        } else {
            $branch_id = $user->warehouse->branch_id;
            $branch = \App\Models\Branch::find($branch_id);
        }
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Total sales
        $totalSales = Invoice::whereBetween('created_at', [$start, $end])
            ->whereHas('user.warehouse', function ($query) use ($branch_id) {
                $query->where('branch_id', $branch_id);
            })
            ->sum('total');

        // Daily sales
        $dailySales = Invoice::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('user.warehouse', function ($query) use ($branch_id) {
                $query->where('branch_id', $branch_id);
            })
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => Carbon::parse($row->date)->toDateString(),
                    'total' => $row->total,
                ];
            });
        $userSales = Invoice::selectRaw('user_id, SUM(total) as total')
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
        $latestInvoices = Invoice::with('customer:id,name,phone,company_name,address')
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
            'userSales' => $userSales,
            'branch' => $branch
        ]);
    }
    public function user(Request $request, $user_id)
    {
        $user = \App\Models\User::find($user_id);
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end = $request->get('end', Carbon::now()->endOfMonth());

        // Normalize to Carbon instances
        $start = $start instanceof Carbon ? $start : Carbon::parse($start);
        $end = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Total sales
        $totalSales = Invoice::whereBetween('created_at', [$start, $end])
            ->where('user_id', $user_id)
            ->sum('total');

        // Daily sales
        $dailySales = Invoice::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->whereBetween('created_at', [$start, $end])
            ->where('user_id', $user_id)
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => Carbon::parse($row->date)->toDateString(),
                    'total' => $row->total,
                ];
            });

        $userSales = Invoice::selectRaw('user_id, SUM(total) as total')
            ->whereBetween('created_at', [$start, $end])
            ->where('user_id', $user_id)
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
        $latestInvoices = Invoice::with('customer:id,name,phone,company_name,address')
            ->where('user_id', $user_id)
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

    // تقرير المصاريف: كل فرع صرف كام / كل الفروع من تاريخ لتاريخ + حسب التصنيف والمستخدم
    public function expenses(Request $request)
    {
        $user = auth()->user();
        $canChooseBranch = $user->canDo('Expenses choose branch');

        $from = $request->filled('from_date') ? Carbon::parse($request->from_date)->startOfDay() : Carbon::now()->startOfMonth();
        $to = $request->filled('to_date') ? Carbon::parse($request->to_date)->endOfDay() : Carbon::now()->endOfMonth();

        $query = \App\Models\Expense::with(['branch:id,name', 'category:id,name', 'user:id,name'])
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()]);

        // غير المخول لاختيار الفرع → فرعه فقط
        $myBranchId = $user->warehouse?->branch_id;
        if (!$canChooseBranch) {
            if ($myBranchId) {
                $query->where('branch_id', $myBranchId);
            }
            $branches = \App\Models\Branch::where('id', $myBranchId)->select('id', 'name')->get();
        } else {
            $branches = \App\Models\Branch::select('id', 'name')->orderBy('name')->get();
            if ($request->filled('branch_id') && $request->branch_id !== 'all') {
                $query->where('branch_id', $request->branch_id);
            }
        }

        $categories = \App\Models\ExpenseCategory::select('id', 'name')->orderBy('name')->get();
        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // المستخدمين للفلتر (حسب الصلاحية: فرعي أو الكل)
        if ($canChooseBranch) {
            $users = \App\Models\User::select('id', 'name')->orderBy('name')->get();
        } else {
            $users = \App\Models\User::whereHas('warehouse', function ($q) use ($myBranchId) {
                $q->where('branch_id', $myBranchId);
            })->select('id', 'name')->orderBy('name')->get();
        }

        // الإجمالي
        $totalExpenses = (clone $query)->sum('amount');
        $countExpenses = (clone $query)->count();

        // مصروف كل فرع
        $byBranch = (clone $query)
            ->selectRaw('branch_id, SUM(amount) as total, COUNT(*) as cnt')
            ->groupBy('branch_id')
            ->with('branch:id,name')
            ->get()
            ->map(fn($row) => [
                'branch' => $row->branch?->name ?? 'بدون فرع',
                'branch_id' => $row->branch_id,
                'total' => (float) $row->total,
                'count' => (int) $row->cnt,
            ])
            ->sortByDesc('total')->values();

        // حسب التصنيف
        $byCategory = (clone $query)
            ->selectRaw('category_id, SUM(amount) as total, COUNT(*) as cnt')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($row) => [
                'category' => $row->category?->name ?? 'بدون تصنيف',
                'total' => (float) $row->total,
                'count' => (int) $row->cnt,
            ])
            ->sortByDesc('total')->values();

        // يومي
        $daily = (clone $query)
            ->selectRaw('DATE(date) as date, SUM(amount) as total')
            ->groupBy(\DB::raw('DATE(date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date' => Carbon::parse($row->date)->toDateString(),
                'total' => (float) $row->total,
            ]);

        // حسب المستخدم (توب)
        $byUser = (clone $query)
            ->selectRaw('user_id, SUM(amount) as total, COUNT(*) as cnt')
            ->groupBy('user_id')
            ->with('user:id,name')
            ->get()
            ->map(fn($row) => [
                'user' => $row->user?->name ?? 'غير محدد',
                'total' => (float) $row->total,
                'count' => (int) $row->cnt,
            ])
            ->sortByDesc('total')->values()->take(10);

        $days = max(1, $from->diffInDays($to) + 1);

        $expensesList = (clone $query)->latest('date')->latest('id')->paginate(15)->withQueryString();

        return Inertia::render('Reports/Expenses', [
            'filters' => [
                'from_date' => $from->toDateString(),
                'to_date' => $to->toDateString(),
                'branch_id' => $request->get('branch_id', 'all'),
                'category_id' => $request->get('category_id', 'all'),
                'user_id' => $request->get('user_id', 'all'),
            ],
            'branches' => $branches,
            'categories' => $categories,
            'users' => $users,
            'canChooseBranch' => $canChooseBranch,
            'info' => [
                'total' => (float) $totalExpenses,
                'count' => (int) $countExpenses,
                'avgDaily' => round((float) $totalExpenses / $days, 2),
                'maxExpense' => (float) ((clone $query)->max('amount') ?? 0),
            ],
            'byBranch' => $byBranch,
            'byCategory' => $byCategory,
            'daily' => $daily,
            'byUser' => $byUser,
            'expenses' => $expensesList,
        ]);
    }
    public function invoices(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasPermission('bypass');
        if ($isSuperAdmin) {
            $reps = \App\Models\User::select('id', 'name')->get();
            $customers = \App\Models\Customer::select('id', 'name', 'phone', 'company_name', 'address')->get();
            $branches = \App\Models\Branch::select('id', 'name')->get();
            $query = Invoice::with(['user', 'items.product', 'customer']);
        } else {
            $branchId = $user->warehouse->branch_id;
            $reps = \App\Models\User::whereHas('warehouse', function ($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            })->select('id', 'name')->get();
            $customers = \App\Models\Customer::whereHas('user.warehouse', function ($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            })->select('id', 'name', 'phone', 'company_name', 'address')->get();
            $branches = \App\Models\Branch::where('id', $user->warehouse->branch_id)->select('id', 'name')->get();
            $branchId = $user->warehouse->branch_id;

            $query = Invoice::with(['user', 'items.product', 'customer'])
                ->whereHas('user.warehouse', function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId);
                });
        }
        // $query->withSum('collections', 'amount');
        //dd($query->collections_sum_amount);
        // فلتر التسليم
        if ($request->filled('delivery') && $request->delivery !== 'all') {
            if ($request->delivery === 'delivered') {
                $query->where('is_delivered', 1);
            } elseif ($request->delivery === 'pending') {
                $query->where('is_delivered', 0);
            }
        }

        // فلتر التحصيل
        if ($request->filled('collection') && $request->collection !== 'all') {
            if ($request->collection === 'collected') {
                // محصلة بالكامل
                $query->whereRaw('total <= (
            SELECT COALESCE(SUM(amount), 0)
            FROM collections
            WHERE collections.sale_id = sales.id
        )');
            } elseif ($request->collection === 'partial') {
                // محصلة جزئياً
                $query->whereRaw('
            (SELECT COALESCE(SUM(amount), 0)
             FROM collections
             WHERE collections.sale_id = sales.id) > 0
            AND
            (SELECT COALESCE(SUM(amount), 0)
             FROM collections
             WHERE collections.sale_id = sales.id) < sales.total
        ');
            } elseif ($request->collection === 'uncollected') {
                // غير محصلة نهائياً
                $query->whereRaw('
            (SELECT COALESCE(SUM(amount), 0)
             FROM collections
             WHERE collections.sale_id = sales.id) <= 0
        ');
            }
        }
        if ($request->rep && $request->rep != 'all') {
            $query->where('user_id', $request->rep);
        }
        if ($request->invoice_q && $request->invoice_q != 'all') {
            $query->where('is_invoice', $request->invoice_q);
        }
        if ($request->branch && $request->branch != 'all') {
            // dd($request->branch);
            $query->whereHas('user.warehouse.branch', function ($q) use ($request) {
                $q->where('id', $request->branch);
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
        $from = $request->from_date;
        $to = $request->to_date;
        // $query->withSum('collections as collected_amount', 'amount');
        $query->with([
            'collections' => function ($q) use ($from, $to) {
                $q->when($from, fn($q2) => $q2->whereDate('collection_date', '>=', $from))
                    ->when($to, fn($q2) => $q2->whereDate('collection_date', '<=', $to));
            }
        ]);

        $invoicesInfo = $query->get();

        $collected = $invoicesInfo
            ->flatMap(fn($invoice) => $invoice->collections)
            ->sum('amount');
        //dd($invoicesInfo);

        $taxAmount = $query->sum('tax');
        $OtherTaxAmount = $query->sum('other_tax_val');
        $expenses = $query->sum('expenses');
        $invoices = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        //dd($invoicesInfo);
        $totals = $invoicesInfo->reduce(function ($carry, $invoice) {

            $collected = $invoice->collectedAmount();

            if ($collected <= 0 || $invoice->total <= 0) {
                return $carry;
            }

            $ratio = $collected / $invoice->total;

            $carry['vat'] += $ratio * $invoice->tax;
            $carry['other_tax'] += $ratio * $invoice->other_tax_val;

            return $carry;

        }, [
            'vat' => 0,
            'other_tax' => 0,
        ]);
        $totalCollectedTax = $totals['vat'];
        $totalCollectedOtherTax = $totals['other_tax'];

        // Calculate tax breakdown fields for report footer
        $otherTax1Collected = 0;
        $otherTax3Collected = 0;
        $otherTax1Pending = 0;
        $otherTax3Pending = 0;
        $netTaxCollected = 0;
        $netTaxPending = 0;
        $vat14Collected = 0;
        $vat14Pending = 0;
        foreach ($invoicesInfo as $invoice) {
            $collectedAmount = (float) $invoice->collectedAmount();
            $invoiceTotal = (float) $invoice->total;

            $isCollectedFully = $invoiceTotal > 0
                && $collectedAmount >= $invoiceTotal;

            $taxVal = (float) ($invoice->tax ?? 0);

            if ($isCollectedFully) {
                $vat14Collected += $taxVal;
            } else {
                $vat14Pending += $taxVal;
            }

            $collectedAmount = (float) $invoice->collectedAmount();
            $invoiceTotal = (float) $invoice->total;

            $isCollectedFully = $invoiceTotal > 0
                && $collectedAmount >= $invoiceTotal;

            $otherTaxPercent = (float) ($invoice->other_tax ?? 0);
            $otherTaxVal = (float) ($invoice->other_tax_val ?? 0);
            $taxVal = (float) ($invoice->tax ?? 0);

            // الضريبة الصافية بدون الضرائب الأخرى
            $netTaxVal = $taxVal - $otherTaxVal;

            if ($isCollectedFully) {

                // الفواتير المحصلة بالكامل

                if ($otherTaxPercent == 1) {
                    $otherTax1Collected += $otherTaxVal;
                } elseif ($otherTaxPercent == 3) {
                    $otherTax3Collected += $otherTaxVal;
                }

                $netTaxCollected += $netTaxVal;

            } else {

                // الفواتير غير المحصلة أو المحصلة جزئياً

                if ($otherTaxPercent == 1) {
                    $otherTax1Pending += $otherTaxVal;
                } elseif ($otherTaxPercent == 3) {
                    $otherTax3Pending += $otherTaxVal;
                }

                $netTaxPending += $netTaxVal;
            }
        }

        //dd($totalCollectedTax);

        $customers = \App\Models\Customer::select('id', 'name', 'phone', 'company_name', 'address')->get();
        //dd($collected);
        return Inertia::render('Reports/Invoices', [
            'invoices' => $invoices,
            'reps' => $reps,
            'branches' => $branches,
            'customers' => $customers,
            'info' => [
                'invoicesTotals' => $invoicesInfo->sum('total'),
                'collected' => number_format((float) $collected, 2, '.', ','),
                'postponed' => $invoicesInfo->sum('postponed'),
                'expenses' => number_format((float) $expenses, 2, '.', ','),
                'taxAmount' => number_format((float) $taxAmount, 2, '.', ','),
                'OtherTaxAmount' => number_format((float) $OtherTaxAmount, 2, '.', ','),
                'totalCollectedTax' => number_format((float) $totalCollectedTax, 2, '.', ','),
                'totalCollectedOtherTax' => number_format((float) $totalCollectedOtherTax, 2, '.', ','),

                // Tax breakdown fields for report footer
                'otherTax1Collected' => number_format((float) $otherTax1Collected, 2, '.', ','),
                'otherTax3Collected' => number_format((float) $otherTax3Collected, 2, '.', ','),
                'otherTax1Pending' => number_format((float) $otherTax1Pending, 2, '.', ','),
                'otherTax3Pending' => number_format((float) $otherTax3Pending, 2, '.', ','),
                'netTaxCollected' => number_format((float) $netTaxCollected, 2, '.', ','),
                'netTaxPending' => number_format((float) $netTaxPending, 2, '.', ','),
                'vat14Collected' => number_format((float) $vat14Collected, 2, '.', ','),
                'vat14Pending' => number_format((float) $vat14Pending, 2, '.', ','),
            ]
        ]);
    }

}

