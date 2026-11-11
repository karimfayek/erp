<?php

use App\Models\Collection;
use App\Models\Customer;
use App\Models\Permission;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->in('Feature/Sales');

beforeEach(function () {
    $this->user = User::factory()->create();

    // منح صلاحيات التحصيل للمستخدم التجريبي (لأننا أضفنا middleware للصدقية)
    $collectionPerms = [
        'Collections view' => 'collections-view',
        'Collections create' => 'collections-create',
        'Collections edit' => 'collections-edit',
        'Collections delete' => 'collections-delete',
    ];
    foreach ($collectionPerms as $permName => $permSlug) {
        $perm = Permission::firstOrCreate(
            ['name' => $permName],
            ['slug' => $permSlug]
        );
        $this->user->permissions()->attach($perm->id);
    }

    $this->actingAs($this->user);
});

it('creates a collection and syncs sale totals', function () {
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
        'collected' => 0.00,
        'postponed' => 550.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    $response = $this->post('/collections', [
        'sale_id' => $sale->id,
        'amount' => 200.00,
        'collection_date' => '2026-01-15',
        'method' => 'cash',
        'notes' => 'Partial payment',
    ]);

    $response->assertRedirect();

    $sale->refresh();
    expect((float) $sale->collected)->toBe(200.00);
    expect((float) $sale->postponed)->toBe(350.00);
    expect((float) Collection::where('sale_id', $sale->id)->sum('amount'))->toBe(200.00);
});

it('updates a collection and syncs sale totals', function () {
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
        'collected' => 0.00,
        'postponed' => 550.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    $collection = Collection::create([
        'sale_id' => $sale->id,
        'amount' => 200.00,
        'collection_date' => '2026-01-15',
        'notes' => 'Initial',
        'created_by' => $this->user->id,
    ]);

    $response = $this->put("/collections/{$collection->id}", [
        'amount' => 300.00,
        'collection_date' => '2026-01-16',
        'method' => 'cash',
        'notes' => 'Updated',
    ]);

    $response->assertRedirect();

    $sale->refresh();
    expect((float) $sale->collected)->toBe(300.00);
    expect((float) $sale->postponed)->toBe(250.00);
    expect((float) Collection::where('sale_id', $sale->id)->sum('amount'))->toBe(300.00);
});

it('deletes a collection and syncs sale totals', function () {
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
        'collected' => 0.00,
        'postponed' => 550.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    $collection = Collection::create([
        'sale_id' => $sale->id,
        'amount' => 200.00,
        'collection_date' => '2026-01-15',
        'notes' => 'Payment',
        'created_by' => $this->user->id,
    ]);

    $response = $this->delete("/collections/{$collection->id}");

    $response->assertRedirect();

    $sale->refresh();
    expect((float) $sale->collected)->toBe(0.00);
    expect((float) $sale->postponed)->toBe(550.00);
    expect(Collection::where('sale_id', $sale->id)->count())->toBe(0);
});

it('stores method and reference_number on collection', function () {
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
        'collected' => 0.00,
        'postponed' => 550.00,
        'expenses' => 0.00,
        'document_type' => 'I',
        'invoice_type' => 'T01',
        'payment_method' => 'C',
        'is_delivered' => true,
        'is_invoice' => true,
        'maintainance' => false,
    ]);

    $collection = Collection::create([
        'sale_id' => $sale->id,
        'amount' => 200.00,
        'collection_date' => '2026-01-15',
        'notes' => 'Cash payment',
        'method' => 'cash',
        'reference_number' => 'REF-123',
        'created_by' => $this->user->id,
    ]);

    expect($collection->method)->toBe('cash');
    expect($collection->reference_number)->toBe('REF-123');
});


