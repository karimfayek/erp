<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales_items', function (Blueprint $table) {
            // نضيف نوع العنصر (منتج أو خدمة)
            $table->enum('item_type', ['product', 'service'])->default('product')->after('id');

            // رقم العنصر، إما من جدول products أو services
            $table->unsignedBigInteger('item_id')->nullable()->after('item_type');

            // تكلفة القطعة (للمنتجات فقط) نجعلها nullable
            $table->decimal('cost_price', 10, 2)->nullable()->change();

            // تأكد من وجود سعر البيع
            $table->decimal('sell_price', 10, 2)->change();

            // إن كان المنتج بديلًا عن منتج آخر
            $table->boolean('replacing')->default(false);

            // اسم المنتج (للعرض (snapshot)
            $table->string('product_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_items', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'item_id']);
        });
    }
};
