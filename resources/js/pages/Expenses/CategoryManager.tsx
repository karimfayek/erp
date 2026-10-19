import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { can } from '@/utils/permissions';
import Delete from '@/components/includes/Delete';

export default function CategoryManager({ categories, onDone }: any) {
    const addForm = useForm({ name: '', description: '' });
    const editForm = useForm({ name: '', description: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const submitAdd = (e: any) => {
        e.preventDefault();
        addForm.post(route('expense-categories.store'), { onSuccess: () => { addForm.reset(); onDone(); } });
    };
    const startEdit = (c: any) => { setEditingId(c.id); editForm.setData({ name: c.name, description: c.description ?? '' }); };
    const submitEdit = (e: any) => {
        e.preventDefault(); if (!editingId) return;
        editForm.put(route('expense-categories.update', editingId), { onSuccess: () => { setEditingId(null); onDone(); } });
    };
    return (
        <div className="space-y-4">
            {can('Expense categories create') && (
                <form onSubmit={submitAdd} className="flex gap-2">
                    <Input placeholder="اسم تصنيف جديد" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                    <Button type="submit" disabled={addForm.processing}>إضافة</Button>
                </form>
            )}
            <div className="space-y-2">
                {categories?.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 border rounded p-2">
                        {editingId === c.id ? (
                            <form onSubmit={submitEdit} className="flex gap-2 flex-1">
                                <Input value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                <Button type="submit" size="sm">حفظ</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>إلغاء</Button>
                            </form>
                        ) : (
                            <><span className="flex-1">{c.name}</span>
                                {can('Expense categories edit') && <Button size="sm" variant="outline" onClick={() => startEdit(c)}>تعديل</Button>}
                                {can('Expense categories delete') && <Delete id={c.id} routeName="expense-categories.destroy" />}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
