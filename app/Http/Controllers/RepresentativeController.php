<?php

namespace App\Http\Controllers;

use App\Models\Representative;
use Illuminate\Http\Request;

use Inertia\Inertia;
class RepresentativeController extends Controller
{
    public function index() {
        return Inertia::render('Representatives/Index', [
            'representatives' => Representative::with('branch.customer' ,'customer')->get(),
            'branches' => \App\Models\CustomerBranch::with('customer')->get(),
            'customers' => \App\Models\Customer::all(),
        ]);
    }
    public function edit(Representative $representative) {
        return Inertia::render('Representatives/Edit', [
            'representative' => $representative->load('branch.customer'),
            'branches' => \App\Models\CustomerBranch::with('customer')->get(),
            'customers' => \App\Models\Customer::all(),
        ]);
    }

    public function create() {
        return Inertia::render('Representatives/Create', [
            'branches' => \App\Models\CustomerBranch::with('customer')->get(),
        ]);
    }
    public function store(Request $request) {
        $data = $request->validate([
            'customer_branch_id' => 'nullable|exists:customer_branches,id',
            'customer_id' => 'nullable|exists:customers,id',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
        ]);
        Representative::create($data);
        return redirect()->back()->with('success', 'Representative created successfully.');
     }

    public function show(Representative $representative) {
        return Inertia::render('Representatives/Show', [
            'representative' => $representative->load('branch.customer'),
        ]);
    }

    public function update(Request $request, Representative $representative) {
        $data = $request->validate([
            'customer_branch_id' => 'required|exists:customer_branches,id',
            'customer_id' => 'nullable|exists:customers,id',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
        ]);

        $representative->update($data);
        return redirect()->back()->with('success', 'Representative updated successfully.');
    }

    public function destroy(Representative $representative) {
        $representative->delete();
        return redirect()->back()->with('success', 'Representative deleted successfully.'); 
    }
}

