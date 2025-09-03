<?php

namespace App\Http\Controllers;
use App\Models\User ;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }
    public function show(User $user)
    {
        $user->load('sales' , 'sales.customer');
        //dd($user->sales);
        return Inertia::render('Users/ShowT', [
            'user' => $user
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

        $user = User::create($data);

       return redirect()->back()->with('user', $user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'تم حذف المستخدم');
    }
}
