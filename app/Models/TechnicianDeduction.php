<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianDeduction extends Model {
    protected $table = 'technician_deductions';
    protected $fillable = ['technician_id','amount','reason','date','created_by'];
    protected $casts = ['date' => 'date'];
    public function technician(){ return $this->belongsTo(\App\Models\User::class,'technician_id'); }
}
