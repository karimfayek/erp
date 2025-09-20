import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { type BreadcrumbItem } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer Branches',
        href: '#',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from 'lucide-react';
import Delete from '@/components/includes/Delete';
import { can } from '@/utils/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Customer = {
    id: number;
    name: string;
    // add other fields if needed
};

export default function Index() {
    const { branches ,customers , flash ,  errors = {}} = usePage().props as unknown as { 
        branches: any, 
        customers: Customer[], 
        flash: any, 
        errors: Record<string, string>
    };
   
    const { data, setData, post, reset } = useForm({
        name: '',
        address: '',
        customer_id: '',
    });
    const handleCustomerChange = (value: string) => {
        setData('customer_id', value);
    }

 

    const submit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        post(route('customer-branches.store'), {
            onSuccess: () => reset()
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
                    {customers.map((c) => (
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
                
              
                
                <Button type="submit" className='col-span-2'>إضافة فرع</Button>
            </form>
}

            <div className="mt-6  p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الفرع</TableHead>
                            <TableHead className='text-right'>العميل</TableHead>
                            <TableHead className='text-right'>العنوان</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches?.map((branche: { id: unknown; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; code: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; phone: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                            <TableRow key={String(branche.id)}>
                                <TableCell>{branche.name}</TableCell>
                                <TableCell>{branche.customer?.name}</TableCell>
                                <TableCell>{branche.address}</TableCell>
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
                                                <Link href={route("customer-branches.edit", branche.id)}>
                                                    تعديل
                                                </Link>
                                            </DropdownMenuItem>
                                            }

                                            <DropdownMenuSeparator />
                                            {can('Branches delete') &&
                                            <Delete id={branche.id} routeName={'customer-branches.destroy'} />
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
