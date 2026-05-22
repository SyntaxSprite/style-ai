'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Logo from '@/components/logo';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="page-container flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="ChapterCraft Home">
          <Logo />
          <span className="truncate text-lg font-bold text-primary sm:text-2xl">ChapterCraft</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 sm:flex" aria-label="Main navigation">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>

        {/* Mobile navigation — wrapper ensures trigger stays in flex layout */}
        <div className="flex shrink-0 items-center sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="touch-target"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="landing-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              id="landing-mobile-menu"
              side="right"
              className="z-[100] w-[min(100vw-2rem,20rem)]"
            >
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Log in or create a ChapterCraft account
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-3" aria-label="Mobile navigation">
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'h-11 w-full justify-center'
                    )}
                  >
                    Log In
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/signup"
                    className={cn(buttonVariants(), 'h-11 w-full justify-center')}
                  >
                    Sign Up
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
