<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    
     public function handle($request, Closure $next, $permission = null):Response
    {
         $user = auth()->user();

            if (!$user) {
                abort(403, 'Unauthorized');
            }
          if ($user && $user->hasRole('super-admin')) {
            
            return $next($request);
        }
        if (!auth()->user()->hasPermission($permission)) {
            abort(403, 'Unauthorized');
        }
        return $next($request);
    }
}
