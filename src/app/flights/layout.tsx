import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export default async function FlightsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen min-h-0">
            <Header />
            <main className="flex-1 min-h-0 flex flex-col">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
