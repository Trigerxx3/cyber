import { SidebarProvider, Sidebar, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
