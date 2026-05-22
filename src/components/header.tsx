'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/write')) return 'Write Chapter';
  if (pathname.startsWith('/content-history')) return 'Chapter History';
  if (pathname === '/style-profile') return 'Writing Style';
  if (pathname === '/books' || pathname === '/dashboard') return 'My Books';
  return 'ChapterCraft';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
