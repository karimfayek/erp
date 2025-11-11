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
import { Switch } from "@/components/ui/switch";

import CustomerCombobox from "@/components/CustomerCombobox";
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
import axios from "axios";
import { NumberDisplay } from "@/lib/utils";
import { ProductCombobox } from "@/components/ProductCombobox";
import { Checkbox } from "@/components/ui/checkbox";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sales',
    href: '/sales',
  },
];
export default function SalesCreate() {
  if (!can('Invoices create') && !can('Maintenance sales')) {
    return null
  }

  const { customers = [], users = [], user = {}, products = [], warehouses = [], errors = {}, flash = {}, inventory = {}, maintainance = false, technicians = [] } = usePage().props as {
    customers: any[],
    products: any[],
    technicians: any[],
    maintainance: boolean,
    users: any[],
    user: { id: string | number, name: string },
    warehouses: { id: string | number, name: string }[],
    errors: Record<string, any>,
    flash: Record<string, any>,
    inventory: any,
  };

  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p.id), p));
    return map;
  }, [products]);

  const [userInventory, setUserInventory] = useState(inventory?.id ?? "")
  const [currentWarehouses, setCurrentWarehouses] = useState(warehouses ?? [])

  const [warHouseName, setWarHouseName] = useState(currentWarehouses.find(
    (wh) => String(wh.id) === String(userInventory)
  ))
  console.log({ userInventory, currentWarehouses, warHouseName })
  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [items, setItems] = useState([
    { tempId: generateId(), replacing: false, product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: userInventory, unit_price: 0, total: 0 },
  ]);

  const { data, setData, post, processing, reset } = useForm({
    date: new Date().toISOString().slice(0, 10),
    customer_id: "",
    user_id: user.id,
    discount_percentage: 0,
    collected: 0,
    postponed: 0, // computed after submit on backend too
    tax_percent: 14, // UI helper to compute tax amount; backend can compute from items or default
    tax: 0,
    other_tax: 0,
    is_delivered: true,
    is_invoice: true,
    expenses: 0,
    unknown_f: "",
    document_type: 'I',
    invoice_type: 'T02',
    payment_method: 'C',
    total: 0,
    other_tax_val: 0,
    notes: "",
    maintainance: maintainance,
    items: [],
    technicians: [],
  });
  const addTechnician = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // استخدم setData من useForm بشكل صريح لتجنب stale state
    const newList = [...(data.technicians || []), { technician_id: '', commission_percent: 0 , transportation :0}];
    setData('technicians', newList);
  };

  const removeTechnician = (e, index) => {
    if (e && e.preventDefault) e.preventDefault();
    const newList = [...(data.technicians || [])];
    newList.splice(index, 1);
    setData('technicians', newList);
  };

  const updateTechnician = (index, field, value) => {
    const newList = [...(data.technicians || [])];
    // تأكد أن العنصر موجود
    if (!newList[index]) newList[index] = { technician_id: '', commission_percent: 0 , transportation :0};
    // لو الحقل نسبة العمولة حول القيمة لرقم
    if (field === 'commission_percent') {
      // نقبل قيم عشرية
      newList[index][field] = value === '' ? '' : Number(value);
    } else {
      // تحويل id إلى نص لتتوافق مع Select (يمكن تحويل للباك كـ Number عند الإرسال)
      newList[index][field] = value;
    }
    setData('technicians', newList);
  };

  const handleIsInvoiceCHange = (v) => {
    if (!v) {
      setData('tax_percent', 0)
      setData('other_tax', 0)
    } else {
      setData('tax_percent', 14)
    }
    setData('is_invoice', v)

  }
  const handleUserChange = (userId) => {

    const user = users.find((u) => u.id == userId);
    if (!user) return;
    setWarHouseName(user.warehouse)
    console.log(user, 'use')
    setUserInventory(user.warehouse_id);
    setData("user_id", userId);

    // بعد تغيير المستخدم، أعد فحص كل الصفوف
    recheckAllItemsForNewInventory(user.warehouse_id);
  };

  // 🔄 إعادة فحص كل الأصناف بناءً على المخزن الجديد
  const recheckAllItemsForNewInventory = async (warehouseId) => {
    setItems((prevItems) => {
      // نحدّث كل صف حسب الكمية الجديدة
      prevItems.forEach((item) => {
        if (!item.product_id || !item.qty) return;

        axios.post("/inventory/qtyCheck", {
          product_id: item.product_id,
          qty: item.qty,
          warehouse_id: warehouseId,
        })

          .then((response) => {
            const data = response.data;
            setCurrentWarehouses(data.inv)
            setItems((current) =>
              recalcAll(
                current.map((r) => {
                  if (r.tempId !== item.tempId) return r;

                  if (data.available_qty >= item.qty) {
                    return { ...r, inv: warehouseId, qty: item.qty };
                  } else {
                    // عرض تحذير بالمتاح في المخازن الأخرى
                    let otherWarehousesInfo = "";
                    Object.entries(data.all_quantities ?? {}).forEach(
                      ([wid, qty]) => {
                        if (wid !== warehouseId) {
                          const warehouse = currentWarehouses.find(
                            (w) => w.id === Number(wid)
                          );
                          otherWarehousesInfo += ` ${warehouse?.name ?? wid}: ${qty}\n`;
                        }
                      }
                    );

                    toast(
                      `${data.available_qty ?? 0} الكمية غير متوفرة في هذا المخزن. المتاح:`,
                      {
                        description: `${otherWarehousesInfo}`,
                        action: {
                          label: "OK",
                          onClick: () => { },
                        },
                      }
                    );

                    return {
                      ...r,
                      inv: warehouseId,
                      qty: data.available_qty ?? 0,
                    };
                  }
                })
              )
            );
          })
          .catch((err) => {
            console.error("Error rechecking inventory:", err);
            toast("حدث خطأ أثناء التحقق من المخزون");
          });
      });

      return prevItems;
    });
  };

  const [customersList, setCustomersList] = useState(customers);
  const [open, setOpen] = useState(false);
  // ...existing code...
  const checkQtyAndUpdate = (tempId, patch = {}) => {
    console.log('checking...')
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

      axios.post('/inventory/qtyCheck', {

        product_id: newRow.product_id,
        qty: newRow.qty,
        warehouse_id: userInventory,
      })
        .then((response) => {
          const data = response.data;
          setCurrentWarehouses(data.inv)
          if (data.available_qty >= newRow.qty) {

            setItems((prev2) => recalcAll(prev2.map((r) => r.tempId === tempId ? { ...newRow } : r)));
          } else {
            console.log('data', data);
            //show user available qty in other warehouses for that product
            let otherWarehousesInfo = '';
            //edit the folowing because all_quantities is an object not an array
            Object.entries(data.all_quantities ?? {}).forEach(([warehouseId, qty]) => {
              if (warehouseId !== newRow.inv) {
                const warehouse = currentWarehouses.find((w) => w.id === warehouseId);
                console.log('warehouse', warehouse);
                otherWarehousesInfo += ` ${warehouse?.name ?? warehouseId}: ${qty} \n`;
              }
            });
            toast(` ${data.available_qty ?? 0}الكمية غير متوفرة في هذا المخزن. المتاح:`, {
              description: `${otherWarehousesInfo}`,
              action: {
                label: "OK",
                onClick: () => { },
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
    console.log(customerId, 'c id')
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
          discount_percentage: selected ? selected.discount_percentage ||  0 : prev.discount_percentage
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
      { tempId: generateId(), replacing: false, product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: userInventory, unit_price: 0, total: 0 },
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
  const taxAmount = useMemo(() => {
    const tax1 = (afterDiscount * toNumber(data.tax_percent)) / 100;
    return tax1;
  }, [afterDiscount, data.tax_percent]);

  const OtherTaxAmount = useMemo(() => {
    const tax2 = (afterDiscount * toNumber(data.other_tax)) / 100;
    return tax2;
  }, [afterDiscount, data.other_tax]);

  const grandTotal = useMemo(() => afterDiscount - OtherTaxAmount + taxAmount, [afterDiscount, taxAmount, OtherTaxAmount]);

  const postponed = useMemo(() => Math.max(0, grandTotal - toNumber(data.collected)), [grandTotal, data.collected]);
  useEffect(() => {
    setData("items", items);
    setData("collected", grandTotal);
  }, [items]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      items: items,
      tax: +taxAmount.toFixed(2),
      other_tax_val : +OtherTaxAmount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      total: +grandTotal.toFixed(2),
      postponed: +postponed.toFixed(2),
    }));
  }, [items, taxAmount, subtotal, postponed]);
  const submit = (e) => {
    e.preventDefault();
    if(data.technicians.length === 0 && maintainance){
      const proceed = window.confirm("⚠️ لم تضف أى فنى ,هل تريد المتابعة رغم ذلك؟");
    if (!proceed) {
      
      return;
    }
    }
    const payload = {
      ...data,
      tax: +taxAmount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      total: +grandTotal.toFixed(2),
      other_tax_val : +OtherTaxAmount.toFixed(2),
      postponed: +postponed.toFixed(2),
      items: items.map(({ tempId, ...r }) => ({
        ...r,
        qty: toNumber(r.qty),
        inv: toNumber(r.inv),
        unit_price: toNumber(r.unit_price),

      })),
    };

    console.log(payload , 'payload');
    if (payload.items.length === 0 || payload.items.every((r) => !r.product_id && !r.description)) {
      toast("أضف صنفًا واحدًا على الأقل");

      return;
    }

    post(route("sales.store"), {
      preserveScroll: false,
      data: payload,
      onSuccess: () => {
        toast("تم حفظ عملية البيع بنجاح");
        reset();
        setItems([{ tempId: generateId(),replacing:false, product_id: "", product_code: "", serial_number: "", description: "", qty: 1, inv: userInventory, unit_price: 0, total: 0 }]);
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
            <div className="flex justify-center">
              <div className="self-start border flex items-center justify-between p-4 space-x-2" dir="ltr">

                <Label htmlFor="is_invoice"> بيان اسعار</Label>
                <Switch id="is_invoice"
                  className="data-[state=checked]:bg-green-500"
                  checked={data.is_invoice}
                  onCheckedChange={(v) => handleIsInvoiceCHange(v)}
                />
                <Label htmlFor="is_invoice">فاتورة </Label>
              </div>
              <div className="mx-auto self-center text-2xl text-center">
                <h2>
                  {data.is_invoice ?
                    <p> فاتورة</p>
                    :

                    <p>بيان اسعار</p>
                  }
                </h2>
              </div>
            </div>

            <Separator />
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input id="date" type="date" value={data.date} onChange={(e) => setData("date", e.target.value)} />
                  {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                </div>
                <div>
                  <Label>نوع المستند</Label>
                  <Select value={data.document_type} onValueChange={(v) => setData('document_type', v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="اختر نوع المستتند" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I" className="text-blue-600">فاتورة ضريبية Invoice   </SelectItem>
                      <SelectItem value="C" className="text-blue-600">إشعار دائن Credit Note  </SelectItem>
                      <SelectItem value="D" className="text-blue-600"> إشعار مدين Debit Note   </SelectItem>


                    </SelectContent>
                  </Select>
                  {errors.document_type && <p className="text-red-600 text-sm mt-1">{errors.document_type}</p>}
                </div>
                <div>
                  <Label>نوع الفاتورة</Label>
                  <Select value={data.invoice_type} onValueChange={(v) => setData('invoice_type', v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="اختر نوع المستتند" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T01" className="text-blue-600">فاتورة ضريبية Invoice   </SelectItem>
                      <SelectItem value="T02" className="text-blue-600">فاتورة مبسطة (Simplified Invoice)   </SelectItem>
                      <SelectItem value="T03" className="text-blue-600"> فاتورة إيصال (Receipt)   </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.invoice_type && <p className="text-red-600 text-sm mt-1">{errors.invoice_type}</p>}
                </div>
                <div>
                  <Label>طريقة الدفع </Label>
                  <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="  اختر طريقة الدفع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C" className="text-blue-600"> كاش   </SelectItem>
                      <SelectItem value="T" className="text-blue-600"> تحويل بنكى  </SelectItem>
                      <SelectItem value="CC" className="text-blue-600">  كارت ائتمان Credit Card  </SelectItem>
                      <SelectItem value="DB" className="text-blue-600"> كارت خصم Debit Card   </SelectItem>
                      <SelectItem value="CH" className="text-blue-600"> شيك   </SelectItem>
                      <SelectItem value="V" className="text-blue-600"> Voucher / Coupon   </SelectItem>
                      <SelectItem value="INSTA" className="text-blue-600">  انستا باى   </SelectItem>
                      <SelectItem value="O" className="text-blue-600">  أخرى  </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.invoice_type && <p className="text-red-600 text-sm mt-1">{errors.invoice_type}</p>}
                </div>
                <div>
                  <Label>العميل</Label>
                  <CustomerCombobox
                    customersList={customersList}
                    data={data}
                    handleCustomerChange={handleCustomerChange}
                  />

                  {errors.customer_id && <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>}
                </div>
                {can('Invoice for others') &&

                  <div>
                    <Label>المندوب</Label>
                    <Select value={String(data.user_id || "")} onValueChange={(v) => handleUserChange(v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="اختر المندوب" /></SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                        ))}

                      </SelectContent>
                    </Select>
                    <p>{warHouseName?.name}</p>
                    {errors.user_id && <p className="text-red-600 text-sm mt-1">{errors.user_id}</p>}
                  </div>
                }
                <div className="border flex items-center justify-between p-4 space-x-2" dir="ltr">
                  <Switch id="is_delivered"
                    className="data-[state=checked]:bg-green-500"
                    checked={data.is_delivered}
                    onCheckedChange={(v) => setData('is_delivered', v)}
                  />
                  <Label htmlFor="is_delivered">تم التسليم</Label>
                </div>
            
                
              </div>
              {maintainance &&
              
                  <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">الفنيين</h3>
                  <div className="grid grid-cols-4 gap-4 font-semibold mb-2">
                      <Label>الفنى</Label>
                       <Label>نسبه العمولة</Label>
                       <Label> انتقالات</Label>
                      <Label>حذف</Label>
                    </div>
                  {(data.technicians || []).map((tech, index) => (
                    <div key={tech.technician_id ? `t-${tech.technician_id}-${index}` : `t-index-${index}`} className="grid grid-cols-4 gap-4 mb-2">
                      {/* اختر الفني: نفعل stringify على القيم */}
                      <div>

                      <Select
                        value={tech.technician_id ? String(tech.technician_id) : ""}
                        onValueChange={(v) => updateTechnician(index, 'technician_id', v)}
                      >
                        <SelectTrigger><SelectValue placeholder="اختر الفني" /></SelectTrigger>
                        <SelectContent>
                          {technicians.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>

                      {/* نسبة العمولة - نخلي القيمة قابلة للكتابة ونحوّلها لرقم */}
                      <div>
                      <Input
                        type="number"
                        placeholder="نسبة العمولة %"
                        //onmousewheel dont change number
                        onWheel={(e) =>e.target.blur()} 
                        value={tech.commission_percent !== undefined ? tech.commission_percent : ''}
                        onChange={(e) => updateTechnician(index, 'commission_percent', e.target.value)}
                      />
                      </div>
                        <div>
                      <Input
                        type="number"
                        placeholder="الانتقالات"
                        //onmousewheel dont change number
                        onWheel={(e) =>e.target.blur()} 
                        value={tech.transportation !== undefined ? tech.transportation : ''}
                        onChange={(e) => updateTechnician(index, 'transportation', e.target.value)}
                      />
                      </div>

                      {/* زر حذف - مهم: نوعه button حتى لا يرسل الفورم */}
                      <Button type="button" variant="destructive" onClick={(e) => removeTechnician(e, index)}>حذف</Button>
                    </div>
                  ))}

                  {/* زر إضافة - أيضاً type="button" */}
                  <Button type="button" variant="secondary" onClick={(e) => addTechnician(e)}>+ إضافة فني</Button>
                </div>
              }

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">نسبة الخصم %</Label>
                  <Input id="discount_percentage" type="number" step="1" value={data.discount_percentage}
                   onWheel={(e) =>e.target.blur()} 
                    onChange={(e) => setData((prev) => ({ ...prev, discount_percentage: e.target.value }))}
                  />
                </div>
                {data.is_invoice &&

                  <><div>
                    <Label htmlFor="tax_percent">الضريبة %</Label>
                    <Input id="tax_percent" type="number" step="1" value={data.is_invoice ? data.tax_percent : 0} onChange={(e) => setData("tax_percent", e.target.value)}  onWheel={(e) =>e.target.blur()}  />
                  </div><div>
                      <Label htmlFor="tax_percent">ضرائب اخرى خصم   %</Label>
                      <Select value={data.is_invoice ? Number(data.other_tax || "") : 0} onValueChange={(v) => setData('other_tax', v)}>
                        <SelectTrigger><SelectValue placeholder="اختر " /></SelectTrigger>
                        <SelectContent>

                          <SelectItem value={0}> 0</SelectItem>
                          <SelectItem value={1}> 1% </SelectItem>
                          <SelectItem value={3}> 3% </SelectItem>

                        </SelectContent>
                      </Select>
                    </div></>
                }
                <div>
                  <Label htmlFor="expenses">
                    {'مصروفات'}
                  </Label>
                  <Input
                   onWheel={(e) =>e.target.blur()} 
                  id="expenses" type="number" step="0.01" value={data.expenses} onChange={(e) => setData("expenses", e.target.value)} />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collected">محصل (ما تم تحصيله)</Label>
                  <Input 
                   onWheel={(e) =>e.target.blur()} 
                  id="collected" type="number" step="0.01" value={Number(data.collected).toFixed(2)} onChange={(e) => setData("collected", e.target.value)} />
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
                        <TableHead className="min-w-[220px]">{maintainance ? 'اسم المنتج / الخدمة' : 'اسم المنتج'}</TableHead>
                        <TableHead>الكود</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                         {maintainance && 
                        <TableHead>بدل</TableHead>
                         }
                        <TableHead>إجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((row) => (
                        <TableRow key={row.tempId}>

                          <TableCell>
                            <ProductCombobox
                              products={products}
                              selectedId={row.product_id}
                              onSelect={(v) => checkQtyAndUpdate(row.tempId, { product_id: v })}
                            />
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
                            <Input type="number" step="0.01" value={row.unit_price} onChange={(e) => updateRow(row.tempId, { unit_price: e.target.value })} />
                          </TableCell>
                          <TableCell>
                            <Input readOnly value={Number(row.total).toFixed(2)} />
                          </TableCell>
                          {maintainance && 
                          
                           <TableCell>
                           <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                              <Checkbox
                                id="replacing"
                                 checked={!!row.replacing}                //  Boolean
                                onCheckedChange={(checked) => {              // true أو false
                                  updateRow(row.tempId, { replacing: checked }); 
                                }}
                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                              />
                              
                            </Label>
                          </TableCell>
                          }
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
                  <div className="flex items-center justify-between"><span>الإجمالي (الفرعى):</span><span><NumberDisplay value={subtotal} /> </span></div>
                  {discountValue > 0 &&

                    <div className="flex items-center justify-between"><span>قيمة الخصم:</span><span>{discountValue.toFixed(2)}</span></div>
                  }
                  {afterDiscount < subtotal &&
                    <div className="flex items-center justify-between"><span>بعد الخصم:</span><span>{afterDiscount.toFixed(2)}</span></div>
                  }
                  {taxAmount > 0 &&

                    <div className="flex items-center justify-between"><span> ضريبه {data.tax_percent}  % : </span><span><NumberDisplay value={taxAmount} />  </span></div>
                  }
                  {data.other_tax > 0 &&

                    <div className="flex items-center justify-between"><span> ضريبه {data.other_tax}  % : </span><span>{OtherTaxAmount.toFixed(2)} </span></div>
                  }

                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-semibold text-lg"><span>الإجمالي النهائي:</span><span><NumberDisplay value={grandTotal} /></span></div>
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
