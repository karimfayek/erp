<?php

use App\Models\Collection;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;

uses(RefreshDatabase::class)->in('Feature/Sales');

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('repair command recalculates other_tax_val for incorrect values', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    Sale::create([
        'date' => '2026-01-15',
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'subtotal' => 1000.00,
        'discount_percentage' => 10.00,
        'tax' => 100.00,
        'other_tax' => 5,
        'other_tax_val' => 999.00, // incorrect: should be 45
        'total' => 955.00,
        'collected' => 0.00,
        'postponed' => 955.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    $exitCode = Artisan::call('sales:repair-amounts', ['--dry-run' => true]);

    $sale = Sale::first();
    expect((float) $sale->other_tax_val)->toBe(999.00); // unchanged in dry-run
    expect($exitCode)->toBe(0);
});

it('repair command fixes incorrect other_tax_val when not dry-run', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    Sale::create([
        'date' => '2026-01-15',
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'subtotal' => 1000.00,
        'discount_percentage' => 10.00,
        'tax' => 100.00,
        'other_tax' => 5,
        'other_tax_val' => 999.00, // incorrect: should be 45
        'total' => 955.00,
        'collected' => 0.00,
        'postponed' => 955.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    Artisan::call('sales:repair-amounts');

    $sale = Sale::first();
    // after_discount = 1000 - 100 = 900
    // other_tax_val = 900 * 5 / 100 = 45
    expect((float) $sale->other_tax_val)->toBe(45.00);
});

it('repair command fixes collected from collections table', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    $sale = Sale::create([
        'date' => '2026-01-15',
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'subtotal' => 500.00,
        'discount_percentage' => 0.00,
        'tax' => 50.00,
        'other_tax' => 0,
        'other_tax_val' => 0.00,
        'total' => 550.00,
        'collected' => 999.00, // incorrect: should be 300
        'postponed' => 0.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    Collection::create([
        'sale_id' => $sale->id,
        'amount' => 300.00,
        'collection_date' => '2026-01-15',
        'notes' => 'Payment',
        'created_by' => $this->user->id,
    ]);

    Artisan::call('sales:repair-amounts');

    $sale->refresh();
    expect((float) $sale->collected)->toBe(300.00);
    expect((float) $sale->postponed)->toBe(250.00);
});
