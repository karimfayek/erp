import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid ,Bandage , Users , ArrowLeftRight , Receipt, Store , MapPinned ,Contact} from 'lucide-react';

import AppLogo from './app-logo';
import { NavCollabse } from './nav-collabse.js';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        
    },
     {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Branches',
        href: '/branches',
        icon: MapPinned,
    },
    {
        title: 'Warehouses',
        href: '/warehouses',
        icon: Store,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Bandage,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Contact,
    },
    {
        title: 'Transfer',
        href: '/inventory-transfers',
        icon: ArrowLeftRight,
    },
];
const CollabseNavItems: NavItem[] = [
    
    
    {
        title: 'Sales',
        href: '/sales',
        icon: Receipt,
        items :[
            {
                title: "New Sales Order",
                 url: '/sales',
              },
            {
                title: "Invoices",
                url: '/invoices',
              },
              
        ]
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
