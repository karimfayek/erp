<?php

namespace App\Http\Controllers;

use App\Models\Permission ;
use App\Models\User ;
use Illuminate\Http\Request;

use Inertia\Inertia;

class UserPermissionController extends Controller
{
     public function edit(User $user)
    {
        return Inertia::render('Users/Permissions', [
            'user' => $user->load('directPermissions'),
            'permissions' => Permission::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $user->directPermissions()->sync($request->permissions);

        return redirect()->back()->with('success', 'User permissions updated successfully.');
    }
}
