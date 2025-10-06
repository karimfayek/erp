import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches',
        href: '#',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from 'lucide-react';
import Delete from '@/components/includes/Delete';
import { can } from '@/utils/permissions';

export default function Index() {
    const { branches, flash, errors = {} } = usePage().props;

    const { data, setData, post, reset } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
    });
    const { delete: destroy, processing } = useForm()

    const handleDelete = (id) => {
        destroy(route("users.destroy", id))
    }

    const submit = (e) => {
        e.preventDefault();
        post(route('branches.store'), {
            onSuccess: () => reset()
        });
    };
    if (!can('Branches view')) {
        return false
    }
    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الفروع" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}
            {can('Branches create') &&

                <form onSubmit={submit} className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">
                    <div>
                        <Label>اسم</Label>
                        <Input placeholder="اسم الفرع" value={data.name} onChange={e => setData('name', e.target.value)} />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label>تليفون</Label>
                        <Input placeholder="تليفون الفرع" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <Label>عنوان الفرع</Label>
                        <Input placeholder="عنوان الفرع" value={data.address} onChange={e => setData('address', e.target.value)} />
                        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                        <Label>كود</Label>
                        <Input type="number" placeholder="كود" value={data.code} onChange={e => setData('code', e.target.value)} />
                    </div>

                    <Button type="submit" className='col-span-2'>إضافة فرع</Button>
                </form>
            }

            <div className="mt-6  p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الاسم</TableHead>
                            <TableHead className='text-right'>الكود</TableHead>
                            <TableHead className='text-right'>التليفون</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches?.data?.map(branche => (
                            <TableRow key={branche.id}>
                                <TableCell>{branche.name}</TableCell>
                                <TableCell>{branche.code}</TableCell>
                                <TableCell>{branche.phone}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                            {can('Branches edit') &&

                                                <DropdownMenuItem asChild>
                                                    <Link href={route("branches.edit", branche.id)}>
                                                        تعديل
                                                    </Link>
                                                </DropdownMenuItem>
                                            }
                                            {can('Reports view') &&

                                                <DropdownMenuItem asChild>
                                                    <Link href={route("reports.branch", branche.id)}>
                                                        تقرير
                                                    </Link>
                                                </DropdownMenuItem>
                                            }
                                            <DropdownMenuSeparator />
                                            {can('Branches delete') &&
                                                <Delete id={branche.id} routeName={'branches.destroy'} />
                                            }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
