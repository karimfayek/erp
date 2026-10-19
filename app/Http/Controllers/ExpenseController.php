<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    protected function userBranchId()
    {
        $user = auth()->user();
        return $user?->warehouse?->branch_id;
    }

    protected function canChooseBranch(): bool
    {
        $user = auth()->user();
        if (! $user) return false;
        // Super Admin يعدي من canDo، وصلاحية اختيار الفرع منفصلة
        return $user->canDo('Expenses choose branch');
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $canChoose = $this->canChooseBranch();

        $query = Expense::with(['category:id,name', 'branch:id,name', 'user:id,name']);

        // لو ممعهوش صلاحية اختيار الفرع → يشوف فرعه بس
        if (! $canChoose) {
            $branchId = $this->userBranchId();
            if ($branchId) {
                $query->where('branch_id', $branchId);
            }
        } elseif ($request->filled('branch_id') && $request->branch_id !== 'all') {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }
        if ($search = $request->search) {
            $query->where('note', 'like', "%{$search}%");
        }

        $expenses = $query->latest()->paginate(15)->withQueryString();

        // الفروع المتاحة في الفورم: كل الفروع لو يقدر يختار، وإلا فرعه فقط
        if ($canChoose) {
            $branches = Branch::select('id', 'name')->orderBy('name')->get();
        } else {
            $branches = Branch::where('id', $this->userBranchId())->select('id', 'name')->get();
        }
        $categories = ExpenseCategory::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'branches' => $branches,
            'categories' => $categories,
            'canChooseBranch' => $canChoose,
            'myBranchId' => $this->userBranchId(),
            'filters' => $request->only(['branch_id', 'category_id', 'from_date', 'to_date', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $canChoose = $this->canChooseBranch();

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'category_id' => 'required|exists:expense_categories,id',
            'note' => 'required|string|max:2000',
            'date' => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        // تحديد الفرع: تلقائي من حساب اللي بيضيف، إلا لو معاه صلاحية اختيار الفرع
        if ($canChoose && ! empty($data['branch_id'])) {
            $branchId = $data['branch_id'];
        } else {
            $branchId = $this->userBranchId();
            if (! $branchId && ! empty($data['branch_id'])) {
                $branchId = $data['branch_id'];
            }
        }

        Expense::create([
            'branch_id' => $branchId,
            'category_id' => $data['category_id'],
            'user_id' => $user?->id,
            'amount' => $data['amount'],
            'note' => $data['note'],
            'date' => $data['date'],
        ]);

        return redirect()->back()->with('success', 'تم إضافة المصروف بنجاح');
    }

    public function update(Request $request, Expense $expense)
    {
        // غير السوبر/المخول يعدل مصاريف فرعه فقط
        if (! $this->canChooseBranch() && $expense->branch_id !== $this->userBranchId()) {
            abort(403, 'غير مسموح لك بتعديل مصاريف فرع آخر');
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'category_id' => 'required|exists:expense_categories,id',
            'note' => 'required|string|max:2000',
            'date' => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        if ($this->canChooseBranch() && ! empty($data['branch_id'])) {
            $expense->branch_id = $data['branch_id'];
        }
        $expense->amount = $data['amount'];
        $expense->category_id = $data['category_id'];
        $expense->note = $data['note'];
        $expense->date = $data['date'];
        $expense->save();

        return redirect()->back()->with('success', 'تم تعديل المصروف بنجاح');
    }

    public function destroy(Expense $expense)
    {
        if (! $this->canChooseBranch() && $expense->branch_id !== $this->userBranchId()) {
            abort(403, 'غير مسموح لك بحذف مصاريف فرع آخر');
        }

        $expense->delete();

        return redirect()->back()->with('success', 'تم حذف المصروف');
    }
}
