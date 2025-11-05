import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { can } from '@/utils/permissions';

export default function Calc() {
    if(!can('Maintenance salary')){
        
        return null
    }
  const { technicians = [], period = {} } = usePage().props;
  const [start, setStart] = useState(period.start);
  const [end, setEnd] = useState(period.end);
  const [selected, setSelected] = useState(new Set(technicians.map(t=>t.id)));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
const [detailLoading, setDetailLoading] = useState(false);
  const [detailInvoiceIds, setDetailInvoiceIds] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const apply = async () => {
    if (!start || !end) { toast.error('حدد الفترة'); return; }
    setLoading(true);
    try {
      const res = await axios.post(route('payroll.calc.compute'), {
        start, end, technician_ids: Array.from(selected),
      });
      setResults(res.data.results);
      toast.success('تم حساب النتائج');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحساب');
    } finally {
      setLoading(false);
    }
  };

const openDetails = async (technician_id) => {
  setDetailLoading(true);
  try {
    const res = await axios.post(route('payroll.calc.invoice_details'), {
      technician_id,
      start,
      end,
    });
    setInvoiceDetails(res.data); // يحتوي على invoices array
    setOpenDetail(true);
  } catch (err) {
    console.error(err);
    toast.error('فشل جلب تفاصيل العمولات');
  } finally {
    setDetailLoading(false);
  }
};

  return (
    <AppLayout>
      <Head title="حساب مرتبات الفنيين" />
      <div className="p-6 space-y-6" dir="rtl">
        <h2 className="text-xl font-semibold">حساب مرتبات الفنيين</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm">من</label>
            <Input type="date" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">إلى</label>
            <Input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">الفنيين (اختيار/إلغاء)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
              {technicians.map(t => (
                <label key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={apply} disabled={loading}>{loading ? 'جار الحساب...' : 'تطبيق'}</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead  className='text-right'>الفني</TableHead>
                <TableHead  className='text-right'>الراتب الأساسي</TableHead>
                <TableHead  className='text-right'>العمولة (الفترة)</TableHead>
                <TableHead  className='text-right'>الانتقالات (الفترة)</TableHead>
                <TableHead  className='text-right'>الخصومات (الفترة)</TableHead>
                <TableHead  className='text-right'>الصافي</TableHead>
                <TableHead  className='text-right'>تفاصيل العمولة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{Number(r.base_salary).toFixed(2)}</TableCell>
                  <TableCell>{Number(r.total_commission).toFixed(2)}</TableCell>
                  <TableCell>{Number(r.total_transportation).toFixed(2)}</TableCell>
                  <TableCell>{Number(r.total_deductions).toFixed(2)}</TableCell>
                  <TableCell>{Number(r.final_salary).toFixed(2)}</TableCell>
                  <TableCell>
                    <button className="underline text-sm" onClick={() => openDetails(r.id)}>
  {detailLoading ? 'جارٍ التحميل...' : 'عرض التفاصيل'}
</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

       <Dialog open={openDetail} onOpenChange={setOpenDetail}>
         <DialogContent className='sm:max-w-[90vw] lg:max-w-[1400px] w-full h-auto max-h-[90vh] overflow-y-auto p-6' dir='rtl'>

    <DialogHeader>
      <DialogTitle>تفاصيل العمولات</DialogTitle>
    </DialogHeader>

    {invoiceDetails ? (
      <div className="space-y-6 p-2">
        <div className="text-sm">الفني: #{invoiceDetails.technician_id} — الفترة: {invoiceDetails.start} إلى {invoiceDetails.end}</div>

        {invoiceDetails.invoices.length > 0 ? invoiceDetails.invoices.map(inv => (
          <div key={inv.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">فاتورة #{inv.id}</div>
                <div className="text-xs text-muted-foreground">تاريخ: {new Date(inv.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">الربح (العناصر): {Number(inv.total_profit).toFixed(2)}</div>
                <div> مصروفات: {Number(inv.expenses).toFixed(2)}</div>
                <div> انتقالات: {Number(inv.transportation).toFixed(2)}</div>
                <div>الخصم ({inv.discount_percentage}%): {Number(inv.discount_value).toFixed(2)}</div>
                <div>ضرائب اخرى خصم ({inv.other_tax}%): {Number(inv.otherTaxValue).toFixed(2)}</div>
                <div className="font-semibold">الربح بعد المصروفات: {Number(inv.profit_after_expenses).toFixed(2)}</div>
                <div>نسبة العمولة: {Number(inv.commission_percent).toFixed(2)}%</div>
                <div className="text-lg font-bold">العمولة: {Number(inv.commission_amount).toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">بنود الفاتورة</div>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="w-1/3 pb-2 text-right">الصنف</th>
                      <th className="w-1/6 pb-2 text-right">سعر البيع</th>
                      <th className="w-1/6 pb-2 text-right">سعر التكلفة</th>
                      <th className="w-1/6 pb-2 text-right">الكمية</th>
                      <th className="w-1/6 pb-2 text-right">ربح السطر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-1">{item.product_name}</td>
                        <td>{Number(item.unit_price).toFixed(2)}</td>
                        <td>{Number(item.cost_price).toFixed(2)}</td>
                        <td>{Number(item.qty)}</td>
                        <td>{Number(item.line_profit).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )) : <div>لا توجد فواتير للفترة المحددة</div>}
      </div>
    ) : (
      <div className="p-4">جارٍ التحميل...</div>
    )}
  </DialogContent>
</Dialog>


      </div>
    </AppLayout>
  );
}
