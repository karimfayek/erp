<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model

{
    protected $fillable = [
        'product_id',
        'user_id',
        'type',
        'quantity',
        'movement_date',
        'prev_quantity',
        'from_warehouse_id',
        'to_warehouse_id',
        'movement_type',
        'notes'
    ];

    protected $casts = [
        'movement_date' => 'date',
    ];
    // المنتج المرتبط
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // المستخدم اللي عمل الحركة (اختياري)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // المخزن الصادر منه
    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    // المخزن الداخل له
    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

}
