import AuthProvider from '@/components/auth-provider';
import Header from '@/components/header';
import Logo from '@/components/logo';
import Nav from '@/components/nav';
import UserInfo from '@/components/user-info';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border/60">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-opacity hover:opacity-80"
                aria-label="ChapterCraft Dashboard"
              >
                <Logo />
                <span className="truncate text-lg font-bold text-primary">ChapterCraft</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <Nav />
            </SidebarContent>
            <SidebarFooter>
              <UserInfo />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="min-w-0">
            <Header />
            <main className="page-container safe-bottom pb-6 pt-4 sm:pb-8 sm:pt-6 lg:pb-10">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
