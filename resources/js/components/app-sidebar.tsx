import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeDollarSign, BookOpen, Folder, LayoutGrid ,Bandage , Users , ArrowLeftRight , Receipt, Store , MapPinned ,Contact, KeySquare, BarChart2, Cog, BanknoteIcon, FileMinus} from 'lucide-react';

import AppLogo from './app-logo';
import { NavCollabse } from './nav-collabse.js';
import { can } from '@/utils/permissions';

export function AppSidebar() {
   
const user = usePage().props.auth.user;
console.log(user , 'user from sidebar'); 
const mainNavItems: NavItem[] = [
    {
        title: 'داش بورد',
        href: '/dashboard',
        icon: LayoutGrid,
        
    },
    
    can("Branches view") &&  {
        title: 'الفروع',
        href: '/branches',
        icon: MapPinned,
    },
    can('Warehouses view') && {
        title: 'المخازن',
        href: '/warehouses',
        icon: Store,
    },
  can('Products view') &&{
        title: 'المنتجات',
        href: '/products',
        icon: Bandage,
    },
   can('Clients view') &&{
            title: 'العملاء',
            href: '/customers',
            icon: Contact,
        },
   can('Stock transfer') && {
        title: 'نقل المنتجات',
        href: '/inventory-transfers',
        icon: ArrowLeftRight,
    },
].filter(Boolean) as NavItem[];

const maintenanceNavItems: NavItem[] = [
    can('Maintenance sales') &&{
        title: 'عمليه بيع جديدة',
        href: '/maintainance/sales/maintainance',
        icon: BanknoteIcon,
        
    },
    
    can("Maintenance sales") &&  {
        title: 'الفواتير',
        href: '/invoices/maintainance/all',
        icon: Receipt,
    },
  can('Maintenance products') &&{
        title: 'المنتجات والخدمات',
        href: '/maintainance/products/maintainance',
        icon: Bandage,
    },
  can('Maintenance users') &&{
        title: 'الفنيين',
        href: '/maintainance/users/maintainance',
        icon: Users,
    },
    
  can('Maintenance salary') &&{
        title: 'الرواتب',
        href: '/payroll/calc',
        icon: BadgeDollarSign,
    },
     can('Maintenance salary') &&{
        title: 'الخصومات',
        href: '/payroll/deductions',
        icon: FileMinus ,
    },
].filter(Boolean) as NavItem[];
const CollabseNavItemsMaintenance: NavItem[] = [
     can('Maintenance sales')&& {
        title: 'فواتير الصيانه حسب النوع',
        href: '/sales',
        icon: Receipt,
        items :[
           can('Invoices create')&&
            {
                title: "كل الفواتير",
                url: '/invoices/maintainance/all',
              },
              
            {
                title: "فواتير فقط",
                url: '/invoices/maintainance/invoices',
              },
              
            {
                title: "بيان اسعار",
                url: '/invoices/maintainance/quotes',
              },
              
            {
                title: " مسودات",
                url: '/invoices/maintainance/draft',
              },
            {
                title: " تم ارساله للمنظومة",
                url: '/invoices/maintainance/sent',
              },
          
              
        ].filter(Boolean)
    },
]
const CollabseNavItems: NavItem[] = [
       
   can('Invoices view')&& {
        title: 'المبيعات',
        href: '/sales',
        icon: Receipt,
        items :[
           can('Invoices create')&&{
                title: "عمليه بيع جديدة",
                 url: '/sales',
              },
            {
                title: "كل الفواتير",
                url: '/invoices/inv/all',
              },
          
              
        ].filter(Boolean)
    },
       can('Invoices view')&& {
        title: 'الفواتير',
        href: '/sales',
        icon: Receipt,
        items :[
           can('Invoices create')&&
            {
                title: "كل الفواتير",
                url: '/invoices/inv/all',
              },
              
            {
                title: "فواتير فقط",
                url: '/invoices/inv/invoices',
              },
              
            {
                title: "بيان اسعار",
                url: '/invoices/inv/quotes',
              },
              
            {
                title: " مسودات",
                url: '/invoices/inv/draft',
              },
            {
                title: " تم ارساله للمنظومة",
                url: '/invoices/inv/sent',
              },
          
              
        ].filter(Boolean)
    },
 
  
     can('Users view') &&   {
        title: 'المستخدمين و الصلاحيات',
        href: '/roles',
        icon: KeySquare,
        items :[
             can("Users view") && {
            title: "المستخدمين",
            url: "/users",
            icon: Users,
            },
           can("super") &&  {
                title: "الأدوار",
                 url: '/roles',
              },
          can("super") && {
                title: "أدوار المستخدمين",
                url: '/users/roles/set',
              },
           can("super") &&  {
                title: " صلاحيات المستخدمين",
                url: '/access-control',
              },
           
              
        ]
    },
        can('Super Admin') &&   {
        title: 'التقارير',
        href: '/reports',
        //what icon to use for reports

        icon: BarChart2,
        items :[
             can("Reports view") && {
            title: "المبيعات",
            url: "/reports/dashboard",
            icon: Users,
            },
            can("Reports view") && {
            title: "الفواتير",
            url: "/reports/invoices",
            icon: Users,
            },
            can("super") && {
            title: "تسجيل الدخول",
            url: "/user/activity/login",
            icon: Users,
            },
           
              
        ]
    },
].filter(Boolean) as NavItem[];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: '#',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: '#',
        icon: BookOpen,
    },
];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {(!user.maintainance || user.role === 'super-admin') && (

                    <NavCollabse items={CollabseNavItems} />
                )
                
                }

                {can('Maintenance') && 
                <>
                
                <NavMain items={maintenanceNavItems} title="الصيانة" />

                <NavCollabse items={CollabseNavItemsMaintenance} title="فلتر فواتير الصيانة" />
                </>
                }
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
