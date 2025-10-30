
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { can } from '@/utils/permissions';

import EditInventory from './EditInventory';
import { is } from 'date-fns/locale';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'تعديل منتج',
        href: '#',
    },
];


export default function Edit({product , warehouses}) {
    if(!can('Products edit') && !can('Maintenance products')){
        return null
    }
console.log(product , 'product edit page')
    const {  flash ,  errors = {} , branches} = usePage().props;
   
    const { data, setData, put, reset } = useForm({
        name: product.name || '',
        item_code: product.item_code ||  '',
        item_type: product.item_type ||  '',
        unit_type: product.unit_type ||  '',
        description:  product.description || '',
        price: product.price ||  0,
        cost_price: product.cost_price ||  0,
        is_service: product.type === 'service' ||  false,
        stock:  product.stock || '',
        unit: product.unit ||  '',
        tax_percentage: product.tax_percentage ||  14,
        brand_id :product.brand_id || '',        
        internal_code: product.internal_code ||  '',
    });
 
    const submit = (e) => {
        e.preventDefault();
        put(route('products.update' , product.id), {
           onSuccess: () => {
                toast("تم  التعديل  بنجاح");
            }
        });
    };

    return (
       
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="تعديل منتج" />

            {flash?.success && (
                <div className="bg-green-100 text-green-700 p-2 rounded ">{flash.success}</div>
            )}

            <form onSubmit={submit} className="space-y-2  p-4 rounded shadow md:grid grid-cols-2  gap-2">
                                <div>
                                    <Label>اسم</Label>
                                    <Input placeholder="اسم المنتج" value={data.name} onChange={e => setData('name', e.target.value)} />
                                </div>
                                  {!data.is_service &&
                                <div>
                                    <Label>براند</Label>
                                    <Input placeholder=" براند" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)} />
                                </div>
}
                               
                                <div>
                                    <Label>السعر</Label>
                                    <Input type="number" step="0.01" placeholder="السعر" value={data.price} onChange={e => setData('price', e.target.value)} />
                                </div>
                                {!data.is_service &&
                                
                                <div>
                                    <Label>سعر التكلفة</Label>
                                    <p>{data.is_service }</p>
                                    <Input type="number" step="0.01" placeholder="سعر التكلفة" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} />
                                </div>
                                }
                                 <div>
                                    <Label>الوصف</Label>
                                    <Input placeholder="الوصف" value={data.description} onChange={e => setData('description', e.target.value)} />
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
                                    <Label>item_code</Label>
                                    <Input
                                    required
                                        value={data.item_code}
                                        onChange={(e) => setData("item_code", e.target.value)}
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
                               
                                 <Button type="submit" className='col-span-2'>تعديل منتج</Button>
                            </form>
 <EditInventory product={product} />
 
            </AppLayout>
    )
}