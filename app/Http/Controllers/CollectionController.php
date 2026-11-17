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
            'collections' => $sale->collections()
                ->with('branch')
                ->latest()
                ->get(),
            'branches' => Branch::all(),
            'defaultBranch' => $sale->user->warehouse->branch->id,
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
            'branch' => 'required',
        ]);

        $sale = Sale::whereKey($data['sale_id'])->first();
        if (!$sale) {
            return back()->withErrors(['message' => 'الفاتورة غير موجودة']);
        }

        $branchId = $data['branch'];
        $branchName = Branch::find($branchId)->name;
        $isCash = strtolower(trim($data['method'] ?? '')) === 'cash';

        return DB::transaction(function () use ($data, $sale, $branchId, $isCash, $branchName) {


            $collection = Collection::create([
                'sale_id' => $data['sale_id'],
                'amount' => $data['amount'],
                'collection_date' => $data['collection_date'],
                'method' => $data['method'],
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] + $branchName ?? $branchName,
                'created_by' => auth()->id(),
                'branch_id' => $branchId,
            ]);
            if ($isCash && $branchId) {
                Branch::where('id', $branchId)->lockForUpdate()->first();

                CashMovement::create([
                    'branch_id' => $branchId,
                    'type' => 'collection',
                    'amount' => (float) $data['amount'],
                    'movement_date' => $data['collection_date'],
                    'reference' => 'collection_' . $collection->id,
                    'user_id' => auth()->id(),
                    'notes' => 'تحصيل نقدي من فاتورة رقم ' . $sale->id,
                ]);
            }
            // Keep the sale totals in sync with the new collection row.
            $sale->syncCollectionTotals()->save();

            return back()->with('success', 'تم إضافة التحصيل بنجاح');
        });
    }

    public function updateOld(Request $request, Collection $collection)
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

    public function update(Request $request, Collection $collection)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'method' => 'required|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'branch' => 'required',
        ]);

        return DB::transaction(function () use ($collection, $data) {

            $collection = Collection::whereKey($collection->id)
                ->lockForUpdate()
                ->firstOrFail();

            $sale = Sale::whereKey($collection->sale_id)
                ->lockForUpdate()
                ->firstOrFail();

            $branchId = $data['branch'];

            $oldMethod = strtolower(trim($collection->method ?? ''));
            $newMethod = strtolower(trim($data['method'] ?? ''));

            $wasCash = $oldMethod === 'cash';
            $isCash = $newMethod === 'cash';

            $reference = 'collection_' . $collection->id;

            // Lock branch if old or new method is cash
            if (($wasCash || $isCash) && $branchId) {
                Branch::where('id', $branchId)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            // Find existing cash movement
            $movement = CashMovement::where('reference', $reference)
                ->lockForUpdate()
                ->first();

            // Update collection
            $collection->update([
                'amount' => $data['amount'],
                'collection_date' => $data['collection_date'],
                'method' => $data['method'],
                'reference_number' => $data['reference_number'] ?? $collection->reference_number,
                'notes' => $data['notes'] ?? null,
                'branch_id' => $branchId,
            ]);

            // Handle cash movement
            if ($isCash && $branchId) {

                if ($movement) {
                    // Update existing movement
                    $movement->update([
                        'branch_id' => $branchId,
                        'amount' => (float) $data['amount'],
                        'movement_date' => $data['collection_date'],
                        'user_id' => auth()->id(),
                        'notes' => 'تعديل تحصيل نقدي من فاتورة رقم ' . $sale->id,
                    ]);
                } else {
                    // Create new movement
                    CashMovement::create([
                        'branch_id' => $branchId,
                        'type' => 'collection',
                        'amount' => (float) $data['amount'],
                        'movement_date' => $data['collection_date'],
                        'reference' => $reference,
                        'user_id' => auth()->id(),
                        'notes' => 'تحصيل نقدي من فاتورة رقم ' . $sale->id,
                    ]);
                }

            } else {
                // Delete old cash movement if payment is no longer cash
                if ($movement) {
                    $movement->delete();
                }
            }

            // Update sale totals
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
