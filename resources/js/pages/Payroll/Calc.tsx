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

  const openDetails = (invoiceIds = []) => {
    setDetailInvoiceIds(invoiceIds);
    setOpenDetail(true);
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
                  <TableCell>{Number(r.total_deductions).toFixed(2)}</TableCell>
                  <TableCell>{Number(r.final_salary).toFixed(2)}</TableCell>
                  <TableCell>
                    <button className="underline text-sm" onClick={() => openDetails(r.invoice_ids)}>
                      عرض {r.invoice_ids?.length ?? 0}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* مودال تفاصيل الفواتير (IDs فقط؛ يمكنك جلب التفاصيل عند الفتح إذا تحب) */}
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تفاصيل العمولات - الفواتير</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-2">
              {detailInvoiceIds && detailInvoiceIds.length > 0 ? (
                detailInvoiceIds.map(id => <div key={id}>فاتورة #{id}</div>)
              ) : <div>لا توجد فواتير</div>}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
