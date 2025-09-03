<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    public function items(){ return $this->hasMany(InvoiceItem::class); }
    public function customer(){ return $this->belongsTo(Customer::class); }
    public function taxInvoice(){ return $this->hasOne(TaxInvoice::class); }
}
