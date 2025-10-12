import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid ,Bandage , Users , ArrowLeftRight , Receipt, Store , MapPinned ,Contact, KeySquare, BarChart2} from 'lucide-react';

import AppLogo from './app-logo';
import { NavCollabse } from './nav-collabse.js';
import { can } from '@/utils/permissions';
import { title } from 'process';


export function AppSidebar() {
    
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
                title: "الفواتير",
                url: '/invoices',
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
                <NavCollabse items={CollabseNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
