import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Providers from '@/components/providers';

const FAVICON_YELLOW = '#eab308'; // tailwind yellow-500
const featherIconCdn = `https://api.iconify.design/lucide/feather.svg?color=${encodeURIComponent(FAVICON_YELLOW)}`;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'ChapterCraft - Your Personalized Story Writing Assistant',
  description: 'Generate story chapters in your unique writing style.',
  icons: {
    icon: [
      { url: featherIconCdn, type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: featherIconCdn, type: 'image/svg+xml' }],
    shortcut: featherIconCdn,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
