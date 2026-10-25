import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import {
  ColumnDef,
} from "@tanstack/react-table"
/**
 * Expected props from server:
 * - customers: [{id, name}]
 * - products: [{id, name, code, unit, price, tax_rate}]
 * - user: current auth user (optional)
 */
import { type BreadcrumbItem } from '@/types';
import { DataTable } from "@/components/DataTable";
import { ArrowUpDown, BadgeCheckIcon, MoreHorizontal, X } from "lucide-react";
import { can } from "@/utils/permissions";
import Delete from "@/components/includes/Delete";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sales',
    href: '/sales',
  },
];
// 📌 Fake Data
type Invoice = {
  id: number
  date: string
  invoice_number: string
  subtotal: string
  discount_percentage: string
  collected: string
  postponed: string
  tax: string
  is_delivered: boolean
  marked_to_draft: string | number
  expenses: string
  customer: {
    id: number
    name: string
    phone: string
    email: string
    address: string
    company_name: string
  },
  user: {
    id: number
    name: string
    phone: string
    email: string
    address: string
  },
  creator: {
    id: number
    name: string
    phone: string
    email: string
    address: string
  }
}
// 📌 Columns
export const invoiceColumns: ColumnDef<Invoice>[] = [
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
    accessorKey: "invoice_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          رقم #
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("invoice_number")}</div>,
  },
  {
    accessorKey: "is_invoice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          النوع
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("is_invoice") == 1 ? 'فاتورة' : 'بيان'}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          تاريخ
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const raw = row.getValue("date") as string
      return <div>{new Date(raw).toLocaleDateString("en-GB")}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "customer.name",
    header: "العميل",
    cell: ({ row }) => <div>{row.original.customer?.company_name || row.original.customer?.name}</div>,

  },

  {
    accessorKey: "subtotal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          الإجمالى
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("subtotal")}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "discount_percentage",
    header: "خصم %",
    cell: ({ row }) => <div>{row.getValue("discount_percentage")}%</div>,
    enableSorting: true,
  },

  {
    accessorKey: "tax",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ضرائب
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("tax")} EGP</div>,
  },
  {
    accessorKey: "expenses",
    header: "مصاريف",
    cell: ({ row }) => <div>{row.getValue("expenses")} EGP</div>,
  },
  {
    accessorKey: "collected_amount",
    header: "محصل",
    cell: ({ row }) => <div>{row.getValue("collected_amount")} EGP</div>,
  },
  {
    accessorKey: "expenses",
    header: "مصاريف",
    cell: ({ row }) => <div>{row.getValue("expenses")} EGP</div>,
  },
  {
    accessorKey: "remaining_amount",
    header: "مؤجل",
    cell: ({ row }) => <div>{row.getValue("remaining_amount")} EGP</div>,
  },
  {
    accessorKey: "user.name",
    header: "التسليم",
    cell: ({ row }) => <div>{row.original.is_delivered ? <Badge className="h-5 min-w-5 bg-green-700" > <BadgeCheckIcon /></Badge> : <Badge variant="destructive"><X /> </Badge>}</div>,

  },
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          المندوب
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.original.user?.name}</div>,
    enableSorting: true,
  },

  {
    accessorKey: "creator.name",
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
    cell: ({ row }) => <div>{row.original.creator?.name}</div>,
    enableSorting: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const invoice = row.original

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
            <DropdownMenuItem>
              <Link href={route('invoice.show', invoice.id)}>
                طباعه الفاتورة
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={route('invoice.details', invoice.id)}>
                تفاصيل الفاتورة {invoice.marked_to_draft === '0' && 'sdfsdf'}
              </Link>
            </DropdownMenuItem>


            {!row.original.is_delivered &&
              <DropdownMenuItem>
                <Link
                  href={route('delivery.status', invoice.id)}
                  method="post"
                  data={{ delivered: true }}
                >
                  تم التسليم
                </Link>
              </DropdownMenuItem>
            }
            {can('Invoices collections') &&
              <DropdownMenuItem>
                <Link href={route('collections.show', invoice.id)}>
                  تحصيلات
                </Link>
              </DropdownMenuItem>
            }
            <DropdownMenuSeparator />
            {can('Invoices delete') &&
              <Delete id={invoice.id} routeName={'sales.destroy'} />
            }


          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
export default function SalesCreate() {
  if (!can('Invoices view') && !can('Maintenance sales')) {
    return false
  }

  const { sales, title } = usePage().props as unknown as {
    sales: {
      data: Invoice[]
      links: { url: string | null; label: string; active: boolean }[]
    },
    title: string
  }
  console.log(sales)
  const handlePageChange = (url: string | null) => {
    if (!url) return
    router.get(url, {}, { preserveState: true })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>


      <div className="p-6 space-y-6">
        <Head title="  عرض الفواتير" />

        <div className="p-6">
          <b> {title} </b>

          <DataTable columns={invoiceColumns} data={sales.data} />
          <div className="flex space-x-2 rtl:space-x-reverse">
            {sales.links.map((link, i) => (
              <Button
                key={i}
                variant={link.active ? "default" : "outline"}
                disabled={!link.url}
                onClick={() => handlePageChange(link.url)}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
