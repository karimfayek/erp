import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ExpCharts(p: any) {
    const { info, daily, byBranch, byCategory } = p;
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-4"><div className="text-sm text-gray-500">إجمالي الفترة</div><div className="text-2xl font-bold">{Number(info?.total ?? 0).toFixed(2)}</div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="text-sm text-gray-500">عدد المصاريف</div><div className="text-2xl font-bold">{info?.count ?? 0}</div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="text-sm text-gray-500">متوسط يومي</div><div className="text-2xl font-bold">{Number(info?.avgDaily ?? 0).toFixed(2)}</div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="text-sm text-gray-500">أكبر مصروف</div><div className="text-2xl font-bold">{Number(info?.maxExpense ?? 0).toFixed(2)}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>المصروف اليومي</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={daily}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="total" /></LineChart>
                </ResponsiveContainer>
            </CardContent></Card>
            <div className="grid md:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>كل فرع صرف كام</CardTitle></CardHeader><CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={byBranch}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="branch" /><YAxis /><Tooltip /><Bar dataKey="total" /></BarChart>
                    </ResponsiveContainer>
                </CardContent></Card>
                <Card><CardHeader><CardTitle>حسب التصنيف</CardTitle></CardHeader><CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={byCategory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="category" /><YAxis /><Tooltip /><Bar dataKey="total" /></BarChart>
                    </ResponsiveContainer>
                </CardContent></Card>
            </div>
        </div>
    );
}
