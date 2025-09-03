import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Customers() {
    const { customers, flash , errors } = usePage().props;
    const { data, setData, post, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        discount_percentage: '',
        company_name : ''
    });
console.log(errors , 'errors')
    const submit = (e: any) => {
        e.preventDefault();
        post(route('customers.store'), {
            onSuccess: () => reset()
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="العملاء" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2 bg-white p-4 rounded shadow md:grid grid-cols-2  gap-2">
                <Input placeholder="اسم العميل" value={data.name} onChange={e => setData('name', e.target.value)} required />
                <Input placeholder="اسم الشركة" value={data.company_name} onChange={e => setData('company_name', e.target.value)} />
                <Input type="number" placeholder="نسبة الخصم" value={data.discount_percentage} onChange={e => setData('discount_percentage', e.target.value)} />
                <Input placeholder="الايميل" value={data.email} onChange={e => setData('email', e.target.value)} />
                <Input type="text" placeholder="التليفون" value={data.phone} onChange={e => setData('phone', e.target.value)} required/>
                <Input type="text" placeholder="العنوان" value={data.address} onChange={e => setData('address', e.target.value)} />
                <Button type="submit" colSpan={2}>إضافة عميل</Button>
            </form>

            <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow className="text-right">
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">الشركة</TableHead>
                            <TableHead className="text-right">الايميل</TableHead>
                            <TableHead className="text-right">التليفون</TableHead>
                            <TableHead className="text-right">نسبة الخصم</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers?.data.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.company_name}</TableCell>
                                <TableCell>{product.email}</TableCell>
                                <TableCell>{product.phone}</TableCell>
                                <TableCell>{product.discount_percentage} %</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </AppLayout>
    );
}
