'use client';

import ContentHistoryClient from "@/components/content-history-client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ContentHistoryPage() {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <ContentHistoryClient />
      </Suspense>
    );
}
