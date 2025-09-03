<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class TaxInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id','uuid','submission_status','signed_at','submitted_at','signed_by',
        'error_message','payload_snapshot','response_snapshot'
    ];

    protected $casts = [
        'payload_snapshot' => 'array',
        'response_snapshot' => 'array',
        'signed_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function invoice(){ return $this->belongsTo(Invoice::class); }
    public function signer(){ return $this->belongsTo(User::class, 'signed_by'); }
}
