// resources/js/Pages/Inventory/TransferForm.tsx
import { useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout.js';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'نقل من مخزن لمخزن',
    href: '#',
  },
];
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can } from '@/utils/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function TransferForm({ products, warehouses, movements }) {
  if (!can('Stock transfer')) {
    return false
  }
  console.log(movements, 'movements')
  const { data, setData, post, processing } = useForm({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: 1,
    notes: ''
  });
  console.log(warehouses, 'warehoses')
  const handleSubmit = (e) => {
    e.preventDefault();
    post('/inventory-transfers');
  };

  const availableQuantity = data.from_warehouse_id && data.product_id
    ? products.find(p => p.id == data.product_id)
      ?.warehouses?.find(w => w.id == data.from_warehouse_id)
      ?.pivot?.quantity ?? 0
    : 0;
  const produc = products.find(p => p.id == data.product_id)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'لا يوجد تاريخ';

    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>


      <form onSubmit={handleSubmit} className="space-y-2  p-4 rounded shadow ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div colSpan={2} className="col-span-2">
            <Label htmlFor="product">المنتج</Label>
            <Select
              id="product"
              value={data.product_id}
              onValueChange={(e) => setData('product_id', Number(e))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر  منتج" />
              </SelectTrigger>
              <SelectContent>

                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id} className='dark:bg-black'>
                    {product.name} - ({product.internal_code}) - {product.brand_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="from_warehouse" className='mb-3'>من المخزن</Label>

            <Select
              value={data.from_warehouse_id?.toString()} // اجعلها string
              onValueChange={(val) => setData('from_warehouse_id', Number(val))} // حولها لرقم عند التخزين
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مخزن مصدر" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()} className="dark:bg-black">
                    {warehouse.name} - {warehouse.branch?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data.from_warehouse_id && data.product_id && (
              <p className="text-sm mt-1">الرصيد المتاح: {availableQuantity}</p>
            )}
          </div>

          <div>
            <Label htmlFor="to_warehouse">إلى المخزن</Label>
            <Select
              value={data.to_warehouse_id}
              onValueChange={(e) => setData('to_warehouse_id', Number(e))}
              required
            >
              <SelectTrigger >

                <SelectValue placeholder=" اختر مخزن هدف " />

              </SelectTrigger>
              <SelectContent>

                {warehouses && warehouses
                  .filter(w => w.id != data.from_warehouse_id)
                  .map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id} className='dark:bg-black'>
                      {warehouse.name} - {warehouse.branch?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">الكمية</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableQuantity}
              value={data.quantity}
              onChange={(e) => setData('quantity', parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">ملاحظات</Label>
          <textarea
            id="notes"
            value={data.notes}
            onChange={(e) => setData('notes', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <Button type="submit" disabled={processing}>
          {processing ? 'جاري النقل...' : 'تنفيذ النقل'}
        </Button>
      </form>
      {can('Stock view_history') &&

        <div className="mt-6  p-4 rounded shadow">
          <Table>
            <TableHeader>
              <TableRow >
                <TableHead className='text-right'>المنتج</TableHead>
                <TableHead className='text-right'> تم نقل / تعديل الى</TableHead>
                <TableHead className='text-right'>من  </TableHead>
                <TableHead className='text-right'>الى </TableHead>
                <TableHead className='text-right'> الحركة</TableHead>
                <TableHead className='text-right'> النوع</TableHead>
                <TableHead className='text-right'> الوقت</TableHead>
                <TableHead className='text-right'> بواسطة</TableHead>
                <TableHead className='text-right'> ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements?.data?.map(movement => (
                <TableRow key={movement?.id}>
                  <TableCell>{movement?.product?.name}</TableCell>
                  <TableCell>{movement?.quantity}</TableCell>
                  <TableCell>{movement?.from_warehouse?.name} </TableCell>
                  <TableCell>
                    {movement?.to_warehouse
                      ? movement?.to_warehouse.name
                      : movement?.movement_type === 'adjustment'
                        ? movement?.from_warehouse?.name
                        : 'بيع'
                    }
                  </TableCell>
                  <TableCell>{translate[movement?.type]}</TableCell>
                  <TableCell>{translate[movement?.movement_type]}</TableCell>

                  <TableCell>{movement?.updated_at ? formatDateTime(movement?.updated_at) : formatDateTime(movement?.created_at)}</TableCell>
                  <TableCell> {movement?.user?.name}</TableCell>
                  <TableCell> {movement?.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
    </AppLayout>
  );
}
export const translate = {
  out: "خروج",
  in: "دخول",
  transfer: "نقل",
  deduction: 'استقطاع',
  adjustment: 'تعديل',
  adjust: 'تعديل',
};