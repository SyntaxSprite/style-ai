'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'The Scriptorium';
  if (pathname.startsWith('/write')) return 'Write Chapter';
  if (pathname.startsWith('/content-history')) return 'Chapter History';
  if (pathname === '/style-profile') return 'Writing Style';
  if (pathname === '/books') return 'My Books';
  return 'ChapterCraft';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const isEpicRealm = pathname === '/dashboard';

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-md sm:h-16 sm:gap-4 sm:px-6 lg:px-8',
        isEpicRealm
          ? 'border-epic-gold/20 bg-[hsl(28_35%_6%/0.92)] text-epic-parchment supports-[backdrop-filter]:bg-[hsl(28_35%_6%/0.85)]'
          : 'border-border/60 bg-background/90 supports-[backdrop-filter]:bg-background/80'
      )}
    >
      <SidebarTrigger
        className={cn('touch-target md:hidden', isEpicRealm && 'text-epic-gold hover:bg-epic-gold/10')}
      />
      <h1
        className={cn(
          'min-w-0 flex-1 truncate tracking-tight',
          isEpicRealm
            ? 'font-display text-base uppercase tracking-[0.2em] text-epic-gold sm:text-lg'
            : 'text-lg font-semibold sm:text-xl'
        )}
      >
        {title}
      </h1>
    </header>
  );
}
