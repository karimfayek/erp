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
        Schema::table('sales', function (Blueprint $table) {
            $table->integer('other_tax')->nullable();
            $table->decimal('other_tax_val', 10, 2)->default(0);
            $table->decimal('total', 15, 2)->nullable();
            $table->string('internal_id')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('representative_id')->nullable()->constrained('representatives')->nullOnDelete();
            $table->foreignId('customer_branch_id')->nullable()->constrained('customer_branches')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('transportation')->default(0);
            $table->enum('document_type', ['I', 'C', 'D'])->default('I');
            $table->enum('invoice_type', ['T01', 'T02', 'T03'])->default('T01');
            $table->enum('payment_method', ['C', 'T', 'CC', 'DB', 'CH', 'V', 'O', 'INSTA'])->default('C');
            $table->boolean('is_delivered')->default(1);
            $table->boolean('is_invoice')->default(1);
            $table->boolean('maintainance')->default(0);
            $table->string('eta_uuid', 250)->nullable();
            $table->string('eta_status', 250)->nullable();
            $table->boolean('marked_to_draft')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            //
        });
    }
};
