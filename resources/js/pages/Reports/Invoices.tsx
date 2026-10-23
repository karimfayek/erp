import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";// لو عندك جدول جاهز
import { Calendar } from "@/components/ui/calendar";
import { Filter, Search, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import AppLayout from "@/layouts/app-layout";
import { Link, router } from "@inertiajs/react";
import { can } from "@/utils/permissions";

export default function InvoiceReports({ invoices, reps, branches, customers, info }) {
    console.log(invoices, 'inv')
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startHandler = router.on('start', () => setLoading(true));
        const finishHandler = router.on('finish', () => setLoading(false));
        return () => {
            startHandler();
            finishHandler();
        };
    }, []);

    const [filters, setFilters] = useState({
        delivery: "",
        collection: "",
        rep: "",
        invoice_q: "",
        branch: "",
        search: "",
        customer: "",
        from_date: "",
        to_date: "",
    });
    const resetFilter = () => {
        setFilters({
            delivery: "",
            collection: "",
            rep: "all",
            invoice_q: "all",
            branch: "all",
            search: "",
            customer: "all",
            from_date: "",
            to_date: "",
        })
        router.get(route("reports.invoices"), {
            delivery: "",
            collection: "",
            invoice_q: "",
            rep: "all",
            branch: "all",
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
                        <Select onValueChange={(val) => handleFilterChange("delivery", val)} value={filters.delivery}>
                            <SelectTrigger>
                                <SelectValue placeholder="حالة التسليم" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'التسليم -الكل  '}</SelectItem>
                                <SelectItem value="delivered">تم التسليم</SelectItem>
                                <SelectItem value="pending">لم يتم التسليم</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(val) => handleFilterChange("collection", val)} value={filters.collection}>
                            <SelectTrigger>
                                <SelectValue placeholder="حالة التحصيل" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'التحصيل - الكل'}</SelectItem>
                                <SelectItem value="collected">تم التحصيل بالكامل</SelectItem>
                                <SelectItem value="partial">تحصيل جزئى  </SelectItem>
                                <SelectItem value="uncollected"> غير محصل نهائيا  </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(val) => handleFilterChange("invoice_q", val)} value={filters.invoice_q}>
                            <SelectTrigger>
                                <SelectValue placeholder=" فاتورة/ بيان" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                <SelectItem value="1">فاتورة </SelectItem>
                                <SelectItem value="0">  بيان</SelectItem>
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

                        <Select onValueChange={(val) => handleFilterChange("branch", val)} value={filters.branch}>
                            <SelectTrigger>
                                <SelectValue placeholder="الفرع" />
                            </SelectTrigger>
                            <SelectContent>
                                {can('bypass') && (
                                    <SelectItem value={'all'}>{'الكل'}</SelectItem>
                                )}
                                {branches.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 " />
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
                            className="bg-primary"
                            disabled={loading}
                            onClick={() => {
                                router.get(route("reports.invoices"), filters, { preserveState: true });
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جارى المعالجة...
                                </>
                            ) : (
                                "تطبيق الفلاتر"
                            )}
                        </Button>
                        <Button
                            className="bg-red-600 "
                            onClick={() => resetFilter()}
                        >
                            اعادة الفلاتر
                        </Button>
                    </CardContent>
                </Card>

                {/* ✅ جدول الفواتير */}
                <Card className="shadow-sm border border-gray-200 relative">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">قائمة الفواتير</CardTitle>
                    </CardHeader>
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground font-medium">جارى تحميل البيانات...</span>
                        </div>
                    )}
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm ">
                                <thead className="bg-gray-100 text-gray-900">
                                    <tr>
                                        <th className="p-2 text-right">#</th>
                                        <th className="p-2 text-right">العميل</th>
                                        <th className="p-2 text-right">التاريخ</th>
                                        <th className="p-2 text-right">المندوب</th>
                                        <th className="p-2 text-right">المبلغ</th>
                                        <th className="p-2 text-right">ض 14%</th>
                                        <th className="p-2 text-right">ض اخرى</th>
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
                                        <tr key={invoice.id} className="border-b hover:bg-gray-20">
                                            <td className="p-2">{invoice.invoice_number}</td>
                                            <td className="p-2">
                                                {can('Clients edit') && invoice.customer ?
                                                    <Link href={route("customers.edit", invoice.customer?.id)} className="text-blue-500 hover:underline">
                                                        {invoice.customer?.company_name || invoice.customer?.name}
                                                    </Link>
                                                    :
                                                    <span className="text-gray-600">{invoice.customer?.company_name || invoice.customer?.name}</span>
                                                }
                                            </td>
                                            <td className="p-2"> {new Date(invoice.date).toLocaleDateString("ar-EG")}</td>
                                            <td className="p-2">{invoice.user?.name}</td>
                                            <td className="p-2">{invoice.total_formatted} ج.م</td>
                                            <td className="p-2">{invoice.tax} ج.م</td>
                                            <td className="p-2">{invoice.other_tax_val} ج.م</td>
                                            <td className="p-2">{invoice.expenses || 0}</td>
                                            <td className="p-2">
                                                {invoice.is_delivered ?
                                                    <Badge className="bg-green-100 text-green-700 overflow-hidden">تم </Badge>
                                                    :
                                                    <Badge className="bg-red-100 text-red-700 overflow-hidden"> لا</Badge>
                                                }
                                            </td>
                                            <td className="p-2">
                                                {Number(invoice.remaining_amount) < 1 ?
                                                    <Badge className="bg-green-100 text-green-700 overflow-hidden">تم </Badge>
                                                    :
                                                    <Badge className="bg-red-100 text-red-700 overflow-hidden"> جزئى</Badge>
                                                }
                                            </td>
                                            <td className="p-2">
                                                {invoice.collected_amount}
                                            </td>
                                            <td className="p-2">
                                                {Number(invoice.remaining_amount).toFixed(2)
                                                }
                                            </td>
                                            <td className="p-2">
                                                <Button variant="outline" size="sm">
                                                    <Link href={"/invoice/" + invoice?.id}>
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
                        <p className="text-xs text-muted-foreground leading-6">نتائج الفواتير المفلترة</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 1. الملخص العام */}
                        <section className="space-y-3">
                            <h3 className="text-base font-bold">الملخص العام</h3>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                {[
                                    {
                                        label: "عدد الفواتير المفلترة",
                                        value: invoices?.total,
                                    },
                                    {
                                        label: "إجمالي كل الفواتير",
                                        value: Number(info?.invoicesTotals ?? 0).toFixed(2),
                                    },
                                    {
                                        label: "إجمالي المبالغ المحصلة",
                                        value: info?.collected,
                                    },
                                    {
                                        label: "إجمالي المبلغ المؤجل",
                                        value: Number(info?.postponed ?? 0).toFixed(2),
                                    },
                                    {
                                        label: "إجمالي المصاريف",
                                        value: info?.expenses,
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex min-w-0 flex-col justify-center gap-2 rounded-lg border bg-muted/30 p-3 min-h-[100px]"
                                    >
                                        <b className="text-sm leading-6 text-muted-foreground">
                                            {item.label}
                                        </b>
                                        <p className="text-xl font-bold break-words" dir="ltr">
                                            {item.value ?? 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 2. ضرائب القيمة المضافة 14% */}
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-base font-bold">ضرائب القيمة المضافة 14%</h3>
                                <p className="text-sm text-muted-foreground">
                                    توزيع الضريبة حسب حالة تحصيل الفواتير
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    {
                                        label: "إجمالي ضرائب 14%",
                                        hint: "كل الفواتير",
                                        value: info?.taxAmount,
                                    },
                                    {
                                        label: "ضرائب 14% المحصلة",
                                        hint: "الفواتير المحصلة بالكامل",
                                        value: info?.vat14Collected,
                                    },
                                    {
                                        label: "ضرائب 14% المعلقة",
                                        hint: "الفواتير غير المحصلة أو المحصلة جزئيًا",
                                        value: info?.vat14Pending,
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex min-w-0 flex-col justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4 min-h-[110px] dark:border-blue-900 dark:bg-blue-950/20"
                                    >
                                        <b className="text-sm leading-6 text-muted-foreground">
                                            {item.label}
                                        </b>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            {item.hint}
                                        </p>
                                        <p className="text-xl font-bold break-words" dir="ltr">
                                            {item.value ?? 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. الضرائب الأخرى */}
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-base font-bold">الضرائب الأخرى</h3>
                                <p className="text-sm text-muted-foreground">
                                    إجمالي الضرائب الأخرى وتفاصيلها حسب حالة التحصيل
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    {
                                        label: "إجمالي الضرائب الأخرى",
                                        hint: "كل الفواتير",
                                        value: info?.OtherTaxAmount,
                                    },
                                    {
                                        label: "ضرائب أخرى 1%",
                                        hint: "الفواتير المحصلة بالكامل",
                                        value: info?.otherTax1Collected,
                                    },
                                    {
                                        label: "ضرائب أخرى 3%",
                                        hint: "الفواتير المحصلة بالكامل",
                                        value: info?.otherTax3Collected,
                                    },
                                    {
                                        label: "ضرائب أخرى 1%",
                                        hint: "الفواتير غير المحصلة أو المحصلة جزئيًا",
                                        value: info?.otherTax1Pending,
                                    },
                                    {
                                        label: "ضرائب أخرى 3%",
                                        hint: "الفواتير غير المحصلة أو المحصلة جزئيًا",
                                        value: info?.otherTax3Pending,
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex min-w-0 flex-col justify-center gap-2 rounded-lg border bg-muted/30 p-4 min-h-[110px]"
                                    >
                                        <b className="text-sm leading-6 text-muted-foreground">
                                            {item.label}
                                        </b>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            {item.hint}
                                        </p>
                                        <p className="text-xl font-bold break-words" dir="ltr">
                                            {item.value ?? 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. صافي الضرائب */}
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-base font-bold">صافي الضرائب</h3>
                                <p className="text-sm text-muted-foreground">
                                    صافي الضرائب حسب حالة تحصيل الفواتير
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                                {[
                                    {
                                        label: "صافي الضرائب المحصلة",
                                        hint: "الفواتير المحصلة بالكامل",
                                        value: info?.netTaxCollected,
                                    },
                                    {
                                        label: "صافي الضرائب المعلقة",
                                        hint: "الفواتير غير المحصلة أو المحصلة جزئيًا",
                                        value: info?.netTaxPending,
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex min-w-0 flex-col justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 min-h-[110px] dark:border-emerald-900 dark:bg-emerald-950/20"
                                    >
                                        <b className="text-sm leading-6 text-muted-foreground">
                                            {item.label}
                                        </b>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            {item.hint}
                                        </p>
                                        <p className="text-xl font-bold break-words" dir="ltr">
                                            {item.value ?? 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </CardContent>

                </Card>
                <div className="flex justify-center gap-2 pt-4 flex-wrap">
                    {invoices.links.map((link, index) => (
                        <Button
                            key={index}
                            variant={link.active ? "default" : "outline"}
                            disabled={!link.url}
                            onClick={() => handlePageChange(link.url)}
                            className={`min-w-[40px] ${link.active ? "bg-primary " : ""
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
