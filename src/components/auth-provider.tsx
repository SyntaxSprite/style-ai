'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const AUTH_ROUTES = ['/login', '/signup'];
const PUBLIC_ROUTES = ['/', ...AUTH_ROUTES];

function AuthGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const loading = status === 'loading';
  const user = session?.user ?? null;

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user && isAuthRoute) {
      router.push('/dashboard');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
