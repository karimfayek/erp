import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Delete from '@/components/includes/Delete';

export default function Deductions() {
  const { technicians = [], deductions = {} } = usePage().props;
  const { data, setData, post } = useForm({
    technician_id: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().slice(0,10),
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('payroll.deductions.store'));
  };

  return (
    <AppLayout>
      <Head title="الخصومات" />
      <div dir="rtl" className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">الخصومات</h2>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm">الفني</label>
            <select value={data.technician_id} onChange={e => setData('technician_id', e.target.value)} className="w-full p-2 border rounded">
              <option value="">اختر الفني</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">المبلغ</label>
            <Input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">السبب</label>
            <Input value={data.reason} onChange={e => setData('reason', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">التاريخ</label>
            <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button type="submit">إضافة خصم</Button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-right'>الفني</TableHead>
                <TableHead className='text-right'>المبلغ</TableHead>
                <TableHead className='text-right' >السبب</TableHead>
                <TableHead className='text-right'>التاريخ</TableHead>
                <TableHead className='text-right'>-</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.data?.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.technician.name}</TableCell>
                  <TableCell>{Number(d.amount).toFixed(2)}</TableCell>
                  <TableCell>{d.reason}</TableCell>
                  <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                  <TableCell><Delete id={d.id} routeName={'deduction.delete'}/></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
