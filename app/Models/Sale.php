<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'date','customer_id','user_id','collected','subtotal','discount_percent','tax','postponed','expenses','notes','invoice_number'
    ];

    protected $casts = [ 'date' => 'date' ];

    public function customer()
    {
         return $this->belongsTo(Customer::class);
    }

    public function items()
        {
            return $this->hasMany(SalesItem::class);
        }

       

        public function user()
        {
            return $this->belongsTo(User::class);
        }
}
