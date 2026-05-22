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
import { BookOpen, Feather, Scroll } from 'lucide-react';
import type { Book } from '@/services/data';

type EpicTomeCardProps = {
  book: Book;
  volumeIndex: number;
  onStatusChange: (bookId: string, status: 'ongoing' | 'completed') => void;
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function EpicTomeCard({ book, volumeIndex, onStatusChange }: EpicTomeCardProps) {
  const volume = ROMAN[volumeIndex] ?? String(volumeIndex + 1);
  const isComplete = book.status === 'completed';

  return (
    <article className="epic-tome group relative flex flex-col">
      <div className="epic-tome-frame relative">
        <span className="epic-tome-volume">Vol. {volume}</span>
        <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[2/3]">
          <Image
            src={book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`}
            alt={`Tome: ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(28_40%_4%/0.95)] via-[hsl(28_30%_8%/0.5)] to-[hsl(42_50%_30%/0.15)]" />
          <div className="epic-tome-spine" aria-hidden />
          <Badge
            className={`absolute right-3 top-3 border font-epic text-xs uppercase tracking-widest ${
              isComplete
                ? 'border-epic-gold/50 bg-epic-gold/20 text-epic-gold'
                : 'border-epic-crimson/50 bg-epic-crimson/30 text-epic-parchment'
            }`}
          >
            {isComplete ? 'Concluded' : 'Inscribed'}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
          <h3 className="font-display text-lg font-bold leading-tight text-epic-parchment sm:text-xl">
            {book.title}
          </h3>
          <p className="mt-2 line-clamp-2 font-epic text-sm italic text-epic-parchment/75">
            {book.blurb}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-1">
        <Button
          asChild
          className="epic-btn-primary h-12 w-full font-display text-sm uppercase tracking-wider"
        >
          <Link href={`/write?bookId=${book.id}`}>
            <Feather className="mr-2 h-4 w-4" />
            Pen a Chapter
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            asChild
            variant="outline"
            className="epic-btn-ghost h-11 border-epic-gold/30 font-epic text-xs uppercase tracking-wide"
          >
            <Link href={`/content-history?bookId=${book.id}`}>
              <Scroll className="mr-1.5 h-4 w-4 shrink-0" />
              <span className="truncate">Annals</span>
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="epic-btn-ghost h-11 w-full border-epic-gold/30 font-epic text-xs uppercase tracking-wide"
              >
                <BookOpen className="mr-1.5 h-4 w-4" />
                Lore
              </Button>
            </DialogTrigger>
            <DialogContent className="epic-dialog max-h-[90vh] overflow-y-auto border-epic-gold/30 sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-epic-gold">{book.title}</DialogTitle>
                <DialogDescription className="font-epic italic text-epic-parchment/70">
                  The codex opens…
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-6 py-2 font-epic">
                  <div>
                    <Label className="font-display text-sm uppercase tracking-widest text-epic-gold">
                      Prologue
                    </Label>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-epic-parchment/85">
                      {book.blurb}
                    </p>
                  </div>
                  <div>
                    <Label className="font-display text-sm uppercase tracking-widest text-epic-gold">
                      The Grand Outline
                    </Label>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-epic-parchment/85">
                      {book.outline}
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="border-t border-epic-gold/20 pt-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id={`epic-status-${book.id}`}
                    checked={isComplete}
                    onCheckedChange={() => onStatusChange(book.id!, book.status)}
                  />
                  <Label htmlFor={`epic-status-${book.id}`} className="font-epic text-sm text-epic-parchment/80">
                    Mark saga concluded
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
