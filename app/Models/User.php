<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'warehouse_id',
        'type',
        'salary',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // **** تصحيح: يجب أن تكون خاصية وليس دالة ****
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'salary' => 'decimal:2',
    ];
   public function customers()
        {
         return $this->hasMany(Customer::class , 'created_by');
        }
    // علاقات رول وصلاحيات
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    // للحصول على رول واحد (لو منطقي في تطبيقك)
    public function role()
    {
        return $this->roles()->first();
    }

    // صلاحيات مرتبطة مباشرة باليوزر (pivot table اسمه permission_user)
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_user');
    }

    // (اختياري) اسم بديل لعلاقة الصلاحيات المباشرة
    public function directPermissions()
    {
        return $this->permissions();
    }

    // دمج صلاحيات الرول والصلاحيات المباشرة
    public function allPermissions(): Collection
    {
        $rolePermissions = collect();
        $role = $this->role();
        if ($role) {
            // افترض أن $role->permissions عبارة عن Collection
            $rolePermissions = $role->permissions;
        }

        $userPermissions = $this->permissions()->get();

        // دمج وإزالة التكرار حسب id
        return $rolePermissions->merge($userPermissions)->unique('id')->values();
    }

    public function hasPermission(string $permissionName): bool
    {
        // Super Admin bypass
        if ($this->hasRole('Super Admin')) {
            return true;
        }

        // مثال: إذا تريد منع الفنيين تمامًا من صلاحيات معينة
        if ($this->type === 'technician') {
            return false;
        }

        $normalized = strtolower($permissionName);

        return $this->allPermissions()->contains(function ($perm) use ($normalized) {
            return strtolower($perm->slug ?? '') === $normalized
                || strtolower($perm->name ?? '') === $normalized;
        });
    }

    public function hasRole(string $slug): bool
    {
        $normalized = strtolower($slug);

        return $this->roles()->where(function ($q) use ($slug, $normalized) {
            $q->where('slug', $slug)
              ->orWhereRaw('LOWER(name) = ?', [$normalized]);
        })->exists();
    }

    // تحقق من صلاحية (slug) — يأخذ بالاعتبار صلاحيات يوزر + صلاحيات الرول
    public function canDo(string $slug): bool
    {
        if ($this->hasRole('Super Admin')) {
            return true;
        }

        $normalized = strtolower($slug);
//dd($slug);
        // تحقق في الصلاحيات المباشرة أولاً
        $directHas = $this->permissions()->where(function ($q) use ($slug, $normalized) {
            $q->where('slug', $slug)
              ->orWhereRaw('LOWER(name) = ?', [$normalized]);
        })->exists();
       // dd($this->permissions()->get());

        if ($directHas) return true;

        // ثم تحقق عبر الرولات - وجود رول لديه هذه الصلاحية
        $roleHas = $this->roles()->whereHas('permissions', function ($q) use ($slug, $normalized) {
            $q->where('slug', $slug)
              ->orWhereRaw('LOWER(name) = ?', [$normalized]);
        })->exists();
       

        return $roleHas;
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function warehouses()
    {
        return $this->belongsToMany(\App\Models\Warehouse::class, 'user_warehouses')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function warehouseIds(): array
    {
        // يُعيد مصفوفة أعداد صحيحة
        return $this->warehouses()->pluck('warehouses.id')->map(fn($v) => (int)$v)->toArray();
    }

    public function hasAccessToWarehouse($warehouseId): bool
    {
        if ($this->hasRole('Super Admin')) return true;

        return in_array((int)$warehouseId, $this->warehouseIds(), true);
    }

    // علاقة فواتير-فنيين (تأكد من أسماء الأعمدة في pivot table)
    public function invoicesAsTechnician()
    {
        // pivot table: invoice_technicians
        // عمود هذا اليوزر في الجدول: technician_id
        // عمود الفاتورة في الجدول: invoice_id
        return $this->belongsToMany(Sale::class, 'invoice_technicians', 'technician_id', 'invoice_id')
                    ->withPivot('commission_percent', 'commission_amount')
                    ->withTimestamps();
    }
}
