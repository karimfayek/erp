<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Sale;
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
        $data = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($data) {
            Collection::create([
                ...$data,
                'created_by' => auth()->id(),
            ]);

            // Keep the sale totals in sync with the new collection row.
            Sale::whereKey($data['sale_id'])->first()->syncCollectionTotals()->save();
        });

        return back()->with('success', 'تم إضافة التحصيل بنجاح');
    }

    public function update(Request $request, Collection $collection)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($collection, $data) {
            $collection->update($data);

            // Keep the sale totals in sync with the updated collection row.
            $collection->sale->syncCollectionTotals()->save();
        });

        return back()->with('success', 'تم تعديل التحصيل بنجاح');
    }

    public function destroy(Collection $collection)
    {
        DB::transaction(function () use ($collection) {
            $sale = $collection->sale;
            $collection->delete();

            // Keep the sale totals in sync after the collection row is removed.
            $sale->syncCollectionTotals()->save();
        });

        return back()->with('success', 'تم حذف التحصيل');
    }
}
