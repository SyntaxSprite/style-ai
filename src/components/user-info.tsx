'use client';

import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserInfo() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
        <div className="flex items-center gap-3 p-2 border-t">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8" />
        </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2 border-t">
      <Avatar className="h-9 w-9">
         <AvatarImage src={user?.image ?? `https://avatar.vercel.sh/${user?.email}.png`} data-ai-hint="avatar" alt="User Avatar" />
         <AvatarFallback>{user?.name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
         <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
         <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0" onClick={handleLogout}>
         <LogOut className="w-4 h-4" />
         <span className="sr-only">Log out</span>
      </Button>
   </div>
  );
}
