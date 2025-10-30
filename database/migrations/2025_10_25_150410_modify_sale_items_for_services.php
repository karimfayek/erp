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
        Schema::table('sales_items', function (Blueprint $table) {
            // نحذف product_id إذا موجود، أو نخليه optional
            if (Schema::hasColumn('sales_items', 'product_id')) {
                $table->dropColumn('product_id');
            }

            // نضيف نوع العنصر (منتج أو خدمة)
            $table->enum('item_type', ['product', 'service'])->default('product');

            // رقم العنصر، إما من جدول products أو services
            $table->unsignedBigInteger('item_id');

            // تكلفة القطعة (للمنتجات فقط) نجعلها nullable
            $table->decimal('cost_price', 10, 2)->nullable()->change();

            // تأكد من وجود سعر البيع
            $table->decimal('sell_price', 10, 2)->change();
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
