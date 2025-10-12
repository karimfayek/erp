import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";// لو عندك جدول جاهز
import { Calendar } from "@/components/ui/calendar";
import { Filter, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import AppLayout from "@/layouts/app-layout";
import { Link, router } from "@inertiajs/react";

export default function InvoiceReports({ invoices, reps, products, customers ,info }) {
    console.log(invoices, 'inv')
    const [filters, setFilters] = useState({
        status: "",
        rep: "",
        product: "",
        search: "",
        customer: "",
        from_date: "",
        to_date: "",
    });
const resetFilter = ()=>{
    setFilters({
         status: "",
        rep: "all",
        product: "all",
        search: "",
        customer: "all",
        from_date: "",
        to_date: "",
    })
    router.get(route("reports.invoices"), {
         status: "",
        rep: "all",
        product: "all",
        search: "",
        customer: "all",
        from_date: "",
        to_date: "",
    }, { preserveState: true })
}
    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };
  const handlePageChange = (url) => {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
  };
    return (
        <AppLayout>
            <div className="p-6 space-y-6" >
                {/* ✅ شريط الفلاتر */}
                <Card className="shadow-sm border border-gray-200">
                    <CardHeader className="pb-2 flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            فلاتر التقارير
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <Select onValueChange={(val) => handleFilterChange("status", val)} value={filters.status}>
                            <SelectTrigger>
                                <SelectValue placeholder="حالة الفاتورة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                <SelectItem value="delivered">تم التسليم</SelectItem>
                                <SelectItem value="pending">لم يتم التسليم</SelectItem>
                                <SelectItem value="partial">تحصيل جزئي</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => handleFilterChange("rep", val)} value={filters.rep}>
                            <SelectTrigger>
                                <SelectValue placeholder="المندوب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                {reps.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(val) => handleFilterChange("customer", val)} value={filters.customer}>
                            <SelectTrigger>
                                <SelectValue placeholder="العميل" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => handleFilterChange("product", val)} value={filters.product}>
                            <SelectTrigger>
                                <SelectValue placeholder="المنتج" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="بحث عن عميل أو رقم فاتورة"
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                            />
                        </div>
<div className="flex gap-2 col-span-3">
<Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      className="w-[200px] justify-start text-left font-normal"
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {filters.from_date
        ? format(new Date(filters.from_date), "yyyy-MM-dd")
        : "من تاريخ"}
    </Button>
  </PopoverTrigger>
  <PopoverContent
    className="w-auto p-0"
    align="start"
    sideOffset={8}
  >
    <Calendar
     className="rounded-md border shadow-lg w-[300px]"
      mode="single"
      selected={filters.from_date ? new Date(filters.from_date) : undefined}
      onSelect={(date) => handleFilterChange("from_date", format(date, "yyyy-MM-dd"))}
    />
  </PopoverContent>
</Popover>

<Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      className="w-[200px] justify-start text-left font-normal"
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {filters.to_date
        ? format(new Date(filters.to_date), "yyyy-MM-dd")
        : "إلى تاريخ"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
     className="rounded-md border shadow-lg w-[300px]"
      mode="single"
      selected={filters.to_date ? new Date(filters.to_date) : undefined}
      onSelect={(date) => handleFilterChange("to_date", format(date, "yyyy-MM-dd"))}
    />
  </PopoverContent>
</Popover>
</div>
                        <Button
                            className="bg-primary text-white"
                            onClick={() => {
                                router.get(route("reports.invoices"), filters, { preserveState: true });
                            }}
                        >
                            تطبيق الفلاتر
                        </Button>
                         <Button
                            className="bg-red-600 text-white"
                            onClick={() => resetFilter()}
                        >
                          اعادة الفلاتر
                        </Button>
                    </CardContent>
                </Card>

                {/* ✅ جدول الفواتير */}
                <Card className="shadow-sm border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">قائمة الفواتير</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-gray-100 text-gray-900">
                                    <tr>
                                        <th className="p-2 text-right">#</th>
                                        <th className="p-2 text-right">العميل</th>
                                        <th className="p-2 text-right">التاريخ</th>
                                        <th className="p-2 text-right">المندوب</th>
                                        <th className="p-2 text-right">المبلغ</th>
                                        <th className="p-2 text-right">المصاريف</th>
                                        <th className="p-2 text-right">التسليم</th>
                                        <th className="p-2 text-right">التحصيل</th>
                                        <th className="p-2 text-right">محصل</th>
                                        <th className="p-2 text-right">مؤجل</th>
                                        <th className="p-2 text-right">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.data.map((invoice, i) => (
                                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{invoice.invoice_number}</td>
                                            <td className="p-2">{invoice.customer.name}</td>
                                            <td className="p-2"> {new Date(invoice.date).toLocaleDateString("ar-EG")}</td>
                                            <td className="p-2">{invoice.user?.name}</td>
                                            <td className="p-2">{invoice.total_formatted} ج.م</td>
                                            <td className="p-2">{invoice.expenses || 0}</td>
                                            <td className="p-2">
                                                {invoice.is_delivered ?
                                                    <Badge className="bg-green-100 text-green-700">تم التسليم</Badge>
                                                    :
                                                    <Badge className="bg-red-100 text-red-700"> لا</Badge>
                                                }
                                            </td>
                                            <td className="p-2">
                                                {invoice.collected_number >= invoice.total ?
                                                    <Badge className="bg-green-100 text-green-700">تم </Badge>
                                                    :
                                                    <Badge className="bg-red-100 text-red-700"> جزئى</Badge>
                                                }
                                            </td>
                                              <td className="p-2">
                                                { invoice.collected  }
                                            </td>
                                             <td className="p-2">
                                                {Number(invoice.postponed).toFixed(2)
                                                      }
                                            </td>
                                            <td className="p-2">
                                                <Button variant="outline" size="sm">
                                                    <Link href={"/invoice/" + invoice.id}>
                                                    عرض الفاتورة
                                                    </Link>
                                                    
                                                </Button>
                                                
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            <Card>
                <CardHeader>
                        <CardTitle className="text-lg font-semibold"> معلومات</CardTitle>
                    </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                            <div className="flex flex-col">
                                <b>عدد الفواتير المفلترة</b>
                                <p>{invoices?.total}</p>
                            </div>
                            <div className="flex flex-col">
                                <b>  اجمالى المبلغ للفواتير</b>
                                <p>{info?.invoicesTotals}</p>
                            </div>
                            <div className="flex flex-col">
                            <b>  اجمالى المبلغ المحصل</b>
                            <p>{info?.collected}</p>
                        </div>
                         <div className="flex flex-col">
                            <b>  اجمالى المبلغ المؤجل</b>
                            <p>{info?.postponed}</p>
                        </div>
                         <div className="flex flex-col">
                            <b>  اجمالى  المصاريف</b>
                            <p>{info?.expenses}</p>
                        </div>

                    </div>

                </CardContent>
            </Card>
            <div className="flex justify-center gap-2 pt-4 flex-wrap">
        {invoices.links.map((link, index) => (
          <Button
            key={index}
            variant={link.active ? "default" : "outline"}
            disabled={!link.url}
            onClick={() => handlePageChange(link.url)}
            className={`min-w-[40px] ${
              link.active ? "bg-primary text-white" : ""
            }`}
          >
            {link.label
              .replace("&laquo;", "«")
              .replace("&raquo;", "»")
              .replace("&nbsp;", "")}
          </Button>
        ))}
      </div>
    </div>
        </AppLayout>
    );
}
