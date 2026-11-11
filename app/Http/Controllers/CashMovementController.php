<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\CashMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashMovementController extends Controller
{

    public function index(Request $request)
    {
        $user = auth()->user();

        // Check permission
        $canSeeOtherBranchesCash = $user->canDo('can_see_other_branches_cash');

        // Get user's default branch
        $userBranchId = $user?->warehouse?->branch_id;

        // Determine selected branch
        if ($canSeeOtherBranchesCash) {
            $branchId = $request->filled('branch_id')
                ? (int) $request->branch_id
                : $userBranchId;
        } else {
            // User can only see their own branch
            $branchId = $userBranchId;
        }

        // Calculate balance
        $balance = $branchId
            ? $this->computeBalance($branchId)
            : 0.00;

        // Get cash movements
        $movementsQuery = CashMovement::with('user', 'branch')
            ->orderBy('movement_date', 'desc')
            ->orderBy('id', 'desc');

        if ($branchId) {
            $movementsQuery->where('branch_id', $branchId);
        }

        $movements = $movementsQuery->paginate(15)->withQueryString();

        // Only users with permission can see all branches
        $branches = $canSeeOtherBranchesCash
            ? Branch::select('id', 'name')->orderBy('name')->get()
            : Branch::where('id', $userBranchId)->select('id', 'name')->get();

        return Inertia::render('Cash/Index', [
            'balance' => $balance,
            'branch_id' => $branchId,
            'movements' => $movements,
            'branches' => $branches,
            'can_see_other_branches_cash' => $canSeeOtherBranchesCash,
        ]);
    }


    public function handoverPage()
    {
        if (!auth()->user()->canDo('Cash handover create')) {
            abort(403);
        }

        $branches = Branch::select('id', 'name')->orderBy('name')->get();
        $balance = auth()->user()?->warehouse?->branch_id
            ? $this->computeBalance((int) auth()->user()->warehouse->branch_id)
            : 0.00;

        return Inertia::render('Cash/Handover', [
            'balance' => $balance,
            'branches' => $branches,
        ]);
    }

    public function transferPage()
    {
        if (!auth()->user()->canDo('Cash transfer create')) {
            abort(403);
        }

        $branches = Branch::select('id', 'name')->orderBy('name')->get();
        $balance = auth()->user()?->warehouse?->branch_id
            ? $this->computeBalance((int) auth()->user()->warehouse->branch_id)
            : 0.00;

        return Inertia::render('Cash/Transfer', [
            'balance' => $balance,
            'branches' => $branches,
        ]);
    }

    public function fundingPage()
    {
        if (!auth()->user()->canDo('Cash personal funding create')) {
            abort(403);
        }

        $branches = Branch::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Cash/Funding', [
            'branches' => $branches,
        ]);
    }

    private function computeBalance(int $branchId): float
    {
        $cashCollections = \App\Models\Collection::join('sales', 'collections.sale_id', '=', 'sales.id')
            ->join('users', 'sales.user_id', '=', 'users.id')
            ->join('warehouses', 'users.warehouse_id', '=', 'warehouses.id')
            ->where('warehouses.branch_id', $branchId)
            ->where(function ($q) {
                $q->whereNull('collections.method')
                    ->where('sales.payment_method', 'C')
                    ->orWhere('collections.method', 'cash');
            })
            ->sum('collections.amount');

        $inflows = CashMovement::where('branch_id', $branchId)
            ->whereIn('type', ['transfer_in', 'personal_funding'])
            ->sum('amount');

        $outflows = CashMovement::where('branch_id', $branchId)
            ->whereIn('type', ['handover', 'transfer_out'])
            ->sum('amount');

        $expenses = \App\Models\Expense::where('branch_id', $branchId)->sum('amount');

        return (float) round(
            (float) $cashCollections + (float) $inflows - (float) $outflows - (float) $expenses,
            2
        );
    }

    public function handover(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'movement_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();
        $branchId = $user?->warehouse?->branch_id;

        if (!$branchId) {
            return response()->json(['message' => 'المستخدم غير مرتبط بفرع'], 403);
        }

        return DB::transaction(function () use ($data, $branchId, $user) {
            $branch = Branch::where('id', $branchId)->lockForUpdate()->first();
            if (!$branch) {
                return response()->json(['message' => 'الفرع غير موجود'], 404);
            }

            $balance = $this->computeBalance($branchId);

            if ((float) $data['amount'] > (float) $balance) {
                return redirect()->back()->withErrors([
                    'message' => 'رصيد الفرع غير كافٍ للتسليم',
                    'amount' => 'المبلغ يتجاوز الرصيد المتاح',
                ]);
            }

            CashMovement::create([
                'branch_id' => $branchId,
                'type' => 'handover',
                'amount' => (float) $data['amount'],
                'movement_date' => $data['movement_date'],
                'reference' => 'handover_' . uniqid('', true),
                'group_reference' => null,
                'reference_type' => 'cash_handover',
                'reference_id' => null,
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            return redirect()->back()->with('success', 'تم تسجيل التسليم بنجاح');
        });
    }


    public function transfer(Request $request)
    {
        $data = $request->validate([
            'from_branch_id' => 'required|exists:branches,id',
            'to_branch_id' => 'required|exists:branches,id|different:from_branch_id',
            'amount' => 'required|numeric|min:0.01',
            'movement_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();

        $senderBranchId = $user?->warehouse?->branch_id;
        if ((int) $data['from_branch_id'] !== (int) $senderBranchId) {
            return response()->json(['message' => 'لا يمكنك التحويل من فرع غير فرعك'], 403);
        }

        $groupReference = 'transfer_' . uniqid('', true);

        return DB::transaction(function () use ($data, $user, $groupReference) {
            $ids = [(int) $data['from_branch_id'], (int) $data['to_branch_id']];
            sort($ids);

            $lockedBranches = [];
            foreach ($ids as $id) {
                $lockedBranches[$id] = Branch::where('id', $id)->lockForUpdate()->first();
            }

            $fromBranch = $lockedBranches[(int) $data['from_branch_id']];
            $toBranch = $lockedBranches[(int) $data['to_branch_id']];

            if (!$fromBranch || !$toBranch) {
                return response()->json(['message' => 'أحد الفرعين غير موجود'], 404);
            }

            $senderBalance = $this->computeBalance((int) $data['from_branch_id']);

            if ((float) $data['amount'] > (float) $senderBalance) {
                return redirect()->back()->withErrors([
                    'message' => 'رصيد الفرع المرسل غير كافٍ',
                    'amount' => 'المبلغ يتجاوز رصيد الفرع المرسل',
                ]);
            }

            CashMovement::create([
                'branch_id' => (int) $data['from_branch_id'],
                'type' => 'transfer_out',
                'amount' => (float) $data['amount'],
                'movement_date' => $data['movement_date'],
                'reference' => 'transfer_out_' . uniqid('', true),
                'group_reference' => $groupReference,
                'reference_type' => 'cash_transfer',
                'reference_id' => null,
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            CashMovement::create([
                'branch_id' => (int) $data['to_branch_id'],
                'type' => 'transfer_in',
                'amount' => (float) $data['amount'],
                'movement_date' => $data['movement_date'],
                'reference' => 'transfer_in_' . uniqid('', true),
                'group_reference' => $groupReference,
                'reference_type' => 'cash_transfer',
                'reference_id' => null,
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            return redirect()->back()->with('success', 'تم التحويل بنجاح');
        });
    }

    public function funding(Request $request)
    {
        $user = auth()->user();

        if (!$user->canDo('Cash personal funding create')) {
            return response()->json(['message' => 'غير مسموح لك بالتوريد الشخصي'], 403);
        }

        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'amount' => 'required|numeric|min:0.01',
            'movement_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($data, $user) {
            $branch = Branch::where('id', $data['branch_id'])->lockForUpdate()->first();
            if (!$branch) {
                return response()->json(['message' => 'الفرع غير موجود'], 404);
            }

            CashMovement::create([
                'branch_id' => (int) $data['branch_id'],
                'type' => 'personal_funding',
                'amount' => (float) $data['amount'],
                'movement_date' => $data['movement_date'],
                'reference' => 'funding_' . uniqid('', true),
                'group_reference' => null,
                'reference_type' => 'personal_funding',
                'reference_id' => null,
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            return redirect()->back()->with('success', 'تم تسجيل التوريد الشخصي بنجاح');
        });
    }
}