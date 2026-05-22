'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Edit } from 'lucide-react';
import type { Book } from '@/services/data';

type BookCardProps = {
  book: Book;
  onStatusChange: (bookId: string, status: 'ongoing' | 'completed') => void;
};

export function BookCard({ book, onStatusChange }: BookCardProps) {
  return (
    <article className="app-card group flex flex-col overflow-hidden transition-shadow hover:shadow-card">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary sm:aspect-[2/3]">
        <Image
          src={book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`}
          alt={`Cover for ${book.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <Badge
          variant={book.status === 'completed' ? 'secondary' : 'default'}
          className="absolute right-3 top-3 capitalize shadow-sm"
        >
          {book.status}
        </Badge>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight">{book.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">{book.blurb}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <Button asChild className="h-11 w-full">
          <Link href={`/write?bookId=${book.id}`}>
            <Edit className="mr-2 h-4 w-4 shrink-0" />
            Write Chapter
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-11">
            <Link href={`/content-history?bookId=${book.id}`}>
              <BookOpen className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Chapters</span>
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 w-full">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{book.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge variant={book.status === 'completed' ? 'secondary' : 'default'} className="capitalize">
                    {book.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-4 py-2">
                  <div>
                    <Label className="font-semibold">Blurb</Label>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{book.blurb}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Outline</Label>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{book.outline}</p>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`status-switch-${book.id}`}
                    checked={book.status === 'completed'}
                    onCheckedChange={() => onStatusChange(book.id!, book.status)}
                  />
                  <Label htmlFor={`status-switch-${book.id}`} className="text-sm">
                    Mark as completed
                  </Label>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </article>
  );
}
