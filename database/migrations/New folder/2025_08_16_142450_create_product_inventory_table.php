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
        Schema::create('product_inventory', function (Blueprint $table) {
            $table->id();
    $table->foreignId('product_id')->constrained();
    $table->foreignId('warehouse_id')->constrained();
    $table->integer('quantity')->default(0);
    $table->integer('min_quantity')->default(0); // لإعادة الطلب
    $table->timestamps();
    
    $table->unique(['product_id', 'warehouse_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_inventory');
    }
};
