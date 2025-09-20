import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer Branches',
        href: '#',
    },
];import { can } from '@/utils/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Customer = {
    id: number;
    name: string;
    address: string;
    // add other fields if needed
};

export default function Edit( {branche , customers} ) {
    const { flash ,  errors = {}} = usePage().props as unknown as { 
        
        flash: any, 
        errors: Record<string, string>
    };
   console.log(branche);
    const { data, setData, put, reset } = useForm({
        name: branche?.name ||   '',
        address: branche?.address || '',
        customer_id: branche?.customer_id || '',
    });
    const handleCustomerChange = (value: string) => {
        setData('customer_id', value);
    }

 

    const submit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        put(route('customer-branches.update', { id: branche.id }), {
           
        });
    };
if(!can('Branches view')){
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
                <Label>العميل</Label>

                <Select value={String(data.customer_id || "")} onValueChange={handleCustomerChange} >
                  <SelectTrigger className="w-full"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                
                <div>
                <Label>عنوان الفرع</Label>
                <Input placeholder="عنوان الفرع" value={data.address} onChange={e => setData('address', e.target.value)} />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
                
              
                
                <Button type="submit" className='col-span-2'>تعديل فرع</Button>
            </form>
}

            </AppLayout>
    );
}
