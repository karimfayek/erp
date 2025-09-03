import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches',
        href: '#',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Index() {
    const { branches , flash ,  errors = {}} = usePage().props;
    console.log(branches , 'branches')
    const { data, setData, post, reset } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
    });
    
    const submit = (e) => {
        e.preventDefault();
        post(route('branches.store'), {
            onSuccess: () => reset()
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الفروع" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2 bg-white p-4 rounded shadow md:grid grid-cols-2  gap-2">
                 <div>
                <Label>اسم</Label>
                <Input placeholder="اسم الفرع" value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                <Label>العنوان</Label>
                <Input placeholder="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                <Label>تليفون</Label>
                <Input placeholder="تليفون الفرع" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
                
              <div>
                <Label>كود</Label>
                <Input type="number" placeholder="كود" value={data.code} onChange={e => setData('code', e.target.value)} />
                </div>
                
                <Button type="submit" colSpan={2}>إضافة فرع</Button>
            </form>

            <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الاسم</TableHead>
                            <TableHead className='text-right'>الكود</TableHead>
                            <TableHead className='text-right'>التليفون</TableHead>
                            <TableHead className='text-right'>العنوان</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches?.data?.map(branche => (
                            <TableRow key={branche.id}>
                                <TableCell>{branche.name}</TableCell>
                                <TableCell>{branche.code}</TableCell>
                                <TableCell>{branche.phone}</TableCell>
                                <TableCell>{branche.address}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </AppLayout>
    );
}
