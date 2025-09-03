<?php

namespace App\Http\Controllers;
use App\Models\Customer ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::latest()->paginate(10);
        return Inertia::render('Customers/Index', [
            'customers' => $customers
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
            'company_name' => 'nullable|string|max:255',
            
        ]);

        $customer = Customer::create($data);

       return redirect()->back()->with('customer', $customer);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back()->with('success', 'تم حذف العميل');
    }
}
