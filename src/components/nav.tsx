'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Book, PenSquare } from 'lucide-react';

const navItems = [
  { href: '/books', label: 'My Books', icon: Book, match: ['/books', '/dashboard', '/write', '/content-history'] },
  { href: '/style-profile', label: 'Writing Style', icon: PenSquare, match: ['/style-profile'] },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-1 px-2">
      {navItems.map((item) => {
        const isActive = item.match.some((path) => pathname.startsWith(path));
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={{ children: item.label }}
              className="h-11 text-base sm:text-sm"
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
