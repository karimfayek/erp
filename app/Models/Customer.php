<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{

    protected $fillable = [
        'name','email','phone','address','discount_percentage','company_name'
    ];


    public function invoices(){ return $this->hasMany(Invoice::class); }
     public function dailySales(){ return $this->hasMany(DailySale::class); }
    
}
