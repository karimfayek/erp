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
export default function TransferForm({ products, warehouses , movements }) {
    console.log(movements, 'movements')
  const { data, setData, post, processing } = useForm({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: 1,
    notes: ''
  });
console.log(warehouses , 'warehoses')
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

   
    <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product">المنتج</Label>
          <select
            id="product"
            value={data.product_id}
            onChange={(e) => setData('product_id', e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">اختر منتج</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="from_warehouse">من المخزن</Label>
          <select
            id="from_warehouse"
            value={data.from_warehouse_id}
            onChange={(e) => setData('from_warehouse_id', e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">اختر مخزن مصدر</option>
            {warehouses?.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.branch?.name}
              </option>
            ))}
          </select>
          {data.from_warehouse_id && data.product_id && (
            <p className="text-sm mt-1">الرصيد المتاح: {availableQuantity}</p>
          )}
        </div>

        <div>
          <Label htmlFor="to_warehouse">إلى المخزن</Label>
          <select
            id="to_warehouse"
            value={data.to_warehouse_id}
            onChange={(e) => setData('to_warehouse_id', e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">اختر مخزن هدف</option>
            {warehouses && warehouses
              .filter(w => w.id != data.from_warehouse_id)
              .map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.branch?.name}
                </option>
              ))}
          </select>
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
    <div className="mt-6 bg-white p-4 rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className='text-right'>الاسم</TableHead>
                            <TableHead className='text-right'>من مخزن</TableHead>
                            <TableHead className='text-right'>الى مخزن</TableHead>
                            <TableHead className='text-right'> الكميه</TableHead>
                            <TableHead className='text-right'> الوقت</TableHead>
                            <TableHead className='text-right'> بواسطة</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements?.data?.map(movement => (
                            <TableRow key={movement?.id}>
                                <TableCell>{movement?.product?.name}</TableCell>
                                <TableCell>{movement?.from_warehouse?.name}</TableCell>
                                <TableCell>{movement?.to_warehouse ? movement?.to_warehouse.name : 'بيع' }</TableCell>
                                <TableCell>{movement?.quantity}</TableCell>
                                <TableCell>{movement?.updated_at ? formatDateTime(movement?.updated_at)  : formatDateTime(movement?.created_at)}</TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
    </AppLayout>
  );
}