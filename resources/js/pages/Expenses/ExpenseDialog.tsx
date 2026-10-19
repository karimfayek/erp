import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExpenseDialog(p: any) {
    const { open, setOpen, editing, data, setData, submit, processing, errors, branches, categories, canChooseBranch } = p;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>{editing ? 'تعديل مصروف' : 'إضافة مصروف'}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    {canChooseBranch ? (
                        <div><Label>الفرع</Label>
                            <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                <SelectTrigger><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                                <SelectContent>
                                    {branches?.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (<div className="text-sm text-gray-600">سيتم التسجيل تلقائياً على فرعك</div>)}
                    <div><Label>القيمة *</Label>
                        <Input type="number" step="0.01" min="0" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                        {errors.amount && <p className="text-red-600 text-sm">{errors.amount}</p>}
                    </div>
                    <div><Label>التصنيف *</Label>
                        <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                            <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                            <SelectContent>
                                {categories?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-red-600 text-sm">{errors.category_id}</p>}
                    </div>
                    <div><Label>التاريخ *</Label>
                        <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                        {errors.date && <p className="text-red-600 text-sm">{errors.date}</p>}
                    </div>
                    <div><Label>الوصف / ملاحظة *</Label>
                        <Input value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="اكتب وصف المصروف..." />
                        {errors.note && <p className="text-red-600 text-sm">{errors.note}</p>}
                    </div>
                    <Button type="submit" disabled={processing} className="w-full">{editing ? 'حفظ التعديل' : 'إضافة'}</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

