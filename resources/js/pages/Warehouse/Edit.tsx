import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'المخازن',
        href: '#',
    },
];


export default function Edit({warehouse}) {
    const {  flash ,  errors = {} , branches} = usePage().props;
    
    const { data, setData, put, reset } = useForm({
        name: warehouse.name || '',
        branch_id: warehouse.branch_id || '',
        code:warehouse.code || '',
        location:warehouse.location || '',
        is_active:warehouse.is_active || 1,
    });
    const handleWarehouseChange = (e) => {
        setData('branch_id' , e )
            }
    const submit = (e) => {
        e.preventDefault();
        put(route('warehouses.update' , warehouse.id), {
           onSuccess: () => {
                toast("تم  التعديل  بنجاح");
            }
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المخازن" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">
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
                
                <Button type="submit"className='col-span-2'>تعديل مخزن</Button>
            </form>
            </AppLayout>
    )
}