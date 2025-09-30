'use client';

import BooksClient from "@/components/books-client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function BooksPage() {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <BooksClient />
      </Suspense>
    );
}
