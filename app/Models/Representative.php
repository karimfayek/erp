<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Representative extends Model
{
    protected $fillable = ['customer_branch_id', 'name', 'phone', 'email' ,'customer_id'];

    public function branch() {
        return $this->belongsTo(CustomerBranch::class, 'customer_branch_id');
    }

    public function customer() {
         return $this->belongsTo(Customer::class, 'customer_id');
    }
}
