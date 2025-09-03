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
import { toast   } from "sonner";
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

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
  expenses: string
  customer: {
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
          Invoice #
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("invoice_number")}</div>,
  },
  {
    accessorKey: "date",
   header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
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
    header: "Customer",
    cell: ({ row }) => <div>{row.original.customer?.name}</div>,
  },
  {
    accessorKey: "subtotal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SubTotal
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("subtotal")}</div>,
     enableSorting: true,
  },
  {
    accessorKey: "discount_percentage",
    header: "Discount %",
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
          Tax
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("tax")} EGP</div>,
  },
  {
    accessorKey: "expenses",
    header: "Expenses",
    cell: ({ row }) => <div>{row.getValue("expenses")} EGP</div>,
  },
  {
    accessorKey: "collected",
    header: "Collected",
    cell: ({ row }) => <div>{row.getValue("collected")} EGP</div>,
  },
  {
    accessorKey: "postponed",
    header: "Postponed",
    cell: ({ row }) => <div>{row.getValue("postponed")} EGP</div>,
  },  {
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
                <Link href={`/sales/${invoice.invoice_number}`}>
                عرض الفاتورة
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
export default function SalesCreate() {

const { sales } = usePage().props as unknown as {
    sales: {
      data: Invoice[]
      links: { url: string | null; label: string; active: boolean }[]
    }
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
                  <b>عرض فواتير </b>
                
         <DataTable columns={invoiceColumns} data={sales.data} />
         <div className="flex space-x-2 rtl:space-x-reverse">
        {sales.links.map((link, i) => (
          <Button
            key={i}
            variant={link.active ? "default" : "outline"}
            disabled={!link.url}
            onClick={() => handlePageChange(link.url)}
            dangerouslySetInnerHTML={{ __html: link.label }} // عشان << و >>
          />
        ))}
      </div>
        </div>
    </div>
    </AppLayout>
  );
}
