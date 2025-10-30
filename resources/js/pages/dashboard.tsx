import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { motion } from "motion/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, Store, Warehouse, ArrowLeftRight, ShoppingCart, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { can } from '@/utils/permissions';
import { mn } from 'date-fns/locale';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({stats , dailySales}) {
      const cards = [
    { title: "الفروع", value: stats.branches, icon: Store,hrefs:"/branches" , can:'Branches view' },
    { title: "المخازن", value: stats.warehouses, icon: Warehouse ,hrefs:"/warehouses" ,can:"Warehouses view"},
    { title: "المنتجات", value: stats.products, icon: Package ,hrefs:"/products" ,can:'Products view' , mntnce:'Maintenance products'},
    { title: "نقل اليوم", value: stats.transfers, icon: ArrowLeftRight,hrefs:"/inventory-transfers",can:'Stock transfer'},
    { title: "المبيعات", value: stats.sales, icon: ShoppingCart ,hrefs:"/sales" , can:'admin'},
  ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            { (can(card.can) || (card.mntnce && can(card.mntnce))) &&
            
            <Card className="hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-gray-100 bg-white">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-500">{card.title}</CardTitle>
                <card.icon className="w-6 h-6 text-blue-500" />
              </CardHeader>
              <CardContent className='flex items-center justify-between px-6'>
                 <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                
               <Link href={card.hrefs} className="text-3xl font-bold text-gray-800"><Plus /></Link>
              </CardContent>
            </Card>
            }
          </motion.div>
        ))}
      </div>
      {can('super') &&
       <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800"> المبيعات</h1>
                   <ResponsiveContainer width="100%" height={300}>
                               <LineChart data={dailySales}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="date" />
                                 <YAxis />
                                 <Tooltip />
                                 <Line type="monotone" dataKey="total" stroke="#8884d8" />
                               </LineChart>
                             </ResponsiveContainer>
                </div>
      }
               
            </div>
        </AppLayout>
    );
}
