'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Book, LayoutDashboard, PenSquare } from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: ['/dashboard'],
  },
  {
    href: '/books',
    label: 'My Books',
    icon: Book,
    match: ['/books'],
  },
  {
    href: '/style-profile',
    label: 'Writing Style',
    icon: PenSquare,
    match: ['/style-profile'],
  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-1 px-2 py-2">
      {navItems.map((item) => {
        const isActive = item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
        const isWriteActive =
          item.href === '/books' &&
          (pathname.startsWith('/write') || pathname.startsWith('/content-history'));

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive || isWriteActive}
              tooltip={{ children: item.label }}
              className="h-11"
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
