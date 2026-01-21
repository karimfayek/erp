<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'issued_at',
        'internal_id',
        'date',
        'customer_id',
        'user_id',
        'collected',
        'subtotal',
        'discount_percent',
        'tax',
        'postponed',
        'expenses',
        'notes',
        'invoice_number',
        'eta_status',
        'eta_uuid',
        'representative_id',
        'customer_branch_id',
        'document_type',
        'invoice_type',
        'payment_method',
        'is_delivered',
        'other_tax',
        'discount_percentage',
        'is_invoice',
        'total',
        'created_by',
        'maintainance',
        'marked_to_draft',
        'transportation',
        'other_tax_val'
    ];

    protected $casts = [
        'date' => 'date',
        'issued_at' => 'datetime',
        'postponed' => 'decimal:2',
        'collected' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'other_tax_val' => 'decimal:2',
        'total' => 'decimal:2',
        'tax' => 'decimal:2',
        'other_tax' => 'decimal:2',
        'expenses' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
    ];
    protected $appends = [
        'total_formatted',
        'collected_formatted',
        'postponed_formatted',
        'subtotal_formatted',
        'collected_amount',
        'remaining_amount'
    ];

    public function getTotalFormattedAttribute()
    {
        return number_format($this->attributes['total'], 2, '.', ',');
    }
    public function getSubtotalFormattedAttribute()
    {
        return number_format($this->attributes['subtotal'] ?? 0, 2, '.', ',');
    }

    public function getCollectedFormattedAttribute($value)
    {
        return number_format($value, 2, '.', ',');
    }
    public function setPostponedAttribute($value)
    {
        $this->attributes['postponed'] = $this->total - $this->collected;
    }
    public function getPostponedFormattedAttribute($value)
    {
        return number_format($value, 2, '.', ','); // 10,000.00
    }
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
        return $this->belongsTo(User::class, 'created_by');
    }

    public function technicians()
    {
        return $this->belongsToMany(User::class, 'invoice_technicians', 'invoice_id', 'technician_id')
            ->withPivot('commission_percent', 'commission_amount')
            ->withTimestamps();
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function getCollectedAmountAttribute()
    {
        return $this->collections()->sum('amount');
    }

    public function getRemainingAmountAttribute()
    {
        return $this->total - $this->collected_amount;
    }
    public function collectedAmount(): float
    {
        return $this->collections()->sum('amount');
    }

    public function isCollected(): bool
    {
        return $this->collectedAmount() >= $this->total;
    }

    public function isPartial(): bool
    {
        $collected = $this->collectedAmount();
        return $collected > 0 && $collected < $this->total;
    }
}
