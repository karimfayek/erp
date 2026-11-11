
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Types
interface Branch {
    id: number;
    name: string;
}

interface Movement {
    id: number;
    type: string;
    amount: number | string;
    movement_date: string | null;
    reference: string | null;
    notes: string | null;
    user?: {
        name: string;
    } | null;
}

interface CashPageProps {
    balance?: number | string;
    branch_id?: number | string | null;
    branches?: Branch[];
    movements?: {
        data?: Movement[];
    };
}

// Movement labels
const movementLabels: Record<string, string> = {
    personal_funding: 'توريد شخصي',
    transfer_in: 'تحويل وارد',
    transfer_out: 'تحويل صادر',
    expense: 'مصروف',
    collection: 'تحصيل فاتورة',
    handover: 'تسليم مبالغ',
};

// Movement badge variants
const movementVariants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    personal_funding: 'default',
    transfer_in: 'default',
    transfer_out: 'destructive',
    expense: 'destructive',
    collection: 'default',
    handover: 'destructive',
};

// Format currency
const formatAmount = (amount: number | string) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return '0.00';
    }

    return Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Format movement sign
const getMovementSign = (amount: number | string) => {
    const value = Number(amount);

    if (value > 0) return '+';
    if (value < 0) return '-';

    return '';
};

export default function CashIndex() {
    const { props } = usePage<CashPageProps>();

    const balance = Number(props.balance ?? 0) || 0;

    const branchId = props.branch_id
        ? Number(props.branch_id)
        : null;

    const branches = props.branches ?? [];

    const movements = props.movements?.data ?? [];

    const [openBranches, setOpenBranches] = useState(false);

    const selectedBranch = branches.find(
        (branch) => branch.id === branchId
    );

    return (
        <AppLayout>
            <Head title="رصيد الكاش الفرعي" />

            <div className="p-4 space-y-6">

                {/* Branch Selector */}
                {can('Cash view') && branches.length > 0 && (
                    <div className="relative w-fit">
                        <Button
                            size="default"
                            variant="outline"
                            onClick={() =>
                                setOpenBranches(!openBranches)
                            }
                        >
                            {selectedBranch
                                ? selectedBranch.name
                                : 'اختيار الفرع'}

                            <span className="mr-2">
                                {openBranches ? '▲' : '▼'}
                            </span>
                        </Button>

                        {openBranches && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() =>
                                        setOpenBranches(false)
                                    }
                                />

                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-md border shadow-lg py-2 z-20">

                                    {branches.map((branch) => (
                                        <a
                                            key={branch.id}
                                            href={`/cash?branch_id=${branch.id}`}
                                            onClick={() =>
                                                setOpenBranches(false)
                                            }
                                            className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${branch.id === branchId
                                                ? 'bg-gray-100 dark:bg-gray-800 font-bold'
                                                : ''
                                                }`}
                                        >
                                            {branch.name}
                                        </a>
                                    ))}

                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Cash Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            رصيد الفرع المتاح
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="text-center py-8">

                        <div className="text-4xl font-bold text-green-600">
                            {balance.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            جنيه مصري
                        </p>

                        {branchId && (
                            <p className="text-sm text-gray-500 mt-2">
                                الفرع رقم: {branchId}
                            </p>
                        )}

                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4 flex-wrap">

                    {can('Cash handover create') && (
                        <Button asChild>
                            <a href="/cash/handover">
                                تسليم مبالغ
                            </a>
                        </Button>
                    )}

                    {can('Cash transfer create') && (
                        <Button asChild variant="outline">
                            <a href="/cash/transfer">
                                تحويل بين فروع
                            </a>
                        </Button>
                    )}

                    {can('Cash personal funding create') && (
                        <Button asChild variant="secondary">
                            <a href="/cash/funding">
                                توريد شخصي
                            </a>
                        </Button>
                    )}

                </div>

                {/* Cash Movements */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            سجل الحركات النقدية
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {movements.length > 0 ? (

                            <div className="overflow-x-auto">

                                <Table>

                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">
                                                التاريخ
                                            </TableHead>

                                            <TableHead className="text-right">
                                                النوع
                                            </TableHead>

                                            <TableHead className="text-right">
                                                المبلغ
                                            </TableHead>

                                            <TableHead className="text-right">
                                                المرجع
                                            </TableHead>

                                            <TableHead className="text-right">
                                                المستخدم
                                            </TableHead>

                                            <TableHead className="text-right">
                                                الملاحظات
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>

                                        {movements.map((movement) => {

                                            const amount = Number(
                                                movement.amount
                                            );

                                            return (
                                                <TableRow key={movement.id}>

                                                    {/* Date */}
                                                    <TableCell>
                                                        {movement.movement_date
                                                            ? movement.movement_date.substring(0, 10)
                                                            : '-'}
                                                    </TableCell>

                                                    {/* Type */}
                                                    <TableCell>
                                                        <Badge
                                                            className="overflow-hidden"
                                                            variant={
                                                                movementVariants[movement.type] ??
                                                                'secondary'
                                                            }
                                                        >
                                                            {movementLabels[movement.type] ??
                                                                'حركة نقدية'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell
                                                        className={`font-mono font-semibold ${['expense', 'handover', 'transfer_out'].includes(movement.type)
                                                            ? 'text-red-600'
                                                            : amount > 0
                                                                ? 'text-green-600'
                                                                : amount < 0
                                                                    ? 'text-red-600'
                                                                    : ''
                                                            }`}
                                                    >
                                                        {['expense', 'handover', 'transfer_out'].includes(movement.type)
                                                            ? '-'
                                                            : amount > 0
                                                                ? '+'
                                                                : amount < 0
                                                                    ? '-'
                                                                    : ''
                                                        }
                                                        {formatAmount(movement.amount)}
                                                    </TableCell>

                                                    {/* Reference */}
                                                    <TableCell>
                                                        {movement.reference || '-'}
                                                    </TableCell>

                                                    {/* User */}
                                                    <TableCell>
                                                        {movement.user?.name || '-'}
                                                    </TableCell>

                                                    {/* Notes */}
                                                    <TableCell className="text-sm">
                                                        {movement.notes || '-'}
                                                    </TableCell>

                                                </TableRow>
                                            );
                                        })}

                                    </TableBody>

                                </Table>

                            </div>

                        ) : (

                            <div className="text-center py-10 text-gray-500">
                                لا توجد حركات نقدية حتى الآن
                            </div>

                        )}

                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
