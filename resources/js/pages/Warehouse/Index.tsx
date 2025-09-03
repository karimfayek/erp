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
        title: 'المخازن',
        href: '#',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Index() {
    const { warehouses , flash ,  errors = {} , branches} = usePage().props;
    console.log(warehouses , 'warehouses')
    const { data, setData, post, reset } = useForm({
        name: '',
        branch_id: '',
        code: '',
        location: '',
        is_active: 1,
    });
    const handleWarehouseChange = (e) => {
        setData('branch_id' , e )
            }
    const submit = (e) => {
        e.preventDefault();
        post(route('warehouses.store'), {
            onSuccess: () => reset()
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المخازن" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2 bg-white p-4 rounded shadow md:grid grid-cols-2  gap-2">
                 <div>
                <Label>اسم</Label>
                <Input placeholder="اسم المخزن" value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                <Label>الفرع</Label> 
                
                <Select value={String(data.branch_id || "")} onValueChange={handleWarehouseChange} >
                  <SelectTrigger className="w-full"><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                
              <div>
                <Label>كود</Label>
                <Input type="number" placeholder="كود" value={data.code} onChange={e => setData('code', e.target.value)} />
                </div>
                
                <Button type="submit" colSpan={2}>إضافة مخزن</Button>
            </form>

            <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الاسم</TableHead>
                            <TableHead className='text-right'>الكود</TableHead>
                            <TableHead className='text-right'>الفرع</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses?.data?.map(warehouse => (
                            <TableRow key={warehouse.id}>
                                <TableCell>{warehouse.name}</TableCell>
                                <TableCell>{warehouse.code}</TableCell>
                                <TableCell>{warehouse.branch?.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </AppLayout>
    );
}
