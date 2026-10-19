import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/utils/permissions';
import ExpenseFilters from './ExpenseFilters';
import ExpenseTable from './ExpenseTable';
import ExpenseDialog from './ExpenseDialog';
import CategoryManager from './CategoryManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Index(p: any) {
    const { expenses, branches, categories, canChooseBranch, myBranchId, filters } = p;
    const { flash } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [catOpen, setCatOpen] = useState(false);
    const { data, setData, post, put, reset, processing, errors } = useForm({
        amount: '', category_id: '', note: '',
        date: new Date().toISOString().slice(0, 10),
        branch_id: myBranchId ? String(myBranchId) : '',
    }) as any;
    const [f, setF] = useState({ branch_id: filters?.branch_id ?? 'all', category_id: filters?.category_id ?? 'all', from_date: filters?.from_date ?? '', to_date: filters?.to_date ?? '', search: filters?.search ?? '' });
    const applyFilters = (over: any = {}) => {
        const next = { ...f, ...over }; setF(next);
        router.get(route('expenses.index'), { ...next }, { preserveState: true, preserveScroll: true });
    };
    const openAdd = () => {
        setEditing(null); reset();
        setData({ amount: '', category_id: '', note: '', date: new Date().toISOString().slice(0, 10), branch_id: myBranchId ? String(myBranchId) : '' } as any);
        setOpen(true);
    };
    const openEdit = (exp: any) => {
        setEditing(exp);
        setData({ amount: exp.amount, category_id: String(exp.category_id ?? ''), note: exp.note ?? '', date: (exp.date ?? '').slice(0, 10), branch_id: exp.branch_id ? String(exp.branch_id) : (myBranchId ? String(myBranchId) : '') } as any);
        setOpen(true);
    };
    const submit = (e: any) => {
        e.preventDefault();
        if (editing) put(route('expenses.update', editing.id), { onSuccess: () => { setOpen(false); setEditing(null); } });
        else post(route('expenses.store'), { onSuccess: () => { setOpen(false); reset(); } });
    };
    if (!can('Expenses view')) return null;
    return (
        <AppLayout>
            <Head title="المصاريف" />
            <div className="p-4 space-y-4" dir="rtl">
                {flash?.success && <div className="bg-green-100 text-green-700 p-2 rounded">{flash.success}</div>}
                <div className="flex gap-2 flex-wrap">
                    {can('Expenses create') && <Button onClick={openAdd}>إضافة مصروف</Button>}
                    {can('Expense categories create') && <Button variant="outline" onClick={() => setCatOpen(true)}>إدارة التصنيفات</Button>}
                    {can('Expenses reports') && <Button variant="secondary" onClick={() => router.get(route('reports.expenses'))}>تقرير المصاريف</Button>}
                </div>
                <ExpenseFilters f={f} setF={setF} applyFilters={applyFilters} branches={branches} categories={categories} canChooseBranch={canChooseBranch} />
                <ExpenseTable expenses={expenses} openEdit={openEdit} />
                <div className="flex justify-center gap-2 flex-wrap">
                    {expenses?.links?.map((link: any, i: number) => (
                        <Button key={i} variant={link.active ? 'default' : 'outline'} disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    ))}
                </div>
                <ExpenseDialog open={open} setOpen={setOpen} editing={editing} data={data} setData={setData} submit={submit} processing={processing} errors={errors} branches={branches} categories={categories} canChooseBranch={canChooseBranch} />
                <Dialog open={catOpen} onOpenChange={setCatOpen}>
                    <DialogContent dir="rtl">
                        <DialogHeader><DialogTitle>تصنيفات المصاريف</DialogTitle></DialogHeader>
                        <CategoryManager categories={categories} onDone={() => { setCatOpen(false); router.reload(); }} />
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

