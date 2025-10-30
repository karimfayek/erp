
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { can } from '@/utils/permissions';
export default function NewUser({ onSuccess, warehouses, maintainance, roles }) {
      if(!can('Users view') && !can('Maintenance users')){
            
            return null
        }
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        warehouse_id: '',
        salary: 0.00,
        role: '',
        type: maintainance ? 'technician' : 'user',
        password: maintainance ? 'MmErtE$58+vbrT' : '',
        password_confirmation: maintainance ? 'MmErtE$58+vbrT' : '',
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
const handleNameAndEmail = (value: string) => {
    setData('name', value);
    if (maintainance) {
        // Generate email for maintainance users and handle spaces and arabic characters
        
        const emailValue = value
            .toLowerCase()
            .replace(/[\u0600-\u06FF]/g, (char) => {
                const arabicToEnglishMap = {
                    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
                    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
                    'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
                    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y','ى': 'y',
                    'ئ': 'y', 'ء': 'a', 'ؤ': 'w','ة': 'h','إ': 'a','أ': 'a','آ': 'a'
                };
                return arabicToEnglishMap[char] || char;
            })
             .trim()
            .replace(/\s+/g, '.') + '@maintainance.local';
        setData('email', emailValue);
    }
}
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
                        onChange={(e) => handleNameAndEmail(e.target.value)}
                        disabled={processing}
                        placeholder="Full name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>
                {maintainance &&
                    <>
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
                    </>
                }

                <div>
                    <Label>مخزن المستخدم</Label>

                    <Select value={String(data.warehouse_id || "")} onValueChange={(e) => setData('warehouse_id', e)} required={true}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="اختر المخزن" /></SelectTrigger>
                        <SelectContent>
                            {warehouses.map((wh) => (
                                <SelectItem key={wh.id} value={String(wh.id)}>{wh.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {!maintainance &&
                    <>
                     <Select value={String(data.role || "")} onValueChange={(e) => setData('role', e)} required={true}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="اختر الدور " /></SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    </>
                }


                <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </div>

        </form>
    )
} 