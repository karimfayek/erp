import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from '@/components/ui/button';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import AppLayout from '@/layouts/app-layout';
import { Link } from "@inertiajs/react";
export default function ShowUser({user}){

    return (
        <AppLayout>
             <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">فواتير اصدرها المستخدم  </CardTitle>
                      <p>{user.name}</p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4 space-y-4">
         <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow className="text-right">
                            <TableHead className="text-right">رقم الفاتورة</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">تاريخ الفاتورة</TableHead>
                            <TableHead className="text-right"> اجمالى الفاتورة</TableHead>
                            <TableHead className="text-right">-</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {user?.sales.map(sale => (
                           <TableRow key={sale.id}>
                            <TableCell>{sale.invoice_number || ''}</TableCell>
                            <TableCell>{sale.customer?.name}</TableCell>
                            <TableCell>  {new Date(sale.date).toLocaleDateString()}</TableCell>
                            <TableCell>{sale.subtotal}</TableCell>
                             <TableRow>
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
                                            <Link href={route('users.show' , sale.id)}>
                                            عرض المستخدم 
                                            </Link>
                                            </DropdownMenuItem>
                                       
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Link href={route('sales.destroy' , sale.id)} className="text-red-600" method="delete">
                                            مسح 
                                            </Link>
                                               </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableRow>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </CardContent>
            </Card>
            </AppLayout>
    )
}