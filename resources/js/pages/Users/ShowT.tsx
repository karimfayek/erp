"use client"

import * as React from "react"
import {
  ColumnDef,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/DataTable"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AppLayout from "@/layouts/app-layout"
import { Link } from "@inertiajs/react"
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



export default function UsersTable({user}) {
  return (
    <AppLayout>
        <div className="p-6">
            <b>عرض فواتير المستخدم</b>
            <p>{user.name}</p>
   <DataTable columns={invoiceColumns} data={user.sales} />
        </div>
     
    </AppLayout>
  )
  
}
