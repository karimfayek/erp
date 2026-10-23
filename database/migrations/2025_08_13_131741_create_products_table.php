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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., DSF680-4EA
            $table->string('name');
            $table->string('unit')->default('pcs'); // متر/قطعة…
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0); // %
            $table->integer('reorder_level')->default(0);
            $table->text('description')->nullable();
            $table->string('internal_code')->nullable();
            $table->string('item_code')->nullable();
            $table->string('item_type')->nullable();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('price_without_tax', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->string('type')->nullable();
            $table->boolean('maintainance')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('brand_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
