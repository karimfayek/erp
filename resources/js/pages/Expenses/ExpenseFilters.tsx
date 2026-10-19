import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpenseFilters({ f, setF, applyFilters, branches, categories, canChooseBranch }: any) {
    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">بحث وفلترة</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {canChooseBranch && (
                    <div><Label>الفرع</Label>
                        <Select value={f.branch_id} onValueChange={(v) => applyFilters({ branch_id: v })}>
                            <SelectTrigger><SelectValue placeholder="الفرع" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">كل الفروع</SelectItem>
                                {branches?.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div><Label>التصنيف</Label>
                    <Select value={f.category_id} onValueChange={(v) => applyFilters({ category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">كل التصنيفات</SelectItem>
                            {categories?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div><Label>من</Label><Input type="date" value={f.from_date} onChange={(e) => setF({ ...f, from_date: e.target.value })} /></div>
                <div><Label>إلى</Label><Input type="date" value={f.to_date} onChange={(e) => setF({ ...f, to_date: e.target.value })} /></div>
                <div><Label>بحث</Label><Input value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} placeholder="في الملاحظة..." /></div>
                <div className="flex items-end gap-2 md:col-span-5">
                    <Button onClick={() => applyFilters()}>عرض</Button>
                    <Button variant="outline" onClick={() => applyFilters({ branch_id: 'all', category_id: 'all', from_date: '', to_date: '', search: '' })}>تصفير</Button>
                </div>
            </CardContent>
        </Card>
    );
}
