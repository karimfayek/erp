<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
     protected $fillable = [
        'name',
        'sell_price',
        'description',
        'is_active',
    ];

    public function salesItems()
{
    return $this->morphMany(SalesItem::class, 'item', 'item_type', 'item_id');
}
}
