<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'name','code','phone','address'
    ];
    public function warehouses()
    {
        return $this->hasmany(Warehouse::class);
    }

    
}
