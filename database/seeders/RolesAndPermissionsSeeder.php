<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name'=>'Super Admin','slug'=>'super-admin'],
            ['name'=>'Sales','slug'=>'sales'],
            ['name'=>'Warehouse','slug'=>'warehouse'],
            ['name'=>'Accounting','slug'=>'accounting'],
            ['name'=>'Viewer','slug'=>'viewer'],
        ];

        foreach ($roles as $r) Role::firstOrCreate(['slug'=>$r['slug']], $r);

        $perms = [
            ['name'=>'View Invoices','slug'=>'invoice.view'],
            ['name'=>'Create Invoice','slug'=>'invoice.create'],
            ['name'=>'Edit Invoice','slug'=>'invoice.edit'],
            ['name'=>'Delete Invoice','slug'=>'invoice.delete'],
            ['name'=>'Sign & Send Tax','slug'=>'tax.signsend'],
            ['name'=>'View Inventory','slug'=>'inventory.view'],
            ['name'=>'Move Inventory','slug'=>'inventory.move'],
            ['name'=>'View Expenses','slug'=>'expense.view'],
            ['name'=>'Create Expense','slug'=>'expense.create'],
        ];

        foreach ($perms as $p) Permission::firstOrCreate(['slug'=>$p['slug']], $p);
    }
}
