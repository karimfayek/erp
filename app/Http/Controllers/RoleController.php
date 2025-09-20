<?php
namespace App\Http\Controllers;
use App\Models\Role ;
use App\Models\Permission ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $role = Role::create($request->only('name'));
        $role->permissions()->sync($request->permissions);
        return redirect()->back();
    }

    public function update(Request $request, Role $role)
    {
        $role->update($request->only('name'));
        $role->permissions()->sync($request->permissions);
        return redirect()->back();
    }
}

