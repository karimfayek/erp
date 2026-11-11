<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('expense_categories')) {
            Schema::create('expense_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('description')->nullable();
                $table->timestamps();
            });
            return;
        }

        Schema::table('expense_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('expense_categories', 'name')) {
                $table->string('name')->unique();
            }
            if (! Schema::hasColumn('expense_categories', 'description')) {
                $table->string('description')->nullable();
            }
        });
    }

    public function down(): void
    {
        // لا نحذف تلقائياً للحفاظ على البيانات
        // Schema::dropIfExists('expense_categories');
    }
};
