<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

use Inertia\Inertia;
class ActivityController extends Controller
{
    public function login($id = null)
{
    if($id != null){

        $logs = Activity::with('causer')
            ->latest()
            ->where('causer_id', $id)
            ->take(50)
            ->get();
    }else{
       $logs = Activity::with('causer')
            ->latest()            
            ->take(50)
            ->get(); 
    }

    return Inertia::render('Users/ActivityLog/Login', [
        'logs' => $logs,
    ]);
}
}
