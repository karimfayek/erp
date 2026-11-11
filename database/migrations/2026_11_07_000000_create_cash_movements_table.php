<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->enum('type', ['handover', 'transfer_in', 'transfer_out', 'personal_funding']);
            $table->decimal('amount', 15, 2);
            $table->date('movement_date');
            $table->string('reference')->unique();
            $table->string('group_reference')->nullable()->index();
            $table->string('reference_type')->nullable();
            $table->foreignId('reference_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'movement_date']);
            $table->index(['type']);
            $table->unique(['group_reference', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
