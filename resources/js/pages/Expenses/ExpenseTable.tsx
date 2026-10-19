import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { can } from '@/utils/permissions';
import Delete from '@/components/includes/Delete';

export default function ExpenseTable(p: any) {
    const { expenses, openEdit } = p;
    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الفرع</TableHead>
                        <TableHead className="text-right">التصنيف</TableHead>
                        <TableHead className="text-right">القيمة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">بواسطة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {expenses?.data?.map((exp: any) => (
                            <TableRow key={exp.id}>
                                <TableCell>{(exp.date ?? '').slice(0, 10)}</TableCell>
                                <TableCell>{exp.branch?.name ?? '-'}</TableCell>
                                <TableCell>{exp.category?.name ?? '-'}</TableCell>
                                <TableCell className="font-bold">{Number(exp.amount).toFixed(2)}</TableCell>
                                <TableCell className="max-w-[240px] truncate" title={exp.note}>{exp.note}</TableCell>
                                <TableCell>{exp.user?.name ?? '-'}</TableCell>
                                <TableCell className="flex gap-2">
                                    {can('Expenses edit') && <Button size="sm" variant="outline" onClick={() => openEdit(exp)}>تعديل</Button>}
                                    {can('Expenses delete') && <Delete id={exp.id} routeName="expenses.destroy" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
