<?php
namespace App\Http\Controllers;

use App\Models\CustomerBranch;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerBranchController extends Controller
{
    public function index() {
        return Inertia::render('CustomerBranches/Index', [
            'branches' => CustomerBranch::with('customer')->get(),
            'customers' => Customer::all(),
        ]);
    }

//edit function
    public function edit(CustomerBranch $customerBranch) {
       
        return Inertia::render('CustomerBranches/Edit', [
            'branche' => $customerBranch,
              'customers' => Customer::all(),
        ]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

         CustomerBranch::create($data);
        return redirect()->back()->with('success', 'Branch created successfully.');
    }

    public function show(CustomerBranch $customerBranch) {
        return Inertia::render('CustomerBranches/Show', [
            'branch' => $customerBranch->load('representatives')
        ]);
    }

    public function update(Request $request, CustomerBranch $customerBranch) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'customer_id' => 'required|exists:customers,id',
            'address' => 'nullable|string',
        ]);

        $customerBranch->update($data);

        return redirect()->back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(CustomerBranch $customerBranch) {
        $customerBranch->delete();
        return redirect()->back()->with('success', 'Branch deleted successfully.');
    }
}
