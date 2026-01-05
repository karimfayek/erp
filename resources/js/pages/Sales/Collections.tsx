import { useState } from "react"
import { useForm } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import DatePicker from "@/components/DatePicker"
import { format } from "date-fns"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collections',
        href: '/sales/collections',
    },
];
export default function Collections({ sale, collections }) {
    const [open, setOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const { data, setData, post, put, delete: destroy, reset } = useForm({
        sale_id: sale.id,
        amount: "",
        //set collection date to be by default today
        collection_date: new Date(),
        notes: "",
    })

    const form = useForm({
        sale_id: sale.id,
        amount: "",
        collection_date: new Date(),
        notes: "",
    })

    const openEdit = (col) => {
        setEditing(col)
        form.setData({
            sale_id: sale.id,
            amount: col.amount,
            collection_date: new Date(col.collection_date),
            notes: col.notes ?? "",
        })
        setEditOpen(true)
    }

    const submitCreate = (e) => {
        e.preventDefault()
        form.post(route("collections.store"), {
            onSuccess: () => {
                form.reset()
                setOpen(false)
            },
        })
    }

    const submitUpdate = (e) => {
        e.preventDefault()
        form.put(route("collections.update", editing.id), {
            onSuccess: () => {
                form.reset()
                setEditOpen(false)
                setEditing(null)
            },
        })
    }
    const submit = (e) => {
        e.preventDefault()
        post(route("collections.store"), {
            onSuccess: () => (
                reset(),
                setOpen(false)
            ),
        })
    }

    const remove = (id) => {
        if (confirm("هل أنت متأكد من الحذف؟")) {
            destroy(route("collections.destroy", id))
        }
    }

    return (

        <AppLayout breadcrumbs={breadcrumbs}>

            <div className="space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">التحصيلات</h2>

                    {/* Add Modal */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>إضافة تحصيل</Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>إضافة تحصيل</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={submitCreate} className="space-y-4">
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="المبلغ"
                                    value={form.data.amount}
                                    onChange={(e) => form.setData("amount", e.target.value)}
                                    required
                                />

                                <DatePicker
                                    date={form.data.collection_date}
                                    setDate={(date) => form.setData("collection_date", date)}
                                />

                                <Textarea
                                    placeholder="ملاحظات"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData("notes", e.target.value)}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                        إلغاء
                                    </Button>
                                    <Button type="submit">حفظ</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Modal */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل التحصيل</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitUpdate} className="space-y-4">
                            <Input
                                type="number"
                                step="0.01"
                                value={form.data.amount}
                                onChange={(e) => form.setData("amount", e.target.value)}
                                required
                            />

                            <DatePicker
                                date={form.data.collection_date}
                                setDate={(date) => form.setData("collection_date", date)}
                            />

                            <Textarea
                                value={form.data.notes}
                                onChange={(e) => form.setData("notes", e.target.value)}
                            />

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit">حفظ</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">ملاحظات</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {collections.map((col) => (
                            <TableRow key={col.id}>
                                <TableCell>{format(new Date(col.collection_date), "yyyy-MM-dd")}</TableCell>
                                <TableCell>{col.amount}</TableCell>
                                <TableCell>{col.notes}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button size="sm" onClick={() => openEdit(col)}>
                                        تعديل
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(col.id)}
                                    >
                                        حذف
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    )
}
