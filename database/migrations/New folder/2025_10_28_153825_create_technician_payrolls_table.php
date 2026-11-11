<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('technician_payrolls', function (Blueprint $table) {
           $table->id();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('base_salary', 10, 2)->default(0);
            $table->decimal('total_commissions', 12, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('final_salary', 12, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable(); // تفاصيل إضافية (مثل list of invoice ids, breakdown)
            $table->timestamps();

            $table->unique(['technician_id','period_start','period_end'], 'tech_period_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technician_payrolls');
    }
};
