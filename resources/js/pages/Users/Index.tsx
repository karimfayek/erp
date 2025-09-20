import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';

import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { can } from "@/utils/permissions";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';
import NewUser from './New';
type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Users() {
    const { users,warehouses, flash, errors } = usePage().props;
    const [open, setOpen] = useState(false);
    const { delete: destroy, processing } = useForm()

    const handleDelete = (id) => {
        destroy(route("users.destroy", id))
    }


    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المستخدمين" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}



            <div className="mt-6  p-4 rounded shadow">
                <div className='mb-4'>
                    {can('Users create') &&
                    
                    <Button variant="outline" size="sm">
                        <Plus />
                        <span className="hidden lg:inline" onClick={() => setOpen(true)}>Add User</span>
                    </Button>
                    }
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="text-right">
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">الايميل</TableHead>
                            <TableHead className="text-right">-</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.data.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>

                                {/* عمود الأكشنز */}
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
                                           
                                                <DropdownMenuItem asChild>
                                                <Link href={route("users.show", user.id)}>
                                                    عرض فواتير المستخدم
                                                </Link>
                                                </DropdownMenuItem>
                                           
                                        {can("Users edit") && (
                                            <DropdownMenuItem asChild>
                                                <Link href={route("users.edit", user.id)}>
                                                    تعديل
                                                </Link>
                                            </DropdownMenuItem>
                                              )}

                                            <DropdownMenuSeparator />
  {can("Users delete") && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" className='hover:bg-red-500'>مسح </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم بشكل دائم.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={processing}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            {processing ? "جارٍ الحذف..." : "تأكيد الحذف"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                              )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    </DialogHeader>

                    <NewUser onSuccess={() => setOpen(false)} warehouses={warehouses} />

                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
