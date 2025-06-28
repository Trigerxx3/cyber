"use client";

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Search, Users, FileText, Bell } from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/dashboard/content-analysis', icon: <Search />, label: 'Content Analysis' },
    { href: '/dashboard/user-investigation', icon: <Users />, label: 'User Investigation' },
    { href: '/dashboard/reports', icon: <FileText />, label: 'Reports' },
    { href: '/dashboard/alerts', icon: <Bell />, label: 'Alerts' },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton href={item.href} isActive={pathname === item.href} tooltip={item.label}>
                        {item.icon}
                        {item.label}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
