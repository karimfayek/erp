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
        $this->attributes['postponed'] = $value;
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

    /**
     * The amount still owed on this sale.
     *
     * Never negative: an over-collected sale has nothing left to postpone.
     */
    public function getRemainingAmountAttribute()
    {
        return max(0, (float) $this->total - (float) $this->collected_amount);
    }

    public function collectedAmount(): float
    {
        return (float) $this->collections()->sum('amount');
    }

    /**
     * Recompute the money columns of the sale and keep them consistent.
     *
     * - other_tax_val is derived from (subtotal - discount) * other_tax / 100
     * - total is derived from the subtotal, discount, tax and other tax
     * - collected is the sum of the rows in the collections table
     * - postponed is whatever is left to collect
     */
    public function recalculateAmounts(bool $syncCollected = true): self
    {
        $subtotal = (float) $this->subtotal;
        $discountPercentage = (float) ($this->discount_percentage ?? 0);
        $afterDiscount = $subtotal - ($subtotal * $discountPercentage / 100);

        $otherTaxValue = round($afterDiscount * (float) ($this->other_tax ?? 0) / 100, 2);
        $taxValue = round((float) $this->tax, 2);

        $this->other_tax_val = $otherTaxValue;
        $this->total = round($afterDiscount - $otherTaxValue + $taxValue, 2);

        if ($syncCollected) {
            $this->collected = $this->collectedAmount();
        }

        $this->postponed = max(0, (float) $this->total - (float) $this->collected);

        return $this;
    }

    /**
     * Sync the stored collected/postponed columns with the collections table.
     */
    public function syncCollectionTotals(): self
    {
        $this->collected = $this->collectedAmount();
        $this->postponed = max(0, (float) $this->total - (float) $this->collected);

        return $this;
    }

    /**
     * Set the collected amount of the sale by adjusting the collection rows.
     *
     * Existing rows keep their date and notes: a bigger amount adds a new row,
     * a smaller one trims the most recent rows first.
     */
    public function applyCollectedAmount(float $amount): self
    {
        $amount = round($amount, 2);
        $difference = round($amount - $this->collectedAmount(), 2);

        if ($difference > 0) {
            $this->collections()->create([
                'amount' => $difference,
                'collection_date' => now(),
                'created_by' => auth()->id(),
            ]);
        } elseif ($difference < 0) {
            $remaining = abs($difference);

            foreach ($this->collections()->orderByDesc('id')->get() as $collection) {
                if ($remaining <= 0.001) {
                    break;
                }

                $collectionAmount = (float) $collection->amount;

                if ($collectionAmount <= $remaining + 0.001) {
                    $remaining -= $collectionAmount;
                    $collection->delete();
                } else {
                    $collection->amount = round($collectionAmount - $remaining, 2);
                    $collection->save();
                    $remaining = 0;
                }
            }
        }

        return $this->syncCollectionTotals();
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
