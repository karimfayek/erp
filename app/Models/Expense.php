<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    public function category(){ return $this->belongsTo(ExpenseCategory::class, 'category_id'); }
 public function user(){ return $this->belongsTo(User::class); } // who spent/recorded
}
