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
        Schema::create('sales', function (Blueprint $table) {
           $table->id();
			$table->date('date');
			$table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
			$table->foreignId('employee_id')->nullable()->constrained('customers')->nullOnDelete();
			$table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // الموظف
			$table->decimal('subtotal', 12, 2)->default(0);
			$table->decimal('discount_percentage', 5, 2)->default(0);
			$table->decimal('collected', 12, 2)->default(0); // ما تم تحصيله
			$table->decimal('postponed', 12, 2)->default(0); // المؤجل
			$table->decimal('tax', 12, 2)->default(0);
			$table->decimal('expenses', 12, 2)->default(0);
			$table->string('unknown_f')->nullable(); // العمود "ف"
			$table->string('invoice_number')->nullable(); // رقم الفاتورة
			$table->text('notes')->nullable();
			$table->timestamps();

            $table->index(['date','customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_sales');
    }
};
