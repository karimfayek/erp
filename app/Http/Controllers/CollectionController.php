<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\CashMovement;
use App\Models\Collection;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function show(Sale $sale)
    {
        return inertia('Sales/Collections', [
            'sale' => $sale,
            'collections' => $sale->collections()->latest()->get(),
        ]);
    }
    public function store(Request $request)
    {
        // dd($request->all());
        $data = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date_format:Y-m-d',
            'method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $sale = Sale::whereKey($data['sale_id'])->first();
        if (! $sale) {
            return back()->withErrors(['message' => 'الفاتورة غير موجودة']);
        }

        $branchId = $sale->user?->warehouse?->branch_id;
        $isCash = strtolower(trim($data['method'] ?? '')) === 'cash';

        return DB::transaction(function () use ($data, $sale, $branchId, $isCash) {
            if ($isCash && $branchId) {
                Branch::where('id', $branchId)->lockForUpdate()->first();
            }

            Collection::create([
                'sale_id' => $data['sale_id'],
                'amount' => $data['amount'],
                'collection_date' => $data['collection_date'],
                'method' => $data['method'],
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Keep the sale totals in sync with the new collection row.
            $sale->syncCollectionTotals()->save();

            return back()->with('success', 'تم إضافة التحصيل بنجاح');
        });
    }

    public function update(Request $request, Collection $collection)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $sale = $collection->sale;
        $branchId = $sale?->user?->warehouse?->branch_id;
        $oldMethod = strtolower(trim($collection->method ?? ''));
        $newMethod = strtolower(trim($data['method'] ?? ''));
        $cashStatusChanged = ($oldMethod === 'cash') !== ($newMethod === 'cash');

        return DB::transaction(function () use ($collection, $data, $sale, $branchId, $cashStatusChanged) {
            if ($cashStatusChanged && $branchId) {
                Branch::where('id', $branchId)->lockForUpdate()->first();
            }

            $collection->update([
                'amount' => $data['amount'],
                'collection_date' => $data['collection_date'],
                'method' => $data['method'],
                'reference_number' => $data['reference_number'] ?? $collection->reference_number,
                'notes' => $data['notes'] ?? null,
            ]);

            // Keep the sale totals in sync with the updated collection row.
            $sale->syncCollectionTotals()->save();

            return back()->with('success', 'تم تعديل التحصيل بنجاح');
        });
    }

    public function destroy(Collection $collection)
    {
        $sale = $collection->sale;
        $branchId = $sale?->user?->warehouse?->branch_id;
        $isCash = strtolower(trim($collection->method ?? '')) === 'cash';

        return DB::transaction(function () use ($collection, $sale, $branchId, $isCash) {
            if ($isCash && $branchId) {
                Branch::where('id', $branchId)->lockForUpdate()->first();
            }

            $collection->delete();

            // Keep the sale totals in sync after the collection row is removed.
            $sale->syncCollectionTotals()->save();

            return back()->with('success', 'تم حذف التحصيل');
        });
    }
}
