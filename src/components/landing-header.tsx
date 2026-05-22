'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/logo';
import { Menu } from 'lucide-react';

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="page-container flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="ChapterCraft Home">
          <Logo />
          <span className="truncate text-lg font-bold text-primary sm:text-2xl">ChapterCraft</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full justify-center" onClick={() => setOpen(false)}>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="w-full justify-center" onClick={() => setOpen(false)}>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
