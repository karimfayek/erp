<?php

namespace App\Http\Controllers;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::all();
        foreach ($customers as $customer) {
            $customer->user_id = $customer->created_by;
            $customer->save();
        }
        $user = auth()->user();
        $users = User::where('type', 'user')->get();
        $roleSlugs = $user->roles->pluck('slug')->toArray();
        $isSuperAdmin = in_array('super-admin', $roleSlugs, true);
        if ($isSuperAdmin) {
            $customers = Customer::with('user')->latest()->get();

        } else {
            if ($user->hasPermission('clients.show.others')) {
                $customers = Customer::where('user_id', $user->id)->orWhere('created_by', $user->id)->with('user', 'creator')->latest()->get();
            } else {
                $customers = $user->customers()->with('user', 'creator')->latest()->get();
            }
        }
        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'users' => $users,
            'user' => $user
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
            'user_id' => 'required|exists:users,id',
            'building_number' => 'nullable|numeric',
            'type' => 'required|string',
            'company_name' => 'nullable|string|max:255',

        ]);
        $customerExist = Customer::where('phone', $request->phone)->where('user_id', $request->user_id)->first();
        //dd($customerExist);
        if ($customerExist) {
            return back()->with('success', 'العميل موجود بالفعل');
        }
        $data['created_by'] = auth()->id();
        $customer = Customer::create($data);

        return redirect()->back()->with('customer', $customer);
    }
    public function update(Request $request, $id)
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
