import React, { useState } from 'react';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { can } from '@/utils/permissions';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
export default function NewProduct({ warehouses, onSuccess }) {
    if (!can('Products create')) {
        return false
    }
    const { data, setData, post, reset, errors } = useForm({
        name: '',
        item_code: '',
        item_type: 'EGS',
        unit_type: 'EA',
        description: '',
        price: 0,
        stock: '',
        tax_percentage: 14,
        warehouse_id: '',
        brand_id : '',
        internal_code: '',
    });
    console.log(errors, 'errors formuse')
    const handleWarehouseChange = (e) => {
        setData('warehouse_id', e)
    }
    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                reset()
                if (onSuccess) {
                    onSuccess();
                }
            }
        });
    };
    return (
        <React.Fragment>

            {can('Products create') &&
                <form onSubmit={submit} className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">
                    <div>
                        <Label>اسم</Label>
                        <Input placeholder="اسم المنتج" value={data.name} onChange={e => setData('name', e.target.value)} />
                    </div>
                    <div>
                        <Label>براند</Label>
                        <Input placeholder=" براند" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} />
                    </div>
                    <div>
                        <Label>الوصف</Label>
                        <Input placeholder="الوصف" value={data.description} onChange={e => setData('description', e.target.value)} />
                    </div>
                    <div>
                        <Label>المخزن</Label>
                        <Select value={String(data.warehouse_id || "")} onValueChange={handleWarehouseChange} required >
                            <SelectTrigger className="w-full"><SelectValue placeholder="اختر المخزن" /></SelectTrigger>
                            <SelectContent>
                                {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.warehouse_id && <p className="text-red-600 text-sm mt-1">{errors.warehouse_id}</p>}
                    </div>
                    <div>
                         <Label>المخزون  </Label>
                          <Input required type="number" placeholder="المخزون" value={data.stock} onChange={e => setData('stock', e.target.value)} />
                  
                    </div>
                    
                    
                    <div>
                        <Label>السعر</Label>
                        <Input type="number" step="0.01" placeholder="السعر" value={data.price} onChange={e => setData('price', e.target.value)} />
                    </div>
                     <div>
                        <Label>نسبة الضريبة %</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.tax_percentage}
                            onChange={(e) => setData("tax_percentage", e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <Label>internal_code</Label>
                        <Input
                            required
                            value={data.internal_code}
                            onChange={(e) => setData("internal_code", e.target.value)}
                        />
                    </div>  
                    <div>
                        <Label>item_code</Label>
                        <Input
                        required
                            value={data.item_code}
                            onChange={(e) => setData("item_code", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Item Type</Label>
                        <Select
                            value={data.item_type}
                            onValueChange={(val) => setData("item_type", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الكود" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EGS">EGS - Egyptian Tax Code</SelectItem>
                                <SelectItem value="GS1">GS1 - Global Standard</SelectItem>
                                <SelectItem value="Internal">Internal - Company Code</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>الوحدة</Label>
                        <Select
                            value={data.unit_type}
                            onValueChange={(val) => setData("unit_type", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر وحدة القياس" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EA">Each - قطعة</SelectItem>
                                <SelectItem value="KG">Kilogram - كيلو جرام</SelectItem>
                                <SelectItem value="MTR">Meter - متر</SelectItem>
                                <SelectItem value="LTR">Liter - لتر</SelectItem>
                                <SelectItem value="BOX">Box - علبة</SelectItem>
                                <SelectItem value="BAG">Bag - كيس</SelectItem>
                                <SelectItem value="SET">Set - طقم</SelectItem>
                                <SelectItem value="HUR">Hour - ساعة</SelectItem>
                                <SelectItem value="DAY">Day - يوم</SelectItem>
                                <SelectItem value="MON">Month - شهر</SelectItem>
                                <SelectItem value="YER">Year - سنة</SelectItem>
                                <SelectItem value="SQM">Square Meter - م2</SelectItem>
                                <SelectItem value="CMT">Centimeter - سم</SelectItem>
                                <SelectItem value="MM">Millimeter - مم</SelectItem>
                                <SelectItem value="TNE">Ton - طن</SelectItem>
                                <SelectItem value="PAC">Package - عبوة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                   
                     <Button type="submit" className='col-span-2'>إضافة منتج</Button>
                </form>
            }
        </React.Fragment>
    )
}