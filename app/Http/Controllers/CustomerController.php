<?php

namespace App\Http\Controllers;
use App\Models\Customer ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::latest()->with('user')->get();
        return Inertia::render('Customers/Index', [
            'customers' => $customers
        ]);
    }

     public function edit($id)
    {
        $customer = Customer::find($id);
        return Inertia::render('Customers/Edit', [
            'customer' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'discount_percentage' => 'nullable|numeric',
            'tax_id' => 'required|numeric',
            'country' => 'required|string',
            'governate' => 'nullable|string',
            'city' => 'nullable|string',
            'street' => 'nullable|string',
            'building_number' => 'nullable|numeric',
            'type' => 'required|string',
            'company_name' => 'nullable|string|max:255',
            
        ]);
        $data['created_by'] = auth()->id();
        $customer = Customer::create($data);

       return redirect()->back()->with('customer', $customer);
    }
   public function update(Request $request , $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'discount_percentage' => 'nullable|numeric',
            'tax_id' => 'required|numeric',
            'country' => 'required|string',
            'governate' => 'nullable|string',
            'city' => 'nullable|string',
            'street' => 'nullable|string',
            'building_number' => 'nullable|numeric',
            'type' => 'required|string',
            'company_name' => 'nullable|string|max:255',
            
        ]);
        $customer = Customer::find($id);
        $customer->update($data);

       return redirect()->back()->with('success', 'تم تعديل العميل بنجاح');
    }
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back()->with('success', 'تم حذف العميل');
    }
}
