import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function NewCustomer({ onCreated }) {
    const {  errors } = usePage().props;
    const { data, setData, post, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        discount_percentage: '',
        company_name : ''
    });
console.log(errors , 'errors')
    const submit = (e: any) => {
        e.preventDefault();
        post(route('customers.store'), {
           onSuccess: (page) => {
        // Laravel controller يرجّع العميل الجديد في flash أو props
        const customer = page.props.flash.customer; 
        if (customer && onCreated) {
          onCreated(customer);
        }else{
            console.log('customer' , customer)
            console.log('onCreated' , onCreated)
        }
        reset();
      }
        });
    };

    return (
       

           
            <form onSubmit={submit} className="space-y-2 bg-white p-4 rounded shadow md:grid grid-cols-2  gap-2">
                <Input placeholder="اسم العميل" value={data.name} onChange={e => setData('name', e.target.value)} required />
                <Input placeholder="اسم الشركة" value={data.company_name} onChange={e => setData('company_name', e.target.value)} />
                <Input type="number" placeholder="نسبة الخصم" value={data.discount_percentage} onChange={e => setData('discount_percentage', e.target.value)} />
                <Input placeholder="الايميل" value={data.email} onChange={e => setData('email', e.target.value)} />
                <Input type="text" placeholder="التليفون" value={data.phone} onChange={e => setData('phone', e.target.value)} required/>
                <Input type="text" placeholder="العنوان" value={data.address} onChange={e => setData('address', e.target.value)} />
                <Button type="submit" colSpan={2} col-span="2">إضافة عميل</Button>
            </form>

            
    );
}
