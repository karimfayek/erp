<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
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

        Collection::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'تم إضافة التحصيل بنجاح');
    }

    public function update(Request $request, Collection $collection)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $collection->update($data);

        return back()->with('success', 'تم تعديل التحصيل بنجاح');
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();

        return back()->with('success', 'تم حذف التحصيل');
    }
}
