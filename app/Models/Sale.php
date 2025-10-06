<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
      'issued_at' ,'internal_id' , 'date','customer_id','user_id','collected','subtotal','discount_percent',
      'tax','postponed','expenses','notes','invoice_number' ,'eta_status' ,'eta_uuid', 'representative_id','customer_branch_id',
      'document_type' , 'invoice_type' ,'payment_method','is_delivered','other_tax','discount_percentage','is_invoice','total' ,'created_by'
    ];

    protected $casts = [
         'date' => 'date' ,
        'issued_at' => 'datetime',
        ];

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
         public function creator()
        {
            return $this->belongsTo(User::class , 'created_by');
        }
}
