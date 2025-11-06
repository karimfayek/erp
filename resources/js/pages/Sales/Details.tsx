import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast ,Toaster } from "sonner";
import { NumberDisplay } from "@/lib/utils";
import { Link } from "@inertiajs/react";
// InvoicePreview
// Props: { invoice }
// invoice shape (example):
// {
//   id, internal_id, invoice_number, is_invoice (bool), is_delivered (bool),
//   date, document_type, invoice_type, payment_method,
//   customer: { name, phone, email, address },
//   user: { id, name, avatar },
//   items: [{ product_id, product_code, description, qty, unit_price, total }],
//   subtotal, discount_percentage, after_discount, tax, other_tax, expenses, collected, postponed, total
//   notes
// }

export default function InvoicePreview({ invoice }) {
  const inv = invoice || {};
  const items = inv.items || [];
const [collected , setCollected] = useState(inv.collected)
 const [isDelivered, setIsDelivered] = useState(invoice.is_delivered)
 const [markDraft, setMarkDraft] = useState(invoice.marked_to_draft)
 
   const eta_status = inv.eta_status; // 'draft', 'sent'
  const [isSent, setIsSent] = useState(eta_status)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collectedAmount, setCollectedAmount] = useState(invoice.collected_amount || 0)
  const [postponedAmount, setPostponedAmount] = useState(invoice.postponed || 0)
  const [newCollected, setNewCollected] = useState(collectedAmount)

 const handleToggleDelivery = async () => {
  try {
    setIsDelivered(!isDelivered);
    await axios.post(`/invoices/${invoice.id}/toggle-delivery`, {
      delivered: !isDelivered,
    });
    toast.success("تم تحديث حالة التسليم");
  } catch (err) {
    toast.error("حدث خطأ أثناء تحديث الحالة");
  }
};

 const handleSent = async () => {
  try {
    if(isSent === 'sent'){
      setIsSent(null);
    }else{
      setIsSent('sent');
    }
   
    await axios.post(`/invoices/${invoice.id}/toggle-draft`, {
      draft: isSent === 'sent' ? null : 'sent',
    });
    toast.success("تم تحديث الحالة بنجاح");
  } catch (err) {
    toast.error("حدث خطأ أثناء تحديث الحالة");
  }
};
const handleMarkDraft = async () => {
  try {
    setMarkDraft(!markDraft);
    await axios.post(`/invoices/${invoice.id}/toggle-mark-draft`, {
      marked_to_draft: !markDraft,
    });
    toast.success("تم تحديث حالة المسودة");
  } catch (err) {
    toast.error("حدث خطأ أثناء تحديث الحالة");
  }
};

const handleSaveCollection = async () => {
  try {
    await axios.post(`/invoices/${invoice.id}/update-collection`, {
      collected_amount: newCollected,
    }).then((data) => {
      setPostponedAmount(data.data.postponed)
    }
    );
    setCollectedAmount(Number(newCollected));
    setIsModalOpen(false);
    setCollected(newCollected)
    toast.success("تم تحديث المبلغ المحصل بنجاح");
  } catch (err) {
    toast.error("حدث خطأ أثناء تحديث المبلغ");
  }
};
  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
           <Toaster />
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{inv.is_invoice ? 'فاتورة' : 'بيان أسعار'} <span className="text-sm text-muted-foreground ml-2">{inv.invoice_number}</span></CardTitle>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="secondary">{inv.document_type || 'I'}</Badge>
              <Badge variant="outline">{inv.invoice_type || 'T01'}</Badge>
              <div className="flex items-center gap-2" dir="ltr">
                <Switch id="delivered" checked={isDelivered} onCheckedChange={handleToggleDelivery} className="data-[state=checked]:bg-green-500" />
                <Label className="text-sm">{inv.is_delivered ? 'تم التسليم' : 'لم يتم التسليم'}</Label>
              </div>
              {inv.eta_status !== 'sent' &&
              
              <div className="flex items-center gap-2" dir="ltr">
                <Switch id="draft" checked={markDraft} onCheckedChange={handleMarkDraft} className="data-[state=checked]:bg-green-500" />
                <Label className="text-sm">{inv.marked_to_draft || markDraft ? 'تم وضعه في المسودة' : 'لم يتم وضعه في المسودة'}</Label>
              </div>
              }

              {inv.eta_status === 'sent' &&
              
              <div className="flex items-center gap-2" dir="ltr">
                <Switch id="draft" checked={isSent} onCheckedChange={handleSent} className="data-[state=checked]:bg-green-500" />
                <Label className="text-sm">{inv.eta_status === 'sent' || isSent === 'sent' ? 'تم الإرسال للمنظومة' : 'لم يتم الإرسال للمنظومة'}</Label>
                                         </div>
              }
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">التاريخ</div>
              <div className="font-medium"> {new Date(inv.date).toLocaleDateString("ar-EG")}</div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {inv.user?.avatar ? <AvatarImage src={inv.user.avatar} alt={inv.user?.name} /> : <AvatarFallback>{(inv.user?.name || 'U').slice(0,2)}</AvatarFallback>}
              </Avatar>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">المستخدم</div>
                <div className="font-medium">{inv.user?.name ?? '-'}</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" dir="rtl">
            <div>
              <h4 className="text-sm font-semibold mb-2">العميل</h4>
              <div className="text-sm">{inv.customer?.name ?? '-'}</div>
              <div className="text-sm text-muted-foreground">{inv.customer?.phone ?? ''}</div>
              <div className="text-sm text-muted-foreground">{inv.customer?.email ?? ''}</div>
              <div className="text-sm text-muted-foreground">{inv.customer?.address ?? ''}</div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">تفاصيل الفاتورة</h4>
              <div className="text-sm">نوع المستند: <span className="font-medium">{inv.document_type ?? '-'}</span></div>
              <div className="text-sm">نوع الفاتورة: <span className="font-medium">{inv.invoice_type ?? '-'}</span></div>
              <div className="text-sm">طريقة الدفع: <span className="font-medium">{inv.payment_method ?? '-'}</span></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">حالة السداد</h4>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm">المحصّل: <span className="font-medium">{collected}</span></div>
              <div className="text-sm">المؤجل: <span className="font-medium">{postponedAmount}</span></div>
                 <Button onClick={() => setIsModalOpen(true)}>تعديل التحصيل</Button>
                </div>
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <div className="text-sm">المصروفات: <span className="font-medium">{Number(inv.expenses ?? 0).toFixed(2)}</span></div>
             </div>
          
             </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج / الكود</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">سعر الوحدة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, idx) => (
                  <TableRow key={row.product_id || row.tempId || idx}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{row.product_name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{row.product_code || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-right">{Number(row.qty ?? 0)}</TableCell>
                    <TableCell className="text-right">{Number(row.unit_price ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(row.total ?? (row.qty*row.unit_price) ).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">ملاحظات</h4>
              <div className="p-4 bg-muted rounded-md text-sm">{inv.notes ?? '-'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between"><span>الإجمالي (قبل الخصم):</span><span className="font-semibold">
               {inv.subtotal}</span>
               </div>

              {Number(inv.discount_percentage ?? 0) > 0 && (
                <div className="flex justify-between"><span>قيمة الخصم ({inv.discount_percentage} %):</span><span className="font-semibold">{(Number(inv.subtotal ?? 0) * Number(inv.discount_percentage ?? 0) / 100).toFixed(2)}</span></div>
              )}

              <div className="flex justify-between"><span>بعد الخصم:</span><span className="font-semibold">
                { (parseFloat(inv.subtotal.replace(/,/g, '')) || 0) -
  ((parseFloat(inv.subtotal.replace(/,/g, '')) || 0) *
   ((inv.discount_percentage || 0) / 100)) }
                </span></div>
              <div className="flex justify-between"><span>الضريبة:</span><span className="font-semibold">{Number(inv.tax ?? 0).toFixed(2)}</span></div>
             
              <div className="flex justify-between"><span>ضرائب أخرى {Number(inv.other_tax).toFixed(0) } %:</span><span className="font-semibold">{Number(inv.other_tax_val ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>المصروفات:</span><span className="font-semibold">{Number(inv.expenses ?? 0).toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>الإجمالي النهائي:</span><span>
             {inv.total_formatted}
                </span></div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {/* <Button variant="secondary">طباعة</Button>
            <Button>حفظ PDF</Button> */}
            <Button variant="secondary"><Link href="/invoices">رجوع</Link></Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المبلغ المحصل</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>المبلغ الجديد</Label>
            <Input
              type="number"
              value={newCollected}
              onChange={(e) => setNewCollected(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveCollection}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
