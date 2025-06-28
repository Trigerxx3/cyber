import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Link href="/">
                        <Logo />
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <DashboardNav />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/dashboard/settings" tooltip="Settings">
                                <Settings />
                                Settings
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <SidebarMenuButton href="/" tooltip="Log Out">
                                <LogOut />
                                Log Out
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
