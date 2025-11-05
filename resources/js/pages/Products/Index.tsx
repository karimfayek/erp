
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.js";
import { ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react';
import Delete from '@/components/includes/Delete';
import { can } from '@/utils/permissions';
import { useEffect, useState } from 'react';
import NewProduct from './NewProduct';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ca } from 'date-fns/locale';



type Product = {
    id: number
    name: string
    sku: number
    price: number
    stock: number
    internal_code: string
    item_type: string
    unit_type: string
    price_without_tax: number
    tax_percentage: number
}
export default function Index({ maintainance }: { maintainance: boolean }) {
    if (!can('Products view') && !can('Maintenance products')) {
        return false
    }
    const title = maintainance ? 'منتجات وخدمات الصيانة' : 'المنتجات';
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: title,
            href: '/products',
        },
    ];
    const [open, setOpen] = useState(false);
    const { products, flash, warehouses, errors = {} } = usePage().props;
    console.log(warehouses, 'warehouses index')
    // 📌 Columns
    const invoiceColumns: ColumnDef<Product>[] = [
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
            id:'الاسم',
            header: maintainance ? 'اسم المنتج / الخدمة' : 'اسم المنتج',
            cell: info => <span className="font-medium">{info.getValue()}</span>,
        },
        {
            accessorKey: "total_quantity",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        المخزون
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("total_quantity")}</div>,
        },

        ...warehouses.map((wh) => ({

            id: wh.name,

            accessorFn: (row) => {
                const inv = row.inventories?.find(
                    i => Number(i.warehouse_id) === Number(wh.id)
                );
                return inv ? Number(inv.quantity) : 0;
            },


            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={column.getToggleSortingHandler()}
                >
                    {wh.name}
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            ),


            cell: ({ getValue }) => (
                <div className="text-right">{getValue()}</div>
            ),


            enableSorting: true,
        })),
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original
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

                            {(can('Products edit') || can('Maintenance products')) &&

                                <DropdownMenuItem asChild>
                                    <Link href={route("products.edit", product.id)}>
                                        تعديل
                                    </Link>
                                </DropdownMenuItem>
                            }


                            <DropdownMenuSeparator />
                            {can('Products delete') &&
                                <Delete id={product.id} routeName={"products.destroy"} />
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
    useEffect(() => {
        if (flash.success) {
            toast({
                title: "تم بنجاح",
                description: flash.success,
            })
        }

    }, [flash])


    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المنتجات" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <div className="mt-2  p-4 rounded shadow">

                {(can('Products create') || can('Maintenance products')) &&

                    <Dialog open={open} onOpenChange={setOpen} >
                        <DialogTrigger asChild>

                            <Button variant="outline" size="sm" className='mb-5'>
                                <Plus />
                                <span className="inline" onClick={() => setOpen(true)}>{maintainance ? 'إضافة منتج/خدمة جديدة' : 'إضافة منتج جديد'}</span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent className='sm:max-w-[90vw] lg:max-w-[1400px] w-full h-auto max-h-[90vh] overflow-y-auto p-6' dir='rtl'>
                            {!maintainance &&

                                <DialogHeader>
                                    <DialogTitle className='text-center'>إضافة منتج جديد
                                        {maintainance && ' - في وضع الصيانة'}
                                    </DialogTitle>
                                </DialogHeader>
                            }

                            <NewProduct m={maintainance} warehouses={warehouses} onSuccess={() => setOpen(false)} />

                        </DialogContent>
                    </Dialog>
                }
                <DataTable columns={invoiceColumns} data={products} />

            </div>
        </AppLayout>
    );
}
