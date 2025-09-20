<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{

    protected $fillable = [
      'tax_id', 'name', 'company_name' ,'email','phone','address',
     'country','governate','city','street','building_number','type', 'discount_percentage', 'created_by'
    ];


    public function invoices(){ return $this->hasMany(Invoice::class); }
     public function dailySales(){ return $this->hasMany(DailySale::class); }
      public function user(){ return $this->belongsTo(User::class , 'created_by'); }
      
      public function sales(){ return $this->hasMany(Sale::class); }
      public function representatives(){ return $this->hasMany(Representative::class); }
      public function branches(){ return $this->hasMany(CustomerBranch::class); }
    
}
