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
            <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2 pl-2" aria-label="ChapterCraft Dashboard">
                <Logo />
                <span className="font-bold text-lg text-primary">ChapterCraft</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <Nav />
            </SidebarContent>
            <SidebarFooter>
              <UserInfo />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="p-4 lg:p-8 pt-0">
                {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
