<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,name',
            'description' => 'nullable|string|max:1000',
        ]);

        ExpenseCategory::create($data);

        return redirect()->back()->with('success', 'تم إضافة التصنيف بنجاح');
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,name,' . $expenseCategory->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $expenseCategory->update($data);

        return redirect()->back()->with('success', 'تم تعديل التصنيف بنجاح');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        if ($expenseCategory->expenses()->exists()) {
            return redirect()->back()->with('success', 'لا يمكن حذف تصنيف مرتبط بمصاريف');
        }

        $expenseCategory->delete();

        return redirect()->back()->with('success', 'تم حذف التصنيف');
    }
}
