<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesItem extends Model
{
    protected $fillable = [
        'sale_id','product_id','qty','product_code','unit_price','total','product_name'
    ];
    public function sale()
{
    return $this->belongsTo(Sale::class);
}

public function product()
{
    return $this->belongsTo(Product::class);
}
}
