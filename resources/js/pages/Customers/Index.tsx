import { Head, Link,  usePage } from '@inertiajs/react';
import {  Plus } from 'lucide-react';

import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { can } from "@/utils/permissions";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'العملاء',
        href: '#',
    },
];
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useState } from 'react';
import NewCustomer from './New';
import { DataTable } from '@/components/DataTable';
import Delete from '@/components/includes/Delete';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

type Customer = {
    id: number
    name: string
    sku: number
    price: number
    stock: number
}

export default function Customers() {
    if(!can('Clients view')){
        return null
    }
    const { customers, flash, errors } = usePage().props;
    const [open, setOpen] = useState(false);
    

    
 const columns: ColumnDef<Customer>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
       {
    accessorKey: "name",
    header: "الاسم",
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  },
  {
        accessorKey: "company_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    اسم الشركة
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue("company_name")}</div>,
    },
     {
        accessorKey: "discount_percentage",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   نسبة الخصم
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue("discount_percentage")}</div>,
    },
    {
        accessorKey: "phone",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                   رقم التليفون
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
        accessorKey: "user.name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  بواسطة
                    <ArrowUpDown />
                </Button>
            )
        },
         cell: ({ row }) => <div>{row.original.user?.name}</div>,
    },
     {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const customer = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        {can('Clients edit') &&

                            <DropdownMenuItem asChild>
                                <Link href={route("customers.edit", customer.id)}>
                                    تعديل
                                </Link>
                            </DropdownMenuItem>
                        }


                        <DropdownMenuSeparator />
                        {can('Clients delete') &&
                            <Delete id={customer.id} routeName={"customers.destroy"} />
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="العملاء" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}



            <div className="mt-6  p-4 rounded shadow">
                <div className='mb-4'>
                    {can('Clients create') &&
                    
                    <Button variant="outline" size="sm">
                        <Plus />
                        <span className="hidden lg:inline" onClick={() => setOpen(true)}>اضافه عميل </span>
                    </Button>
                    }
                </div>
                
                                <DataTable columns={columns} data={customers} />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                 <DialogContent className='sm:max-w-[90vw] lg:max-w-[1400px] w-full h-auto max-h-[90vh] overflow-y-auto p-6' dir='rtl'>
                      <DialogHeader>
                        <DialogTitle>إضافة عميل جديد</DialogTitle>
                    </DialogHeader>

                    <NewCustomer onCreated={() => setOpen(false)} />

                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
