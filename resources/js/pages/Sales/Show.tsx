import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvoiceShow({ invoice }) {
  console.log(invoice)
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 shadow-xl rounded-2xl border" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {invoice.is_invoice ?
              <p>فاتورة</p>
              :
              <p>بيان اسعار</p>
            }
          </h1>
          <p className="text-sm text-gray-600">#{invoice.invoice_number}</p>
        </div>
        <div className="text-right space-y-1 text-sm">
          <p>التاريخ: {new Date(invoice.date).toLocaleDateString("ar-EG")}</p>
          <p>المندوب: <span className="font-semibold">{invoice.user?.name || "غير محدد"}</span></p>
          <p>الفرع: <span className="font-semibold">{invoice.user?.warehouse?.branch?.name || "غير محدد"}</span></p>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات العميل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-semibold">الاسم:</span> {invoice.customer?.name}</p>
          <p><span className="font-semibold">الهاتف:</span> {invoice.customer?.phone}</p>
          <p><span className="font-semibold">العنوان:</span> {invoice.customer?.address}</p>

        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>الأصناف</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow >
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">اسم الصنف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">سعر الوحدة</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.product?.item_code}</TableCell>
                  <TableCell>{item.product?.name}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.unit_price}</TableCell>
                  <TableCell>{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{invoice.notes || "لا توجد ملاحظات"}</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>الإجمالي الفرعى :</span> <span>{invoice.subtotal}</span></div>
              {invoice.discount_percentage > 0 &&

                <>
                <div className="flex justify-between"><span>قيمة الخصم:</span>
                  <span>{invoice.discount_percentage}%</span>
                  </div>
                  <div className="flex justify-between"><span>بعد الخصم:</span>
                   <span>{invoice.after_discount}</span></div>
                   </>
              }
              {invoice.tax > 0 &&
                <div className="flex justify-between"><span>الضريبة:</span> <span>{invoice.tax}</span></div>
              }
              {invoice.expenses > 0 &&
                <div className="flex justify-between"><span>المصروفات:</span> <span>{invoice.expenses}</span></div>
              }
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>الإجمالي النهائي:</span>
                <span>{invoice.total}</span>
              </div>
              {invoice.collected > 0 &&

                <><div className="flex justify-between"><span>تم تحصيل:</span>
                  <span>{invoice.collected}</span></div><div className="flex justify-between"><span>المؤجل:</span> <span>{invoice.postponed}</span></div></>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
