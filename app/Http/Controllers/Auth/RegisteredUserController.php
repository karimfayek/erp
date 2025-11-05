<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        
       // dd($role);
        $request->validate([
            'name' => 'required|string|max:255',
            'warehouse_id' => 'required|exists:warehouses,id',
            'salary' => 'nullable|numeric',
            'role'=>'nullable|exists:roles,id',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required',  Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'warehouse_id' => $request->warehouse_id,
            'type' => $request->type ?? 'user',
            'email' => $request->email,
            'salary' => $request->salary,
            'password' => Hash::make($request->password),
        ]);
       $roleR = $request->role ?? null;

        if ($roleR) {
            // لو أُرسل role (مفرد أو نص مفصول بفواصل)
            $role = is_array($roleR) ? $roleR : explode(',', $roleR);
        } else {
            // لو لم يُرسل role، اجعلها مصفوفة فاضية
            $role = [];
        }

        $user->roles()->sync($role);
        event(new Registered($user));

       // Auth::login($user);
        return redirect()->back()->with(['message' , 'تم انشاء المستخدم']);
        //return redirect()->intended(route('dashboard', absolute: false));
    }
}
