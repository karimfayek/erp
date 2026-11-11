<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('expenses')) {
            Schema::create('expenses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->decimal('amount', 12, 2)->default(0);
                $table->text('note')->nullable();
                $table->date('date')->nullable();
                $table->timestamps();
            });
            return;
        }

        Schema::table('expenses', function (Blueprint $table) {
            if (! Schema::hasColumn('expenses', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            }
            if (! Schema::hasColumn('expenses', 'category_id')) {
                $table->foreignId('category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            }
            if (! Schema::hasColumn('expenses', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('expenses', 'amount')) {
                $table->decimal('amount', 12, 2)->default(0);
            }
            if (! Schema::hasColumn('expenses', 'note')) {
                $table->text('note')->nullable();
            }
            // توحيد حقل الوصف القديم description مع note
            if (! Schema::hasColumn('expenses', 'description') && Schema::hasColumn('expenses', 'note')) {
                // لا شيء - سنستخدم note فقط
            }
            if (! Schema::hasColumn('expenses', 'date')) {
                $table->date('date')->nullable();
            }
        });

        // تبسيط الجدول القديم: حذف أعمدة transport/shipping/overtime/employee_name إن وجدت
        foreach (['transport', 'shipping', 'overtime', 'employee_name'] as $col) {
            if (Schema::hasColumn('expenses', $col)) {
                Schema::table('expenses', function (Blueprint $table) use ($col) {
                    $table->dropColumn($col);
                });
            }
        }
    }

    public function down(): void
    {
        // لا نحذف تلقائياً للحفاظ على البيانات
        // Schema::dropIfExists('expenses');
    }
};
