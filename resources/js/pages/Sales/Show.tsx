import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NumberDisplay } from "@/lib/utils"
import { Link } from "@inertiajs/react"
import { useRef } from "react"

type PrintMode = "a4" | "thermal"

// Dynamically inject a <style id="print-page-style"> with the correct @page rule
function setPrintPageStyle(mode: PrintMode) {
  let el = document.getElementById("print-page-style") as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = "print-page-style"
    document.head.appendChild(el)
  }
  if (mode === "a4") {
    el.textContent = `@media print { @page { size: A4 portrait; margin: 15mm; } }`
  } else {
    el.textContent = `@media print { @page { size: 80mm auto; margin: 4mm 3mm; } }`
  }
}

export default function InvoiceShow({ invoice }) {
  const printMode = useRef<PrintMode>("a4")

  const handlePrint = (mode: PrintMode) => {
    printMode.current = mode
    setPrintPageStyle(mode)
    document.documentElement.setAttribute("data-print-mode", mode)
    window.print()
    setTimeout(() => {
      document.documentElement.removeAttribute("data-print-mode")
    }, 1000)
  }

  return (
    <>
      {/* ===== Global Print Styles ===== */}
      <style>{`
        @media print {
          /* --- common --- */
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }

          /* --- A4 --- */
          html[data-print-mode="a4"] .invoice-wrapper {
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          /* --- Thermal 80mm --- */
          html[data-print-mode="thermal"] .invoice-wrapper {
            max-width: 74mm !important;
            width: 74mm !important;
            padding: 0 !important;
            margin: 0 auto !important;
            font-size: 11px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          html[data-print-mode="thermal"] .thermal-hide {
            display: none !important;
          }
          /* Stack header vertically and center for thermal */
          html[data-print-mode="thermal"] .invoice-header,
          html[data-print-mode="thermal"] .invoice-header > div {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 4px !important;
          }
          html[data-print-mode="thermal"] .invoice-header > div > div {
            min-width: unset !important;
            text-align: center !important;
          }
          /* Logo size in thermal */
          html[data-print-mode="thermal"] .invoice-logo {
            height: 36px !important;
            width: auto !important;
            display: block !important;
            margin: 0 auto 2px auto !important;
          }

          html[data-print-mode="thermal"] .invoice-wrapper .grid {
            display: block !important;
          }
          html[data-print-mode="thermal"] .thermal-table th,
          html[data-print-mode="thermal"] .thermal-table td {
            padding: 2px 3px !important;
            font-size: 10px !important;
          }
          html[data-print-mode="thermal"] .summary-section {
            font-size: 10px !important;
          }
          html[data-print-mode="thermal"] .thermal-notes {
            display: block !important;
          }
        }
      `}</style>

      {/* ===== Print Buttons (hidden on print) ===== */}
      <div className="no-print max-w-4xl mx-auto px-8 pt-6 flex gap-3 justify-end" dir="rtl">
        <button
          onClick={() => handlePrint("a4")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition"
        >
          🖨️ طباعة A4
        </button>
        <button
          onClick={() => handlePrint("thermal")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition"
        >
          🧾 طابعة حرارية 80mm
        </button>
      </div>

      {/* ===== Invoice Body ===== */}
      <div className="invoice-wrapper max-w-4xl mx-auto p-8 space-y-6 shadow-xl rounded-2xl border mb-10" dir="rtl">

        {/* ===== Header ===== */}
        <div className="invoice-header border-b pb-4">

          {/* Top row: company info | invoice title | transaction meta */}
          <div className="flex justify-between items-start gap-4">

            {/* Right: Company Info */}
            <div className="text-right space-y-0.5 min-w-[130px]">
              <Link href="/invoices">
                <img src="/logonew.png" alt="رافكو" className="invoice-logo h-14 w-auto mr-auto mb-1 inline-block" />
                <p className="text-xl font-extrabold tracking-wide">رافكو للتوريدات</p>
              </Link>
              <p className="text-xs text-gray-500">للشكاوى : 01001448447</p>
            </div>

            {/* Center: Invoice Type & Number */}
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold">
                {invoice.is_invoice ? "فاتورة" : "بيان أسعار"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">#{invoice.invoice_number}</p>
            </div>

            {/* Left: Transaction Meta */}
            <div className="text-left space-y-0.5 text-sm min-w-[160px]">
              <p>التاريخ: <span className="font-semibold">{new Date(invoice.date).toLocaleDateString("ar-EG")}</span></p>
              <p>مسؤول المبيعات: <span className="font-semibold">{invoice.user?.name || "غير محدد"}</span></p>
              <p>الفرع: <span className="font-semibold">{invoice.user?.warehouse?.branch?.name || "غير محدد"}</span></p>
              {invoice.user?.phone != null &&
                <p>تليفون المسؤول: <span className="font-semibold">{invoice.user.phone}</span></p>
              }
              {invoice.maintainance == "1" &&
                <p>
                  {invoice.technicians?.length === 1 ? "الفني" : "الفنيين"}: <span className="font-semibold">
                    {invoice.technicians?.map(tech => tech.name).join("، ") || "غير محدد"}
                  </span>
                </p>
              }
            </div>

          </div>
        </div>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {invoice.customer?.company_name != null &&
              <p><span className="font-semibold">اسم الشركه:</span> {invoice.customer?.company_name}</p>
            }
            {invoice.customer?.name != null &&
              <p><span className="font-semibold">اسم العميل:</span> {invoice.customer?.name}</p>
            }
            {invoice.customer?.phone != null &&
              <p><span className="font-semibold">الهاتف:</span> {invoice.customer?.phone}</p>
            }
            {invoice.customer?.address != null &&
              <p><span className="font-semibold">العنوان:</span> {invoice.customer?.address}</p>
            }
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="thermal-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right thermal-hide">الكود</TableHead>
                  <TableHead className="text-right">اسم الصنف</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">سعر الوحدة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="thermal-hide">{item.product?.item_code}</TableCell>
                    <TableCell>{item.product?.name}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell><NumberDisplay value={item.unit_price} /></TableCell>
                    <TableCell><NumberDisplay value={item.total} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-6">
          {invoice.notes &&
            <div className="thermal-hide">
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{invoice.notes || "لا توجد ملاحظات"}</p>
                </CardContent>
              </Card>
            </div>
          }
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص</CardTitle>
              </CardHeader>
              <CardContent className="summary-section space-y-2 text-sm">
                <div className="flex justify-between"><span>الإجمالي الفرعى :</span> <span>{invoice.subtotal}</span>
                </div>
                {invoice.discount_percentage > 0 &&

                  <>
                    <div className="flex justify-between"><span>قيمة الخصم:</span>
                      <span>{invoice.discount_percentage}%</span>
                    </div>
                    <div className="flex justify-between"><span>بعد الخصم:</span>
                      <span>
                        {(parseFloat(invoice.subtotal.replace(/,/g, '')) || 0) -
                          ((parseFloat(invoice.subtotal.replace(/,/g, '')) || 0) *
                            ((invoice.discount_percentage || 0) / 100))}
                      </span>
                    </div>
                  </>
                }
                {invoice.tax > 0 &&
                  <div className="flex justify-between"><span>الضريبة:</span> <span>{invoice.tax}</span></div>
                }

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>الإجمالي النهائي:</span>
                  <span>{invoice.total_formatted}</span>
                </div>
                {invoice.remaining_amount > 0 &&

                  <><div className="flex justify-between"><span>تم تحصيل:</span>
                    <span>{invoice.collected_amount}</span></div><div className="flex justify-between"><span>المؤجل:</span> <span>{invoice.remaining_amount}</span></div>
                  </>
                }
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thermal: show notes inline at bottom */}
        {invoice.notes && (
          <div className="hidden thermal-notes border-t pt-2 text-xs">
            <span className="font-semibold">ملاحظات: </span>{invoice.notes}
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-gray-500 space-y-1">
          <p>شكراً لتعاملكم معنا</p>
          <p>رافكو للتورديات </p>
        </div>
      </div>
    </>
  )
}
