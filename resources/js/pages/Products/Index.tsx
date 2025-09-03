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
        title: 'Products',
        href: '/products',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Index() {
    const { products, flash , warehouses ,  errors = {} } = usePage().props;
    console.log(products , 'products')
    const { data, setData, post, reset } = useForm({
        name: '',
        sku: '',
        description: '',
        price: '',
        stock: '',
        code: '',
        unit: '',
        tax_rate: '',
        warehouse_id:''
    });
    const handleWarehouseChange = (e) => {
setData('warehouse_id' , e )
    }
    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => reset()
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المنتجات" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2 bg-white p-4 rounded shadow md:grid grid-cols-2  gap-2">
            <div>
                <Label>اسم</Label>
                <Input placeholder="اسم المنتج" value={data.name} onChange={e => setData('name', e.target.value)} />
                </div>
                <div>
                <Label>SKU</Label>
                <Input placeholder="SKU" value={data.sku} onChange={e => setData('sku', e.target.value)} />
                </div>
                <div>
                <Label>المخزن</Label>
                <Select value={String(data.warehouse_id || "")} onValueChange={handleWarehouseChange} >
                  <SelectTrigger className="w-full"><SelectValue placeholder="اختر المخزن" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouse_id && <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>}
              </div>
              <div>
                <Label>كود</Label>
                <Input type="number" placeholder="كود" value={data.code} onChange={e => setData('code', e.target.value)} />
                </div>
                <Input placeholder="الوصف" value={data.description} onChange={e => setData('description', e.target.value)} />
                <Input type="number" placeholder="السعر" value={data.price} onChange={e => setData('price', e.target.value)} />
                <Input type="text" placeholder="الوحدة" value={data.unit} onChange={e => setData('unit', e.target.value)} />
                <Input type="number" placeholder="ضريبة" value={data.tax_rate} onChange={e => setData('tax_rate', e.target.value)} />
                <Input type="number" placeholder="المخزون" value={data.stock} onChange={e => setData('stock', e.target.value)} />
                <Button type="submit" colSpan={2}>إضافة منتج</Button>
            </form>

            <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الاسم</TableHead>
                            <TableHead className='text-right'>السعر</TableHead>
                            <TableHead className='text-right'>المخزون</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.data?.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>{product.total_quantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </AppLayout>
    );
}
