import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CashTransfer() {
    const page = usePage() as any;
    const branches = page.props.branches || [];
    const balance = page.props.balance || 0;

    if (!can('Cash transfer create')) return null;

    const { data, setData, post, processing, errors } = useForm({
        from_branch_id: '',
        to_branch_id: '',
        amount: '',
        movement_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post('/cash/transfer', {
            onError: () => {},
        });
    };

    return (
        <AppLayout>
            <Head title="تحويل مبالغ بين الفروع" />
            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>تحويل مبالغ بين الفروع</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            رصيد فرعك الحالي: {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} جنيه
                        </p>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label>الفرع المرسل</Label>
                                <Select
                                    value={data.from_branch_id}
                                    onValueChange={(v) => setData('from_branch_id', String(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الفرع المرسل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b: any) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.from_branch_id && <p className="text-red-600 text-sm">{errors.from_branch_id}</p>}
                            </div>
                            <div>
                                <Label>الفرع المستقبل</Label>
                                <Select
                                    value={data.to_branch_id}
                                    onValueChange={(v) => setData('to_branch_id', String(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الفرع المستقبل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b: any) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.to_branch_id && <p className="text-red-600 text-sm">{errors.to_branch_id}</p>}
                            </div>
                            <div>
                                <Label>المبلغ</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                />
                                {errors.amount && <p className="text-red-600 text-sm">{errors.amount}</p>}
                            </div>
                            <div>
                                <Label>التاريخ</Label>
                                <Input
                                    type="date"
                                    value={data.movement_date}
                                    onChange={(e) => setData('movement_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>السبب / ملاحظات</Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={processing} className="w-full">
                                تنفيذ التحويل
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
