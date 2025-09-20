<?php

namespace App\Http\Controllers;

use App\Models\Branch ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $branches = Branch::paginate(10);
        return Inertia::render('Branch/Index', [
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
       
            //dd($request->all());
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
            ]);
    
            $product = Branch::create($data);
          
            return redirect()->back()->with('success', 'تم إضافة الفرع بنجاح');
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
         $branche = Branch::find($id);
        return Inertia::render('Branch/Edit', [
            'branche' => $branche,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
         //dd($request->all());
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
            ]);
    $branch = Branch::find($id);
            $branch->update($data);
          
            return redirect()->back()->with('success', 'تم تعديل الفرع بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $branche = Branch::find($id)->delete();
          return redirect()->back()->with('success', 'تم الحذف ');
    }
}
