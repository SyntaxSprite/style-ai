'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/write')) return 'Write';
  if (pathname.startsWith('/content-history')) return 'Chapters';
  if (pathname === '/style-profile') return 'Writing Style';
  if (pathname === '/books') return 'My Books';
  return 'ChapterCraft';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
      <SidebarTrigger className="touch-target md:hidden" />
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h1>
    </header>
  );
}
