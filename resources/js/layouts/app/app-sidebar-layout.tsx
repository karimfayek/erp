import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import {  Toaster  } from "sonner";

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage();
    const successMessage = props.flash?.message;
    const errorMessages = props.errors;
    return (
        <AppShell variant="sidebar">
            <AppSidebar  side="right"/>
            <AppContent variant="sidebar" className="overflow-x-hidden font-cairo" dir="rtl">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {successMessage && (
                        <div className="bg-green-100 text-green-800 border border-green-300 p-2 rounded mt-4 mx-3.5">
                            {successMessage}
                        </div>
                    )}
                {errorMessages.length > 0 && (
                        <div className="bg-green-100 text-green-800 border border-green-300 p-2 rounded mt-4 mx-3.5">
                            <ul>
                                {errorMessages.map(
                                    (err) =>(
                                        <li>{err}</li>
                                    )
                            
                                )}
                            </ul>
                        </div>
                    )}
                     {Object.entries(errorMessages).length > 0 && (
                        <div className="bg-red-100 text-red-800 border border-red-300 p-2 rounded mt-4 mx-3.5">
                           
                           {Object.entries(errorMessages).map(([field, message]) => (
                            <div key={field}>
                                    {field}: {message}
                                </div>
                                ))}
                        </div>
                    )}
                    {props.errors.message && (
                        <div className="bg-red-100 text-green-800 border text-center p-2 rounded mt-4 mx-3.5">
                            {props.errors?.message}
                        </div>
                    )}
                {children}
                <Toaster />
            </AppContent>
        </AppShell>
    );
}
