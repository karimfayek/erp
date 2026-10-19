import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpFilters(p: any) {
    const { f, setF, branches, categories, users, canChooseBranch } = p;
    const apply = () => router.get(route('reports.expenses'), { ...f }, { preserveState: true });
    return (
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">فلترة</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {canChooseBranch && (
                    <div><Label>الفرع</Label>
                        <Select value={f.branch_id} onValueChange={(v) => setF({ ...f, branch_id: v })}>
                            <SelectTrigger><SelectValue placeholder="الفرع" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">كل الفروع</SelectItem>
                                {branches?.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div><Label>التصنيف</Label>
                    <Select value={f.category_id} onValueChange={(v) => setF({ ...f, category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">الكل</SelectItem>
                            {categories?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div><Label>المستخدم</Label>
                    <Select value={f.user_id} onValueChange={(v) => setF({ ...f, user_id: v })}>
                        <SelectTrigger><SelectValue placeholder="المستخدم" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">الكل</SelectItem>
                            {users?.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div><Label>من</Label><Input type="date" value={f.from_date} onChange={(e) => setF({ ...f, from_date: e.target.value })} /></div>
                <div><Label>إلى</Label><Input type="date" value={f.to_date} onChange={(e) => setF({ ...f, to_date: e.target.value })} /></div>
                <div className="flex items-end gap-2 md:col-span-5">
                    <Button onClick={apply}>عرض</Button>
                </div>
            </CardContent>
        </Card>
    );
}
