<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryTransferController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CustomerBranchController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\TaxInvoiceController;
use Inertia\Inertia;
use Carbon\Carbon;
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', 
        [
            'stats' => [
                'branches' => \App\Models\Branch::count(),
                'warehouses' => \App\Models\Warehouse::count(),
                'products' => \App\Models\Product::count(),
                'transfers' => \App\Models\InventoryTransfer::whereDate('created_at', today())->count(),
                'sales' => \App\Models\Sale::sum('total'),
            ],
            'dailySales' => \App\Models\Sale::selectRaw('DATE(created_at) as date, SUM(subtotal) as total')
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
            return [
                'date' => Carbon::parse($row->date)->toDateString(),
                'total' => $row->total,
            ];
            })
        ]); 
   
    })->name('dashboard');
    Route::resource('users', UserController::class);
    Route::resource('products', ProductController::class);
    Route::post('/products/{product}/inventories', [InventoryTransferController::class, 'update']);
    Route::resource('customers', CustomerController::class);
    Route::resource('customer-branches', CustomerBranchController::class);
    Route::resource('representatives', \App\Http\Controllers\RepresentativeController::class);
    Route::resource('sales', SalesController::class);
    Route::get('/invoices', [SalesController::class, 'invoices'])->name('invoices.index');
      Route::post('/inventory/qtyCheck', [SalesController::class, 'qtyCheck'])->name('inventory.qtyCheck');
    Route::get('/invoice/{id}', [SalesController::class, 'show'])->name('invoice.show');
    Route::get('/invoice/{id}/details', [SalesController::class, 'details'])->name('invoice.details');
    
Route::post('/invoices/{invoice}/toggle-delivery', [SalesController::class, 'toggleDelivery'])->name('delivery.status');
Route::post('/invoices/{invoice}/update-collection', [SalesController::class, 'updateCollection']);

    Route::resource('inventory-transfers', InventoryTransferController::class);
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('roles', RoleController::class);
Route::get('/users/roles/set', [UserRoleController::class, 'index'])->name('users.roles.index')->middleware('permission:super');
Route::put('/users/{user}/roles', [UserRoleController::class, 'update'])->name('users.roles.update')->middleware('permission:super');
Route::get('/access-control', [UserRoleController::class, 'AccessControl'])->name('access.control')->middleware('permission:super');

Route::put('/roles/{user}/permissions', [UserPermissionController::class, 'update'])
    ->name('users.permissions.update')->middleware('permission:super');

Route::post('/invoices/{id}/send-to-eta', [TaxInvoiceController::class, 'sendToETA'])
    ->name('invoices.sendToETA')->middleware('permission:Invoice send');
    // للحصول على الرصيد المتاح
    Route::get('/api/inventory/available-quantity', function (Request $request) {
    $quantity = App\Models\ProductInventory::where('product_id', $request->product_id)
        ->where('warehouse_id', $request->warehouse_id)
        ->value('quantity') ?? 0;
        
    return response()->json(['quantity' => $quantity]);
    });
//reports
Route::get('/reports/dashboard', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.dashboard')->middleware('permission:Reports view');
Route::get('/reports/user/{user}', [\App\Http\Controllers\ReportController::class, 'user'])->name('reports.user')->middleware('permission:Reports view');
Route::get('/reports/branch/{branch}', [\App\Http\Controllers\ReportController::class, 'branch'])->name('reports.branch')->middleware('permission:Reports view');
Route::get('/reports/invoices', [\App\Http\Controllers\ReportController::class, 'invoices'])->name('reports.invoices')->middleware('permission:Reports view');
Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');


//activity
Route::get('/user/activity/login/{id?}', [\App\Http\Controllers\ActivityController::class, 'login'])->name('user.login.activity')->middleware('permission:super');



});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
