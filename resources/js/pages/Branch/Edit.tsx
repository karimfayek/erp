import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { can } from '@/utils/permissions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches',
        href: '#',
    },
];


export default function Edit({branche}) {
    if( !can('Branches edit') ){
        return false
    }
    const { branches , flash ,  errors = {}} = usePage().props;
   
    const { data, setData, put, reset } = useForm({
        name: branche.name || '',
        code: branche.code || '',
        address: branche.address || '',
        phone:branche.phone ||  '',
    });
const { delete: destroy, processing } = useForm()

    const handleDelete = (id) => {
        destroy(route("users.destroy", id))
    }

    const submit = (e) => {
        e.preventDefault();
        put(route('branches.update' , branche.id), {
                onSuccess: () => {
        toast("تم  التعديل  بنجاح");
             }
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الفروع" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">
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
                
                <Button type="submit" colSpan={2} className='col-span-2'>تعديل فرع</Button>
            </form>
            
                        </AppLayout>
            )
            }