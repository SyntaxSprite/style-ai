import Link from 'next/link';
import Logo from '@/components/logo';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" aria-hidden />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="relative w-full max-w-md">{children}</div>
      <p className="relative mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} ChapterCraft
      </p>
    </div>
  );
}

export function AuthCardHeader() {
  return (
    <div className="mb-6 text-center">
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg transition-opacity hover:opacity-80"
        aria-label="ChapterCraft Home"
      >
        <Logo />
        <span className="text-xl font-bold text-primary sm:text-2xl">ChapterCraft</span>
      </Link>
    </div>
  );
}
