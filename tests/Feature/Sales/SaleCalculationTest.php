<?php

use App\Models\Collection;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->in('Feature/Sales');

beforeEach(function () {
    $branch = \App\Models\Branch::create(['name' => 'Test Branch', 'code' => 'TB', 'address' => 'Test Address']);
    $warehouse = \App\Models\Warehouse::create(['name' => 'Test Warehouse', 'code' => 'TW', 'branch_id' => $branch->id]);
    $this->user = User::factory()->create(['warehouse_id' => $warehouse->id]);
    $this->actingAs($this->user);
});

function makeSalePayload($customer, $user, array $overrides = [])
{
    $product = Product::create([
        'code' => 'TP-001',
        'name' => 'Test Product',
        'price' => 100.00,
        'internal_code' => 'TP-001',
        'type' => 'service',
    ]);

    $warehouse = \App\Models\Warehouse::create([
        'name' => 'Test Warehouse',
        'code' => 'WH-001',
    ]);

    $payload = [
        'date' => '2026-01-15',
        'customer_id' => $customer->id,
        'user_id' => $user->id,
        'subtotal' => 1000.00,
        'discount_percentage' => 10.00,
        'tax' => 100.00,
        'other_tax' => 5,
        'other_tax_val' => 0,
        'total' => 0,
        'collected' => 0,
        'postponed' => 0,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
        'items' => [
            [
                'product_id' => $product->id,
                'inv' => $warehouse->id,
                'qty' => 1,
                'replacing' => false,
                'unit_price' => 1000.00,
            ],
        ],
        'technicians' => [],
    ];

    return array_merge($payload, $overrides);
}

it('calculates total, other_tax_val, collected, and postponed on sale creation', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    $payload = makeSalePayload($customer, $this->user);

    $response = $this->post('/sales', $payload);

    $response->assertRedirect();

    $sale = Sale::first();

    // after_discount = 1000 - (1000 * 10 / 100) = 900
    // other_tax_val = 900 * 5 / 100 = 45
    // total = 900 - 45 + 100 = 955
    // collected = 0 (no collections)
    // postponed = 955 - 0 = 955
    expect((float) $sale->other_tax_val)->toBe(45.00);
    expect((float) $sale->total)->toBe(955.00);
    expect((float) $sale->collected)->toBe(0.00);
    expect((float) $sale->postponed)->toBe(955.00);
});

it('does not trust client-supplied total, collected, postponed, other_tax_val', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    // Client sends wildly incorrect values
    $payload = makeSalePayload($customer, $this->user, [
        'other_tax_val' => 99999.00, // client lies
        'total' => 99999.00, // client lies
        'collected' => 99999.00, // client lies
        'postponed' => 0.00, // client lies
        'subtotal' => 1000.00,
        'discount_percentage' => 0.00,
        'tax' => 100.00,
        'other_tax' => 0,
    ]);

    $response = $this->post('/sales', $payload);
    $response->assertRedirect();

    $sale = Sale::first();

    // after_discount = 1000 - 0 = 1000
    // other_tax_val = 1000 * 0 / 100 = 0
    // total = 1000 - 0 + 100 = 1100
    expect((float) $sale->other_tax_val)->toBe(0.00);
    expect((float) $sale->total)->toBe(1100.00);
    expect((float) $sale->collected)->toBe(0.00);
    expect((float) $sale->postponed)->toBe(1100.00);
});

it('creates a collection row when collected > 0 on sale creation', function () {
    $customer = Customer::create([
        'name' => 'Test Customer',
        'phone' => '1234567890',
    ]);

    $payload = makeSalePayload($customer, $this->user, [
        'subtotal' => 500.00,
        'discount_percentage' => 0.00,
        'tax' => 50.00,
        'other_tax' => 0,
        'other_tax_val' => 0,
        'total' => 0,
        'collected' => 200.00,
        'postponed' => 0,
    ]);

    $response = $this->post('/sales', $payload);
    $response->assertRedirect();

    $sale = Sale::first();

    // total = 500 - 0 + 50 = 550
    // collected = 200 (from collection row)
    // postponed = 550 - 200 = 350
    expect((float) $sale->total)->toBe(550.00);
    expect((float) $sale->collected)->toBe(200.00);
    expect((float) $sale->postponed)->toBe(350.00);
    expect((float) Collection::where('sale_id', $sale->id)->sum('amount'))->toBe(200.00);
});
