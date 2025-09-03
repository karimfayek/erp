<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = [
        'name','code','branch_id','location' , 'is_active'
    ];
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function products()
{
    return $this->belongsToMany(Product::class, 'product_inventories', 'warehouse_id', 'product_id')
                ->withPivot(['quantity', 'min_quantity']);
}
public function outgoingMovements()
{
    return $this->hasMany(InventoryMovement::class, 'from_warehouse_id');
}

public function incomingMovements()
{
    return $this->hasMany(InventoryMovement::class, 'to_warehouse_id');
}
}
