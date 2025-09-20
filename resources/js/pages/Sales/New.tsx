import React, { useEffect, useMemo, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";

/**
 * Expected props from server:
 * - customers: [{id, name}]
 * - products: [{id, name, code, unit, price, tax_rate}]
 * - user: current auth user (optional)
 */
import { type BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import NewCustomer from "../Customers/New";
import { can } from "@/utils/permissions";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sales',
    href: '/sales',
  },
];
export default function SalesCreate() {
  if (!can('Invoices create')) {
    return null
  }

  const { customers = [], products = [], warehouses = [], errors = {}, flash = {}, inventory = {} } = usePage().props as {
    customers: any[],
    products: any[],
    warehouses: { id: string | number, name: string }[],
    errors: Record<string, any>,
    flash: Record<string, any>,
    inventory: any,
  };
  

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p.id), p));
    return map;
  }, [products]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [items, setItems] = useState([
    { tempId: generateId(), product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: inventory.id, unit_price: 0, total: 0 },
  ]);

  const { data, setData, post, processing, reset } = useForm({
    date: new Date().toISOString().slice(0, 10),
    customer_id: "",
    user_id: "", // optional, you can bind backend default auth()->id()
    discount_percentage: 0,
    collected: 0,
    postponed: 0, // computed after submit on backend too
    tax_percent: 0, // UI helper to compute tax amount; backend can compute from items or default
    tax: 0,
    expenses: 0,
    unknown_f: "",

    notes: "",
    items: [],
  });
  const [customersList, setCustomersList] = useState(customers);
  const [open, setOpen] = useState(false);
  // ...existing code...
  const checkQtyAndUpdate = (tempId, patch = {}) => {
    setItems((prev) => {
      const row = prev.find((r) => r.tempId === tempId);
      if (!row) return prev;

      let newRow = { ...row, ...patch };

      // إذا تم تغيير المنتج، املأ باقي الحقول تلقائياً
      if (patch.product_id) {
        const p = productMap.get(String(patch.product_id));
        if (p) {
          newRow = {
            ...newRow,
            unit_price: p.price ?? 0,
            product_code: p.internal_code ?? "",
            description: p.name ?? "",
          };
        }
      }

      // يجب توفر منتج ومخزن وكمية
      if (!newRow.product_id || !newRow.inv || !newRow.qty) return prev.map((r) => r.tempId === tempId ? newRow : r);

      fetch('/inventory/qtyCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({
          product_id: newRow.product_id,
          qty: newRow.qty,
          warehouse_id: newRow.inv,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.available_qty >= newRow.qty) {
            
            setItems((prev2) => recalcAll(prev2.map((r) => r.tempId === tempId ? { ...newRow } : r)));
          } else {
            console.log('data', data);
            //show user available qty in other warehouses for that product
            let otherWarehousesInfo = '';
            //edit the folowing because all_quantities is an object not an array
            Object.entries(data.all_quantities ?? {}).forEach(([warehouseId, qty]) => {
              if (warehouseId !== newRow.inv) {
                const warehouse = warehouses.find((w) => w.id === warehouseId);
                console.log('warehouse', warehouse);
                otherWarehousesInfo += ` ${warehouse?.name ?? warehouseId}: ${qty} \n`;
              }
            });
              toast(` ${data.available_qty ?? 0}الكمية غير متوفرة في هذا المخزن. المتاح:`, {
                description: `${otherWarehousesInfo}`,
                action: {
                  label: "OK",
                  onClick: () => {},
                },
              })
            
            
            setItems((prev2) =>
              recalcAll(prev2.map((r) =>
                r.tempId === tempId ? { ...newRow, qty: data.available_qty } : r
              ))
            );
          }
        })
        .catch((error) => {
          console.error('Error checking quantity:', error);
          setItems((prev2) =>
              recalcAll(prev2.map((r) =>
                r.tempId === tempId ? { ...newRow, qty: 0 } : r
              ))
            );
          toast("حدث خطأ أثناء التحقق من المخزون");
        });

      return prev.map((r) => r.tempId === tempId ? newRow : r);
    });
  };
  

  const handleCustomerChange = (customerId: string) => {
    if (!customerId) return;
    if (customerId === 'new') {
      setOpen(true);
    } else {
      setData((prev) => {
        const selected = customersList.find((c) => String(c.id) === String(customerId));
        customersList.map((cu) => console.log('cu', String(cu.id), String(customerId)))
        console.log('selected', selected)
        return {
          ...prev,
          customer_id: String(customerId),
          discount_percentage: selected ? selected.discount_percentage || 0 : prev.discount_percentage
        };
      });
    }
  };


  // helpers
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const recalcRow = (row) => {
    const qty = toNumber(row.qty);
    const price = toNumber(row.unit_price);
    return { ...row, total: +(qty * price).toFixed(2) };
  };

  const recalcAll = (rows) => rows.map(recalcRow);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { tempId: generateId(), product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: inventory.id, unit_price: 0, total: 0 },
    ]);
  };

  const removeRow = (tempId) => {
    setItems((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const updateRow = (tempId, patch) => {
    setItems((prev) => recalcAll(prev.map((r) => (r.tempId === tempId ? { ...r, ...patch } : r))));
  };
  // compute available quantity for selected product in selected from_warehouse
  // totals
  const subtotal = useMemo(() => items.reduce((s, r) => s + toNumber(r.total), 0), [items]);
  const discountValue = useMemo(() => (subtotal * toNumber(data.discount_percentage)) / 100, [subtotal, data.discount_percentage]);
  const afterDiscount = useMemo(() => subtotal - discountValue, [subtotal, discountValue]);
  const taxAmount = useMemo(() => (afterDiscount * toNumber(data.tax_percent)) / 100, [afterDiscount, data.tax_percent]);
  const grandTotal = useMemo(() => afterDiscount + taxAmount + toNumber(data.expenses), [afterDiscount, taxAmount, data.expenses]);
  const postponed = useMemo(() => Math.max(0, grandTotal - toNumber(data.collected)), [grandTotal, data.collected]);
  useEffect(() => {
    setData("items", items);
  }, [items]);
  useEffect(() => {
    setData(prev => ({
      ...prev,
      items: items,
      tax: +taxAmount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      postponed: +postponed.toFixed(2),
    }));
  }, [items, taxAmount, subtotal, postponed]);
  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      tax: +taxAmount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      postponed: +postponed.toFixed(2),
      items: items.map(({ tempId, ...r }) => ({
        ...r,
        qty: toNumber(r.qty),
        inv: toNumber(r.inv),
        unit_price: toNumber(r.unit_price),
        
      })),
    };

    if (payload.items.length === 0 || payload.items.every((r) => !r.product_id && !r.description)) {
      toast("أضف صنفًا واحدًا على الأقل");

      return;
    }

    post(route("sales.store"), {
      preserveScroll: true,
      data: payload,
      onSuccess: () => {
        toast("تم حفظ عملية البيع بنجاح");
        reset();
        setItems([{ tempId: generateId(), product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: inventory.id, unit_price: 0, total: 0 }]);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>


      <div dir="rtl" className="p-6 space-y-6">
        <Head title="إضافة عملية بيع" />

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">بيانات عملية البيع</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input id="date" type="date" value={data.date} onChange={(e) => setData("date", e.target.value)} />
                  {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <Label>العميل</Label>
                  <Select value={String(data.customer_id || "")} onValueChange={(v) => handleCustomerChange(v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="text-blue-600">+ إضافة عميل جديد</SelectItem>
                      {customersList.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}

                    </SelectContent>
                  </Select>
                  {errors.customer_id && <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">نسبة الخصم %</Label>
                  <Input id="discount_percentage" type="number" step="0.01" value={data.discount_percentage}
                    onChange={(e) => setData((prev) => ({ ...prev, discount_percentage: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_percent">الضريبة %</Label>
                  <Input id="tax_percent" type="number" step="0.01" value={data.tax_percent} onChange={(e) => setData("tax_percent", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="expenses">مصروفات</Label>
                  <Input id="expenses" type="number" step="0.01" value={data.expenses} onChange={(e) => setData("expenses", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="unknown_f">ف</Label>
                  <Input id="unknown_f" value={data.unknown_f} onChange={(e) => setData("unknown_f", e.target.value)} placeholder="(حقل مؤقت حتى يوضحه العميل)" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collected">محصل (ما تم تحصيله)</Label>
                  <Input id="collected" type="number" step="0.01" value={data.collected} onChange={(e) => setData("collected", e.target.value)} />
                </div>
                <div>
                  <Label>مؤجل (يُحسب تلقائيًا)</Label>
                  <Input readOnly value={postponed.toFixed(2)} />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">الأصناف (Sales Items)</h3>
                  <Button type="button" variant="secondary" onClick={addRow}>إضافة صنف</Button>
                </div>

                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[220px]">المنتج</TableHead>
                        <TableHead>الكود</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>المخزن</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>إجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((row) => (
                        <TableRow key={row.tempId}>
                          <TableCell>
                            <Select value={String(row.product_id || "")} onValueChange={(v) => checkQtyAndUpdate(row.tempId, { product_id: v })} >
                              <SelectTrigger className="w-[220px]"><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}> {p.name} - ({p.internal_code}) - {p.brand_id}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input value={row.product_code || ""} onChange={(e) => updateRow(row.tempId, { product_code: e.target.value })} />
                          </TableCell>

                          <TableCell>
                            <Input value={row.description || ""} onChange={(e) => updateRow(row.tempId, { description: e.target.value })} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="1" min="0" value={row.qty} onChange={(e) => checkQtyAndUpdate(row.tempId, { qty: e.target.value })} />

                          </TableCell>
                          <TableCell>
                            <Select value={String(row.inv || "")} onValueChange={(v) => checkQtyAndUpdate(row.tempId, { inv: v })}>
                              <SelectTrigger className="w-[220px]"><SelectValue placeholder="اختر المخزن" /></SelectTrigger>
                              <SelectContent>
                                {warehouses.map((w) => (
                                  <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="0.01" value={row.unit_price} onChange={(e) => updateRow(row.tempId, { unit_price: e.target.value })} />
                          </TableCell>
                          <TableCell>
                            <Input readOnly value={Number(row.total).toFixed(2)} />
                          </TableCell>
                          <TableCell>
                            <Button type="button" variant="destructive" onClick={() => removeRow(row.tempId)}>حذف</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline">ملخص</Badge>
                  <div className="flex items-center justify-between"><span>الإجمالي (قبل الخصم):</span><span>{subtotal.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span>قيمة الخصم:</span><span>{discountValue.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span>بعد الخصم:</span><span>{afterDiscount.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span>الضريبة:</span><span>{taxAmount.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span>مصروفات:</span><span>{toNumber(data.expenses).toFixed(2)}</span></div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-semibold text-lg"><span>الإجمالي النهائي:</span><span>{grandTotal.toFixed(2)}</span></div>
                </div>
                <div className="flex items-end justify-end">
                  <Button type="submit" disabled={processing} className="mt-6">حفظ</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>

            <NewCustomer
              onCreated={(customer) => {
                // أضف العميل الجديد للقائمة
                setCustomersList((prev) => [...prev, customer]);

                // اضبط id + الخصم
                setData((prev) => ({
                  ...prev,
                  customer_id: String(customer.id),
                  discount_percentage: customer.discount_percentage || 0,
                }));


                // اقفل الـ dialog
                setOpen(false);
              }}
            />

          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
