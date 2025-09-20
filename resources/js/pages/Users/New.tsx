
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';
import { LoaderCircle  } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function NewUser({ onSuccess , warehouses}){
      const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
          name: '',
          email: '',
          warehouse_id :'',
          password: '',
          password_confirmation: '',
      });
      
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                reset();          
                if (onSuccess) {
                    onSuccess();  
                }
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };
    return (
           <form method="POST" className="flex flex-col gap-6 p-6" onSubmit={submit}>
                           <div className="grid gap-6">
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
                               <div className="grid gap-2">
                                   <Label htmlFor="password">Password</Label>
                                   <Input
                                       id="password"
                                       type="password"
                                       required
                                       tabIndex={3}
                                       autoComplete="new-password"
                                       value={data.password}
                                       onChange={(e) => setData('password', e.target.value)}
                                       disabled={processing}
                                       placeholder="Password"
                                   />
                                   <InputError message={errors.password} />
                               </div>
           
                               <div className="grid gap-2">
                                   <Label htmlFor="password_confirmation">Confirm password</Label>
                                   <Input
                                       id="password_confirmation"
                                       type="password"
                                       required
                                       tabIndex={4}
                                       autoComplete="new-password"
                                       value={data.password_confirmation}
                                       onChange={(e) => setData('password_confirmation', e.target.value)}
                                       disabled={processing}
                                       placeholder="Confirm password"
                                   />
                                   <InputError message={errors.password_confirmation} />
                               </div>
           
                               <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                   {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                   Create account
                               </Button>
                           </div>
           
                       </form>
    )
} 