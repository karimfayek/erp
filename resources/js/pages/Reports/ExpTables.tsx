import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpTables(p: any) {
    const { byBranch, byCategory, byUser, expenses } = p;
    return (
        <div className="space-y-4">
            <Card><CardHeader><CardTitle>مصروف كل فرع</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto"><Table>
                    <TableHeader><TableRow><TableHead className="text-right">الفرع</TableHead><TableHead className="text-right">الإجمالي</TableHead><TableHead className="text-right">العدد</TableHead></TableRow></TableHeader>
                    <TableBody>{byBranch?.map((r: any, i: number) => (<TableRow key={i}><TableCell>{r.branch}</TableCell><TableCell className="font-bold">{Number(r.total).toFixed(2)}</TableCell><TableCell>{r.count}</TableCell></TableRow>))}</TableBody>
                </Table></CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>حسب التصنيف</CardTitle></CardHeader>
                    <CardContent className="p-0"><Table>
                        <TableHeader><TableRow><TableHead className="text-right">التصنيف</TableHead><TableHead className="text-right">الإجمالي</TableHead><TableHead className="text-right">العدد</TableHead></TableRow></TableHeader>
                        <TableBody>{byCategory?.map((r: any, i: number) => (<TableRow key={i}><TableCell>{r.category}</TableCell><TableCell>{Number(r.total).toFixed(2)}</TableCell><TableCell>{r.count}</TableCell></TableRow>))}</TableBody>
                    </Table></CardContent>
                </Card>
                <Card><CardHeader><CardTitle>أعلى المستخدمين صرفاً</CardTitle></CardHeader>
                    <CardContent className="p-0"><Table>
                        <TableHeader><TableRow><TableHead className="text-right">المستخدم</TableHead><TableHead className="text-right">الإجمالي</TableHead><TableHead className="text-right">العدد</TableHead></TableRow></TableHeader>
                        <TableBody>{byUser?.map((r: any, i: number) => (<TableRow key={i}><TableCell>{r.user}</TableCell><TableCell>{Number(r.total).toFixed(2)}</TableCell><TableCell>{r.count}</TableCell></TableRow>))}</TableBody>
                    </Table></CardContent>
                </Card>
            </div>
            <Card><CardHeader><CardTitle>تفاصيل المصاريف</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto"><Table>
                    <TableHeader><TableRow><TableHead className="text-right">التاريخ</TableHead><TableHead className="text-right">الفرع</TableHead><TableHead className="text-right">التصنيف</TableHead><TableHead className="text-right">القيمة</TableHead><TableHead className="text-right">الوصف</TableHead><TableHead className="text-right">بواسطة</TableHead></TableRow></TableHeader>
                    <TableBody>{expenses?.data?.map((e: any) => (<TableRow key={e.id}><TableCell>{(e.date ?? '').slice(0, 10)}</TableCell><TableCell>{e.branch?.name ?? '-'}</TableCell><TableCell>{e.category?.name ?? '-'}</TableCell><TableCell>{Number(e.amount).toFixed(2)}</TableCell><TableCell className="max-w-[240px] truncate">{e.note}</TableCell><TableCell>{e.user?.name ?? '-'}</TableCell></TableRow>))}</TableBody>
                </Table></CardContent>
            </Card>
            <div className="flex justify-center gap-2 flex-wrap">
                {expenses?.links?.map((link: any, i: number) => (
                    <Button key={i} variant={link.active ? 'default' : 'outline'} disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        </div>
    );
}
