<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code','name','price','item_code','item_type','description','unit_type' , 'price_without_tax',
        'tax_percentage', 'user_id','brand_id','internal_code'
    ];

    
    public function invoiceItems(){ return $this->hasMany(InvoiceItem::class); }

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'product_inventories', 'product_id', 'warehouse_id')
                    ->withPivot(['quantity', 'min_quantity']);
    }

    public function inventory(){
        return $this->hasMany(ProductInventory::class,  'product_id');
       
    }
        
  public function movements()
{
    return $this->hasMany(InventoryMovement::class);
}
public function getTotalQuantityAttribute()
{
    return $this->warehouses->sum(fn($warehouse) => $warehouse->pivot->quantity);
}
}
