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
        Schema::create('tax_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->uuid('uuid')->nullable(); // returned from ETA system
            $table->enum('submission_status', ['pending','signed','sent','failed'])->default('pending');
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedBigInteger('signed_by')->nullable();
            $table->text('error_message')->nullable();
            $table->json('payload_snapshot')->nullable(); // JSON sent to ETA
            $table->json('response_snapshot')->nullable(); // JSON response from ETA
            $table->timestamps();

            $table->foreign('signed_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['submission_status','submitted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_invoices');
    }
};
