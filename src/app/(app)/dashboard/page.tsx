'use client';

import HomeDashboard from '@/components/home-dashboard';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function EpicPageFallback() {
  return (
    <div className="epic-realm flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20">
      <Loader2 className="h-12 w-12 animate-spin text-epic-gold" />
      <p className="font-epic text-lg italic text-epic-parchment/60">Unrolling the chronicle…</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<EpicPageFallback />}>
      <HomeDashboard />
    </Suspense>
  );
}
