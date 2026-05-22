'use client';

import HomeDashboard from '@/components/home-dashboard';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HomeDashboard />
    </Suspense>
  );
}
