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
            // صلاحيات إدارة الكاش الفرعي
            'Cash view' => 'عرض رصيد الكاش وحركات الفرع',
            'Cash handover create' => 'تسليم مبالغ من خزينة الفرع',
            'Cash transfer create' => 'تحويل مبالغ بين الفروع',
            'Cash personal funding create' => 'توريد مالي شخصي لفرع',
            // صلاحيات إدارة التحصيلات (تؤثر على رصيد الكاش)
            'Collections view' => 'عرض التحصيلات',
            'Collections create' => 'إنشاء تحصيل',
            'Collections edit' => 'تعديل تحصيل',
            'Collections delete' => 'حذف تحصيل',
        ];

        foreach ($permissions as $name => $desc) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['slug' => \Illuminate\Support\Str::slug($name), 'description' => $desc, 'name_ar' => $desc]
            );
        }
    }
}
