import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { can } from '@/utils/permissions';
import ExpFilters from './ExpFilters';
import ExpCharts from './ExpCharts';
import ExpTables from './ExpTables';

export default function Expenses(p: any) {
    const { filters, branches, categories, users, canChooseBranch, info, byBranch, byCategory, daily, byUser, expenses } = p;
    const [f, setF] = useState({ branch_id: filters?.branch_id ?? 'all', category_id: filters?.category_id ?? 'all', user_id: filters?.user_id ?? 'all', from_date: filters?.from_date ?? '', to_date: filters?.to_date ?? '' });
    if (!can('Expenses reports')) return null;
    return (
        <AppLayout>
            <Head title="تقرير المصاريف" />
            <div className="p-4 space-y-4" dir="rtl">
                <h1 className="text-xl font-bold text-center">تقرير المصاريف</h1>
                <ExpFilters f={f} setF={setF} branches={branches} categories={categories} users={users} canChooseBranch={canChooseBranch} />
                <ExpCharts info={info} daily={daily} byBranch={byBranch} byCategory={byCategory} />
                <ExpTables byBranch={byBranch} byCategory={byCategory} byUser={byUser} expenses={expenses} />
            </div>
        </AppLayout>
    );
}
