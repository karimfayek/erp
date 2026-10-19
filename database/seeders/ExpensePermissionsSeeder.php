<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class ExpensePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // نفس ستايل الأسماء المستخدمة في web.php والواجهة (name وليس slug)
        $permissions = [
            'Expenses view' => 'عرض المصاريف',
            'Expenses create' => 'إضافة مصروف',
            'Expenses edit' => 'تعديل مصروف',
            'Expenses delete' => 'حذف مصروف',
            'Expenses choose branch' => 'اختيار الفرع عند تسجيل مصروف (وإلا يسجل تلقائي على فرعه)',
            'Expenses reports' => 'تقارير المصاريف',
            'Expense categories create' => 'إضافة تصنيف مصروف',
            'Expense categories edit' => 'تعديل تصنيف مصروف',
            'Expense categories delete' => 'حذف تصنيف مصروف',
        ];

        foreach ($permissions as $name => $desc) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['slug' => \Illuminate\Support\Str::slug($name), 'description' => $desc]
            );
        }
    }
}
