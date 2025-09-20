<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions list
        $permissions = [
            // Users
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'users.edit.name', 'users.edit.email', 'users.edit.role', 'users.edit.password',

            // Clients
            'clients.view', 'clients.create', 'clients.edit', 'clients.delete',

            // Invoices
            'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
            'invoices.export_pdf', 'invoices.send_email',

            // Inventory & Products
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'stock.transfer', 'stock.view_history',

            // Branches
            'branches.view', 'branches.create', 'branches.edit', 'branches.delete',

            // E-Invoice
            'einvoice.connect', 'einvoice.send', 'einvoice.view_logs',

            // Settings
            'settings.view', 'settings.update',
        ];

        // Insert all permissions
        $permissionModels = [];
        foreach ($permissions as $perm) {
            $permissionModels[$perm] = Permission::firstOrCreate([
                'slug' => $perm,
            ], [
                'name' => ucfirst(str_replace('.', ' ', $perm)),
            ]);
        }

        // Roles with their permissions
        $roles = [
            'Super Admin' => $permissions, // full access
            'Admin' => [
                'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
                'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
                'products.view', 'products.create', 'products.edit', 'products.delete',
                'stock.transfer', 'branches.view', 'branches.create', 'branches.edit',
            ],
            'Accountant' => [
                'invoices.view', 'invoices.create', 'invoices.export_pdf', 'invoices.send_email',
                'clients.view',
            ],
            'Store Keeper' => [
                'products.view', 'stock.transfer', 'stock.view_history',
            ],
            'Sales' => [
                'clients.view', 'clients.create',
                'invoices.view', 'invoices.create',
            ],
            'Viewer' => [
                'users.view', 'clients.view', 'invoices.view', 'products.view',
            ],
        ];

        foreach ($roles as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->permissions()->sync(array_map(fn($p) => $permissionModels[$p]->id, $rolePerms));
        }

        // Attach Super Admin role to first user
        $user1 = User::first();
        if ($user1) {
            $superAdmin = Role::where('name', 'Super Admin')->first();
            $user1->roles()->syncWithoutDetaching([$superAdmin->id]);
        }

        // Example: Give second user direct permissions
        $user2 = User::skip(1)->first();
        if ($user2) {
            $user2->directPermissions()->sync([
                $permissionModels['users.edit.email']->id,
                $permissionModels['invoices.export_pdf']->id,
            ]);
        }
    }
}
