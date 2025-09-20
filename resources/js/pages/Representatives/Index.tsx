import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Link, useForm } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";
import { can } from "@/utils/permissions";
import Delete from "@/components/includes/Delete";

export default function RepresentativesIndex({ representatives, branches, customers }) {

    const [open, setOpen] = useState(false);

    const { data, setData, post, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        customer_branch_id: '',
        customer_id: '',
    });

    function handleCreate() {
        post(route('representatives.store'), {
            onSuccess: () => {
                reset();
            }
        });
    }

    return (
        <AppLayout>


            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Representatives</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>اضافة مندوب </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>انشاء مندوب </DialogTitle>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <Input
                                    placeholder="Phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <Input
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                 {(!data.customer_branch_id || data.customer_branch_id === "null") && (
                                <Select
                                    value={data.customer_id?.toString() || ""}
                                    onValueChange={(val) => setData('customer_id', Number(val))}
                                >

                                    <SelectTrigger>
                                        <SelectValue placeholder="تابع لعميل /شركه/شخص" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">بدون عميل</SelectItem>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 )}
                                {(!data.customer_id || data.customer_id === "null") && (
                                    <Select
                                        value={data.customer_branch_id?.toString() || ""}
                                        onValueChange={(val) => setData('customer_branch_id', Number(val))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="تابع لفرع شركه " />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">بدون فرع</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}- {branch.customer?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                               
                                <Button onClick={handleCreate} disabled={!data.name || !data.phone}>
                                    Create
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم المندوب</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">الفرع</TableHead>
                            <TableHead className="text-right">-</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {representatives.map((rep) => {
                            return (
                                <TableRow key={rep.id}>
                                    <TableCell>{rep.name}</TableCell>
                                    <TableCell>{rep.branch?.customer?.name} {rep.customer?.name}</TableCell>

                                    <TableCell>{rep.branch?.name}</TableCell>

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
                                                        <Link href={route("representatives.edit", rep.id)}>
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>}

                                                <DropdownMenuSeparator />
                                                {can('Branches delete') &&
                                                    <Delete id={rep.id} routeName={'representatives.destroy'} />}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}