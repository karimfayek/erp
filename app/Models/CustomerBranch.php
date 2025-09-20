<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerBranch extends Model
{
    protected $fillable = ['customer_id', 'name', 'address'];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function representatives() {
        return $this->hasMany(Representative::class, 'customer_branch_id');
    }
}
