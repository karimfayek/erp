// resources/js/Pages/Reports/Dashboard.jsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useForm } from "@inertiajs/react"

export default function Branch({ totalSales, dailySales, latestInvoices, filters,branch , userSales}) {
  const { data, setData, get } = useForm({
    start: filters.start,
    end: filters.end,
  })

  const submit = (e) => {
    e.preventDefault()
    get(route("reports.branch" , branch.id), { preserveState: true })
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* فلتر التاريخ */}
      <h2 className="text-2xl text-center">
        تقرير مبيعات ل
        {branch.name}
      </h2>
      <hr />
      <form onSubmit={submit} className="flex items-center gap-4">
        <div>
          <label className="text-sm">من</label>
          <input
            type="date"
            value={data.start}
            onChange={(e) => setData("start", e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="text-sm">إلى</label>
          <input
            type="date"
            value={data.end}
            onChange={(e) => setData("end", e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <Button type="submit">عرض</Button>
      </form>

      {/* الكروت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold">إجمالي المبيعات</h2>
            <p className="text-2xl font-semibold">{totalSales} ج.م</p>
          </CardContent>
        </Card>
      </div>

      {/* شارت المبيعات اليومية */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">المبيعات اليومية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
 <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">مبيعات مستخدمين   
            {" "}  
            {branch.name}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
     

      {/* آخر الفواتير */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">آخر ال فواتير
            ل
            {branch.name}
          </h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">العميل</th>
                <th className="p-2 border">المبلغ</th>
                <th className="p-2 border">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {latestInvoices.map((inv) => (
                <tr key={inv.id}>
                 <td className="p-2 border">{inv.is_invoice? 'فاتورة' : 'بيان'}{'- '} {inv.invoice_number}</td>
                  <td className="p-2 border">{inv.customer?.name || "-"}</td>
                  <td className="p-2 border">{inv.subtotal}</td>
                    <td className="p-2 border">{new Date(inv.created_at).toLocaleString("ar-EG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
