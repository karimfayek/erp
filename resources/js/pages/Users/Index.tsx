import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle , Plus } from 'lucide-react';

import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { Dialog , DialogContent , DialogHeader , DialogTitle  } from "@/components/ui/dialog.js";

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
import { useState } from 'react';
import NewUser from './New';
type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Users() {
    const { users, flash , errors } = usePage().props;
  const [open, setOpen] = useState(false); 


    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المستخدمين" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

         

            <div className="mt-6 bg-white p-4 rounded shadow">
                <div className='mb-4'>
            <Button variant="outline" size="sm">
           <Plus />
            <span className="hidden lg:inline" onClick={()=>setOpen(true)}>Add User</span>
          </Button>
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
                                            <Link href={route('users.show' , user.id)}>
                                            عرض المستخدم 
                                            </Link>
                                            </DropdownMenuItem>
                                       
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>مسح   </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableRow>
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

 <NewUser onSuccess={() => setOpen(false)} />

  </DialogContent>
</Dialog>
            </AppLayout>
    );
}
