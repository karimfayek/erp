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
     public function __construct()
    {
        $this->middleware('permission:users.view')->only(['index']);
        $this->middleware('permission:users.edit')->only(['edit']);
        $this->middleware('permission:users.create')->only(['create', 'store']);
        $this->middleware('permission:users.delete')->only(['destroy']);
    }
    public function index($maintainance = null)
    {
        
        // dd(\Auth::user()->permissions());
        $warehouses = Warehouse::latest()->get();
        if($maintainance == 'maintainance'){
       // dd(\Auth::user()->canDO('maintenance.users'));
               if (!\Auth::user()->canDO('maintenance.users')) {
            abort(403, 'ليس لديك صلاحية  للوصول إلى هذه الصفحة.');
         }
          $users = User::latest()->where('type', 'technician')->paginate(50);
            $maintainance = true;
        } else {
          
            if (!\Auth::user()->canDO('Users view') ) {
                abort(403, 'ليس لديك صلاحية  للوصول إلى هذه الصفحة.');
            }
          $users = User::latest()->where('type', 'user')->with('warehouse')->paginate(50);
            $maintainance = false;
        }
       
       
        return Inertia::render('Users/Index', [
            'users' => $users,            
            'roles' => \App\Models\Role::all(),
            'warehouses' => $warehouses,
            'maintainance' => $maintainance,
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
            'assigned' => $user->warehouses()->pluck('warehouse_id')->toArray(),
        ]);
    }
    public function store(Request $request)
    {
        //dd($request->all());
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|max:255',
            'role'=>'nullable|exists:roles,id',
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric',
            'warehouse_id' => 'required|exists:warehouses,id',
            'discount_percentage' => 'nullable|numeric',
            'company_name' => 'nullable|string|max:255',
            
        ]);

        $user = User::create($data);
 $user->roles()->sync($request->role);
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
            'password' => 'nullable|string|min:8',
            'salary' => 'nullable|numeric',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'salary' => $request->salary,
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
    public function updateBranches(Request $request, User $user)
    {
        if (!auth()->user()->canDo('super')) {
            abort(403, 'Unauthorized action.');
        }
        $warehouseIds = array_map('intval', $request->input('warehouses', []));
        $user->warehouses()->sync($warehouseIds);
        return redirect()->back()->with('success','تم تحديث الفروع');
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
