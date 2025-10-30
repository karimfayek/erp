<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianPayroll extends Model
{
    protected $fillable = [
        'technician_id',
        'period_start',
        'period_end',
        'base_salary',
        'total_commissions',
        'deductions',
        'final_salary',
        'created_by',
        'meta',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'meta' => 'array',
    ];

    public function technician() {
        return $this->belongsTo(\App\Models\User::class, 'technician_id');
    }

    public function creator() {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
