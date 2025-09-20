
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { can } from '@/utils/permissions';

export default function EditUser({ user, warehouses }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Edit User',
            href: '/users',
        },
    ];
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        warehouse_id : user.warehouse_id || '' ,
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => {
                toast("تم  التعديل  بنجاح");
            }
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <form method="POST" className="flex flex-col gap-6 p-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {can('Users edit name') &&(

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    )}
                       <div>
                <Label>مخزن المستخدم</Label> 
                
                <Select value={String(data.warehouse_id || "")} onValueChange={(e)=>setData('warehouse_id' , e)} >
                  <SelectTrigger className="w-full"><SelectValue placeholder="اختر المخزن" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={String(wh.id)}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
 {can('Users edit email') &&(
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>
  )}
   {can('Users edit password') &&(
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

  )}

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Edit account
                    </Button>
                </div>

            </form>
        </AppLayout>
    )
} 