<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryTransferController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('users', UserController::class);
    Route::resource('products', ProductController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('sales', SalesController::class);
    Route::get('/invoices', [SalesController::class, 'invoices'])->name('invoices.index');
    

    Route::resource('inventory-transfers', InventoryTransferController::class);
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('branches', BranchController::class);


    // للحصول على الرصيد المتاح
    Route::get('/api/inventory/available-quantity', function (Request $request) {
    $quantity = App\Models\ProductInventory::where('product_id', $request->product_id)
        ->where('warehouse_id', $request->warehouse_id)
        ->value('quantity') ?? 0;
        
    return response()->json(['quantity' => $quantity]);
    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
