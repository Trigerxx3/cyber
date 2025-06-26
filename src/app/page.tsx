import { SidebarProvider, Sidebar, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { Dashboard } from "@/components/dashboard";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <Dashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
