<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();

            // Relation to sales (invoice)
            $table->foreignId('sale_id')
                ->constrained('sales')
                ->cascadeOnDelete();

            // Collected amount
            $table->decimal('amount', 15, 2);

            // Actual collection date (important for reports)
            $table->date('collection_date');

            // Optional notes (cash / transfer / cheque / etc.)
            $table->text('notes')->nullable();
            $table->string('method')->nullable();
            $table->string('reference_number')->nullable();
            // Admin / user who added the collection
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            // Indexes for reports performance
            $table->index(['collection_date']);
            $table->index(['sale_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
