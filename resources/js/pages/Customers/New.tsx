import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { can } from '@/utils/permissions';


export default function NewCustomer({ onCreated }) {
    if (!can('Clients create')) {
        return null
    }
    const { errors } = usePage().props;
    const { data, setData, post, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        discount_percentage: '',
        country: 'EG',
        governate: 'Cairo',
        city: '',
        street: '',
        building_number: '',
        type: 'B',
        tax_id: '',
        company_name: '',
        address: '',
    });
    console.log(errors, 'errors')
    const submit = (e: any) => {
        e.preventDefault();
        post(route('customers.store'), {
            onSuccess: (page) => {
                // Laravel controller يرجّع العميل الجديد في flash أو props
                const customer = page.props.flash.customer;
                if (customer && onCreated) {
                    onCreated(customer);
                } else {
                    console.log('customer', customer)
                    console.log('onCreated', onCreated)
                }
                reset();
            }
        });
    };
    const handleTypeChange = (e) => {
        setData('type', e)
        if (e === 'F') {
            setData('tax_id', '000000000')
        } else {
            setData('tax_id', '')
        }
    }
    return (



        <form onSubmit={submit} className="space-y-2 p-4 rounded shadow md:grid grid-cols-2  gap-2">
            <div>
                <Label>
                    اسم العميل
                </Label>
                <Input placeholder="اسم العميل" value={data.name} onChange={e => setData('name', e.target.value)} required />
            </div>
            <div>
                <Label>
                    اسم الشركة
                </Label>
                <Input placeholder="اسم الشركة" value={data.company_name} onChange={e => setData('company_name', e.target.value)} />
            </div>
            <div>
                <Label>
                    النوع
                </Label>
                <Select value={String(data.type || "")} onValueChange={(e) => handleTypeChange(e)} required >
                    <SelectTrigger className="w-full"><SelectValue placeholder="النوع " /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={'B'}>شركة</SelectItem>
                        <SelectItem value={'P'}>شخص</SelectItem>
                        <SelectItem value={'F'}>مستهلك نهائي عادي</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>
                    {data.type === 'B' ?
                        'الرقم الضريبى'
                        :
                        'رقم البطاقة / جواز السفر'

                    }
                </Label>
                <Input type="number" value={data.tax_id} onChange={e => setData('tax_id', e.target.value)} />

            </div>
            <div>
                <Label>
                    نسبة الخصم
                </Label>
                <Input type="number" placeholder="نسبة الخصم" value={data.discount_percentage} onChange={e => setData('discount_percentage', e.target.value)} />
            </div>
            <div>
                <Label>
                    الايميل
                </Label>
                <Input placeholder="الايميل" value={data.email} onChange={e => setData('email', e.target.value)} />
            </div>
            <div>
                <Label>
                    التليفون
                </Label>
                <Input type="text" placeholder="التليفون" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
            </div>

            <div>
                <Label>
                    الدولة
                </Label>
                <Input type="text" placeholder="الدولة" value={data.country} onChange={e => setData('country', e.target.value)} />
            </div>
            <div>
                <Label>
                    المدينة
                </Label>
                <Input type="text" placeholder="المدينة" value={data.governate} onChange={e => setData('governate', e.target.value)} />
            </div>

            <div>
                <Label>
                    الشارع
                </Label>
                <Input type="text" placeholder="الشارع" value={data.street} onChange={e => setData('street', e.target.value)} />
            </div>

            <div>
                <Label>
                    رقم المبنى
                </Label>
                <Input type="number" placeholder="رقم المبنى" value={data.building_number} onChange={e => setData('building_number', e.target.value)} />
            </div>
            
            <div>
                <Label>
                   العنوان الكامل
                </Label>
                <Input type="text" placeholder="العنوان الكامل" value={data.address} onChange={e => setData('address', e.target.value)} />
            </div>


            <Button type="submit" className='col-span-2'>إضافة عميل</Button>
        </form>


    );
}
