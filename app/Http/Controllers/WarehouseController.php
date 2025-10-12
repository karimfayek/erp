<?php

namespace App\Http\Controllers;

use App\Models\Branch ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
     public function __construct()
    {
        $this->middleware('permission:Warehouses view')->only(['index']);
        $this->middleware('permission:Warehouses edit')->only(['edit']);
        $this->middleware('permission:Warehouses create')->only(['create', 'store']);
        $this->middleware('permission:Warehouses delete')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $warehouses = Warehouse::with('branch')->paginate(10);
        $branches = Branch::all();
        return Inertia::render('Warehouse/Index', [
            'warehouses' => $warehouses,
            'branches' => $branches,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         if (!auth()->user()->canDo('Warehouses create')) {
        abort(403, 'ليس لديك صلاحية  ');
    }
       
            //dd($request->all());
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
                'branch_id' => 'required',
                'is_active' => 'required',
            ]);
    
            $product = Warehouse::create($data);
          
            return redirect()->back()->with('success', 'تم إضافة المخزن بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        
            if (!auth()->user()->canDo('Warehouses edit')) {
        abort(403, 'ليس لديك صلاحية  ');
    }
        $warehouse = Warehouse::find($id);
        $branches = Branch::all();
        return Inertia::render('Warehouse/Edit', [
            'warehouse' => $warehouse,
            'branches' => $branches,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $warehouse = Warehouse::find($id);
        $warehouse->update($request->all());
          return redirect()->back()->with('success', 'تم التعديل ');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         if (!Auth::user()->canDo('Warehouses delete')) {
        abort(403, 'ليس لديك صلاحية  ');
    }
        $warehouse = Warehouse::find($id)->delete();
          return redirect()->back()->with('success', 'تم الحذف ');
    }
}
