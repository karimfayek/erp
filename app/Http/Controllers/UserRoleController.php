<?php

namespace App\Http\Controllers;

use App\Models\User ;
use App\Models\Role ;
use App\Models\Permission ;
use Illuminate\Http\Request;

use Inertia\Inertia;
class UserRoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Roles/Roles', [
            'users' => User::with('roles')->get(),
            'roles' => Role::all(),
        ]);
    }

  public function AccessControl()
    {
        return Inertia::render('AccessControl/Index', [
           'users' => User::with(['roles', 'permissions'])->get(),
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all(),
        ]);
    }
    public function update(Request $request, User $user)
    {
        //dd($user);
        $request->validate([
            'role_id' => 'exists:roles,id',
        ]);

        $user->roles()->sync($request->role_id);

        return redirect()->back()->with('success', 'User roles updated successfully.');
    }
}
