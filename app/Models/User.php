<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'warehouse_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

public function roles()
{
    return $this->belongsToMany(Role::class, 'role_user');
}

// عشان تجيب الرول الوحيد اللي عنده بسهولة
public function role()
{
    return $this->roles()->first();
}

public function permissions()
{
    return $this->belongsToMany(Permission::class, 'permission_user');
}
public function allPermissions()
{
    // صلاحيات من الرول
    $rolePermissions = $this->role()->permissions
        ->flatten();
//dd( $this->role()->with('permissions') ->get()->pluck('permissions') ->flatten());
    // صلاحيات مباشرة لليوزر
    $userPermissions = $this->permissions;
   // dd();

    // دمجهم مع بعض وإزالة التكرار
    return $rolePermissions->merge($userPermissions)->unique('id');
}

public function hasPermission($permissionName)
{
      if ($this->hasRole('Super Admin')) {
        return true;
    }
    return $this->allPermissions()->contains('name', $permissionName);
}
public function directPermissions()
{
    return $this->belongsToMany(Permission::class);
}




    public function hasRole(string $slug): bool {
        return $this->roles()->where('slug', $slug)->exists();
    }

    public function canDo(string $slug): bool {
        return $this->permissions()->where('slug', $slug)->exists()
            || $this->roles()->whereHas('permissions', fn($q)=>$q->where('slug',$slug))->exists();
    }
      public function sales() { return $this->hasMany(Sale::class); }



      public function warehouse()
{
    return $this->belongsTo(Warehouse::class, 'warehouse_id');
}



}
