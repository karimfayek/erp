<?php

namespace App\Http\Controllers;
use App\Models\User ;
use App\Models\Warehouse ;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(50);
        $warehouses = Warehouse::latest()->get();
        return Inertia::render('Users/Index', [
            'users' => $users,
            'warehouses' => $warehouses,
        ]);
    }
    public function show(User $user)
    {
         $admin = auth()->user();
        $role = $admin->roles ;
        //dd($role[0]);
        if($role[0] ->slug === 'super-admin' || $admin->id == $user->id){
        $user->load('sales' , 'sales.customer');

        }
        else{
            abort(403);
        }
        //dd($user->sales);
        return Inertia::render('Users/ShowT', [
            'user' => $user
        ]);
    }
    public function edit(User $user)
    {
        
        $warehouses = Warehouse::latest()->get();
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'warehouses' => $warehouses,
        ]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'warehouse_id' => 'required|exists:warehouses,id',
            'discount_percentage' => 'nullable|numeric',
            'company_name' => 'nullable|string|max:255',
            
        ]);

        $user = User::create($data);

       return redirect()->back()->with('user', $user);
    }
  public function update(Request $request ,User $user): RedirectResponse
    {
       
        $request->validate([
            'name' => 'required|string|max:255',
            
            'warehouse_id' => 'required|exists:warehouses,id',
             'email' => [
            'required',
            'string',
            'lowercase',
            'email',
            'max:255',
            Rule::unique('users', 'email')->ignore($user->id),
        ],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'warehouse_id' => $request->warehouse_id,
        ]);

        if(!empty($request->password)){
            $user->update([
                'password' => Hash::make($request->password),
                ]);
                
        }
    return redirect()->back()->with(['success' , 'تم تعديل المستخدم']);
        //return redirect()->intended(route('dashboard', absolute: false));
    }
    public function destroy(User $user)
    {
         if($user->id === 7 ){
            return back();
        }
        $user->delete();
        return redirect()->back()->with('success', 'تم حذف المستخدم');
    }
}
