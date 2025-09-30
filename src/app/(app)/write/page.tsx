'use client';

import DashboardClient from '@/components/dashboard-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
