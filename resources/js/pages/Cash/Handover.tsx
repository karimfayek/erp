import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CashHandover() {
    const page = usePage() as any;
    const balance = page.props.balance || 0;

    if (!can('Cash handover create')) return null;

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        movement_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post('/cash/handover', {
            onSuccess: () => {
                data.amount = '';
                data.notes = '';
            },
            onError: () => {},
        });
    };

    return (
        <AppLayout>
            <Head title="تسليم مبالغ من خزينة الفرع" />
            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>تسليم مبالغ من خزينة الفرع</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            الرصيد المتاح حالياً: {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} جنيه
                        </p>
                        <form onSubmit={submit} className="space-y-4">
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
                                <Label>ملاحظات / سبب التسليم</Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={processing} className="w-full">
                                تسجيل التسليم
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
