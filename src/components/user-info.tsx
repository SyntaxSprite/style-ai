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
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage
          src={user?.image ?? `https://avatar.vercel.sh/${user?.email}.png`}
          alt=""
        />
        <AvatarFallback className="text-xs">
          {user?.name?.[0] || user?.email?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {user?.name || 'User'}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="touch-target shrink-0"
        onClick={handleLogout}
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
