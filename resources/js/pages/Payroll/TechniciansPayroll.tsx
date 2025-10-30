import React, { useState, useMemo } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker"; // افتراضي إن عندك component للتاريخ، لو مش موجود استخدم input type="date"
import { toast } from "sonner";

export default function TechniciansPayroll() {
  const { technicians = [], period = {} } = usePage().props;
  // technicians: [{id, name, email, total_commission, invoice_ids}]
  const { data, setData, post, processing } = useForm({
    period_start: period.start || new Date().toISOString().slice(0,10),
    period_end: period.end || new Date().toISOString().slice(0,10),
    technician_ids: [],
    items: technicians.map(t => ({
      technician_id: t.id,
      base_salary: 0,
      total_commission: t.total_commission ?? 0,
      deductions: 0,
      invoice_ids: t.invoice_ids ?? [],
    })),
  });

  // local state to control which technicians are visible/selected
  const [selectedTechs, setSelectedTechs] = useState(new Set(technicians.map(t => t.id)));

  // helper to toggle selection
  const toggleTech = (id) => {
    const copy = new Set(selectedTechs);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelectedTechs(copy);

    // update technician_ids in form
    setData('technician_ids', Array.from(copy));
  };

  // update item row
  const updateItem = (index, field, value) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    setData('items', items);
  };

  // compute final salary per row
  const computedItems = useMemo(() => {
    return data.items.map(it => {
      const base = Number(it.base_salary || 0);
      const comm = Number(it.total_commission || 0);
      const ded = Number(it.deductions || 0);
      return { ...it, final_salary: +(base + comm - ded).toFixed(2) };
    });
  }, [data.items]);

  const submit = (e) => {
    e.preventDefault();
    // prepare payload - include only selected technicians rows
    const itemsPayload = computedItems.filter(it => selectedTechs.has(it.technician_id));
    if (itemsPayload.length === 0) {
      toast.error('اختر فنيًا واحدًا على الأقل');
      return;
    }
    setData('items', itemsPayload);
    post(route('payroll.technicians.store'), {
      data: {
        period_start: data.period_start,
        period_end: data.period_end,
        items: itemsPayload,
      },
      onSuccess: () => {
        toast.success('تم حفظ رواتب الفنيين');
      }
    });
  };

  return (
    <AppLayout>
      <Head title="حساب مرتبات الفنيين" />
      <div className="p-6 space-y-6" dir="rtl">
        <h2 className="text-2xl font-semibold">حساب مرتبات الفنيين</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>من</Label>
            <Input type="date" value={data.period_start} onChange={(e) => setData('period_start', e.target.value)} />
          </div>
          <div>
            <Label>إلى</Label>
            <Input type="date" value={data.period_end} onChange={(e) => setData('period_end', e.target.value)} />
          </div>
          <div>
            <Label>الفنيين</Label>
            <Select value={Array.from(selectedTechs).join(',')} onValueChange={(v) => {
              // allow multi-select via comma-separated values from UI if needed
              // simpler: toggle checkboxes in table
            }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="اختر الفنيين (استخدم الجدول)" /></SelectTrigger>
              <SelectContent>
                {technicians.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">يمكنك اختيار/إلغاء اختيار الفنيين من عمود التحديد في الجدول</p>
          </div>
        </div>

        <Separator />

        <form onSubmit={submit} className="space-y-4">

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اختر</TableHead>
                  <TableHead>الفني</TableHead>
                  <TableHead>الراتب الأساسي</TableHead>
                  <TableHead>إجمالي العمولات (الفاتورة)</TableHead>
                  <TableHead>خصومات</TableHead>
                  <TableHead>الصافي</TableHead>
                  <TableHead>ملاحظات / فواتير</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((t, idx) => {
                  const row = computedItems.find(it => it.technician_id === t.id) || { base_salary:0, total_commission:t.total_commission||0, deductions:0, final_salary:0 };
                  const checked = selectedTechs.has(t.id);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <input type="checkbox" checked={checked} onChange={() => toggleTech(t.id)} />
                      </TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" value={row.base_salary} onChange={(e) => updateItem(idx, 'base_salary', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input readOnly value={Number(row.total_commission || 0).toFixed(2)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" value={row.deductions || ''} onChange={(e) => updateItem(idx, 'deductions', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input readOnly value={row.final_salary ?? '0.00'} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {t.invoice_ids && t.invoice_ids.length > 0 ? (
                            <div className="space-y-1">
                              {t.invoice_ids.slice(0,5).map(id => <div key={id} className="text-xs">#{id}</div>)}
                              {t.invoice_ids.length > 5 && <div className="text-xs text-muted-foreground">و {t.invoice_ids.length - 5} المزيد...</div>}
                            </div>
                          ) : <div className="text-xs text-muted-foreground">لا فواتير</div>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={processing}>حفظ الرواتب</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
