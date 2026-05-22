'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { EpicTomeCard } from '@/components/epic/epic-tome-card';
import { EpicCorner, EpicFlourish, EpicQuillMark } from '@/components/epic/epic-ornaments';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  addBook,
  getBooks,
  getStyleProfile,
  updateBookStatus,
  type Book,
} from '@/services/data';
import {
  BookMarked,
  Crown,
  Loader2,
  PenLine,
  Plus,
  ScrollText,
  Sparkles,
  Swords,
} from 'lucide-react';

const INITIAL_BOOK_STATE = { title: '', blurb: '', outline: '', coverImage: '' };

const fileToDataURI = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function EpicLoading() {
  return (
    <div className="epic-realm space-y-8 py-6 sm:py-10">
      <Skeleton className="h-48 w-full rounded-sm bg-epic-veil/50 sm:h-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-sm bg-epic-veil/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-96 rounded-sm bg-epic-veil/40" />
        ))}
      </div>
    </div>
  );
}

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [hasStyleProfile, setHasStyleProfile] = useState<boolean | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBook, setNewBook] = useState(INITIAL_BOOK_STATE);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsFetching(false);
      return;
    }
    const load = async () => {
      setIsFetching(true);
      try {
        const [userBooks, profile] = await Promise.all([getBooks(), getStyleProfile()]);
        setBooks(userBooks);
        setHasStyleProfile(!!profile);
      } catch {
        toast({
          title: 'The archives resist…',
          description: 'Could not load your chronicle. Refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [user, authLoading, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewBook((prev) => ({ ...prev, [id]: value }));
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast({ title: 'Portrait too grand', description: 'Keep cover art under 1MB.', variant: 'destructive' });
      return;
    }
    const dataUri = await fileToDataURI(file);
    setNewBook((prev) => ({ ...prev, coverImage: dataUri }));
  };

  const handleAddBook = async () => {
    if (!user) return;
    if (!newBook.title || !newBook.blurb || !newBook.outline) {
      toast({
        title: 'Incomplete inscription',
        description: 'Title, blurb, and outline are required.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const bookData = { ...newBook, status: 'ongoing' as const };
      const newBookId = await addBook(bookData);
      setBooks([{ ...bookData, id: newBookId, createdAt: new Date(), userId: user.id }, ...books]);
      setNewBook(INITIAL_BOOK_STATE);
      setIsDialogOpen(false);
      toast({
        title: 'A new tome is bound!',
        description: `"${bookData.title}" enters your library.`,
      });
    } catch {
      toast({ title: 'Binding failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookId: string, currentStatus: 'ongoing' | 'completed') => {
    const newStatus = currentStatus === 'ongoing' ? 'completed' : 'ongoing';
    try {
      await updateBookStatus(bookId, newStatus);
      setBooks(books.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b)));
    } catch {
      toast({ title: 'Could not alter fate', variant: 'destructive' });
    }
  };

  if (authLoading || isFetching) return <EpicLoading />;

  const ongoingCount = books.filter((b) => b.status === 'ongoing').length;
  const completedCount = books.length - ongoingCount;
  const scribeName = user?.name?.split(' ')[0] || 'Scribe';

  return (
    <div className="epic-realm relative min-h-[calc(100vh-8rem)] space-y-8 py-4 sm:space-y-12 sm:py-8">
      {/* ambient ornaments */}
      <EpicQuillMark className="pointer-events-none absolute right-2 top-8 animate-epic-float opacity-60 sm:right-8" />
      <EpicQuillMark className="pointer-events-none absolute bottom-32 left-2 rotate-180 animate-epic-float opacity-40 [animation-delay:2s] sm:left-8" />
      <EpicCorner className="pointer-events-none absolute left-2 top-2 hidden opacity-50 sm:block" />
      <EpicCorner className="pointer-events-none absolute right-2 top-2 hidden -scale-x-100 opacity-50 sm:block" />

      {/* ── HERO: opening of an epic ── */}
      <section className="epic-hero relative px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="relative z-10 mx-auto max-w-4xl text-center sm:text-left">
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-epic-gold/80 sm:text-xs">
            ✦ The Scriptorium ✦
          </p>
          <h1 className="epic-dropcap mt-4 font-display text-3xl font-bold leading-[1.1] sm:mt-2 sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="epic-gold-text">Hail, {scribeName}</span>
            <span className="mt-2 block font-epic text-xl font-normal italic text-epic-parchment/80 sm:text-2xl md:text-3xl">
              Keeper of Unwritten Legends
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-epic text-base leading-relaxed text-epic-parchment/75 sm:mx-0 sm:text-lg md:text-xl">
            The candle flickers. The quill awaits. Choose your saga, inscribe your style, and let
            whole chapters rise from the void—written in <em>your</em> voice alone.
          </p>
          <EpicFlourish className="mx-auto my-8 sm:mx-0" />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
            <Button asChild className="epic-btn-primary h-12 w-full px-8 sm:w-auto">
              <Link href="/style-profile">
                <PenLine className="mr-2 h-5 w-5" />
                Inscribe Thy Voice
              </Link>
            </Button>
            <Button
              variant="outline"
              className="epic-btn-ghost h-12 w-full border-epic-gold/40 px-8 sm:w-auto"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Bind a New Tome
            </Button>
          </div>
        </div>
        <Crown className="pointer-events-none absolute bottom-6 right-6 hidden h-16 w-16 text-epic-gold/20 lg:block" />
        <Swords className="pointer-events-none absolute bottom-8 left-8 hidden h-14 w-14 text-epic-crimson/25 lg:block" />
      </section>

      {/* ── Prophecy banner (no style profile) ── */}
      {!hasStyleProfile && (
        <div className="epic-scroll-banner relative mx-auto max-w-3xl rounded-sm px-5 py-6 text-center sm:px-8 sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Sparkles className="h-10 w-10 shrink-0 animate-epic-flicker text-epic-gold" />
            <div className="min-w-0 flex-1">
              <h2 className="epic-section-title text-lg text-epic-gold sm:text-xl">
                The Muse Demands an Offering
              </h2>
              <p className="mt-2 font-epic text-base italic leading-relaxed text-epic-parchment/80">
                Before the epic may flow, upload samples of your prose so the ghostwriter learns the
                cadence of your soul.
              </p>
              <Button asChild className="epic-btn-primary mt-4 h-11 w-full sm:w-auto">
                <Link href="/style-profile">Present Thy Manuscripts</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chronicle stats ── */}
      <section className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-3 sm:gap-6">
        <div className="epic-stat px-5 py-6 text-center sm:py-8">
          <BookMarked className="mx-auto mb-3 h-8 w-8 text-epic-gold/70" />
          <p className="epic-section-title text-[0.6rem] text-epic-parchment/50 sm:text-xs">Tomes Bound</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-epic-gold sm:text-5xl">
            {books.length}
          </p>
        </div>
        <div className="epic-stat px-5 py-6 text-center sm:py-8">
          <ScrollText className="mx-auto mb-3 h-8 w-8 text-epic-crimson/80" />
          <p className="epic-section-title text-[0.6rem] text-epic-parchment/50 sm:text-xs">Sagas Unfinished</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-epic-crimson sm:text-5xl">
            {ongoingCount}
          </p>
        </div>
        <div className="epic-stat px-5 py-6 text-center sm:py-8 min-[400px]:col-span-1 col-span-1">
          <Crown className="mx-auto mb-3 h-8 w-8 text-epic-gold/70" />
          <p className="epic-section-title text-[0.6rem] text-epic-parchment/50 sm:text-xs">Legends Concluded</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-epic-parchment sm:text-5xl">
            {completedCount}
          </p>
        </div>
      </section>

      {/* ── Library of tomes ── */}
      <section className="relative space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <EpicFlourish className="mx-auto mb-4 sm:mx-0" />
            <h2 className="epic-section-title text-xl text-epic-gold sm:text-2xl">
              The Hall of Tomes
            </h2>
            <p className="mt-2 font-epic text-base italic text-epic-parchment/60">
              Each volume a world. Each chapter a battle won with words.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="epic-btn-primary h-12 w-full shrink-0 sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Bind New Volume
              </Button>
            </DialogTrigger>
            <DialogContent className="epic-dialog max-h-[90vh] overflow-y-auto border-epic-gold/40 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-epic-gold">
                  Inscribe a New Volume
                </DialogTitle>
                <DialogDescription className="font-epic text-base italic text-epic-parchment/70">
                  Grant thy saga a title, a whisper of plot, and the bones of its outline.
                </DialogDescription>
              </DialogHeader>
              <div className="form-stack py-4">
                <div className="form-field">
                  <Label htmlFor="title" className="font-display text-xs uppercase tracking-widest text-epic-gold">
                    Title of the Saga
                  </Label>
                  <Input
                    id="title"
                    value={newBook.title}
                    onChange={handleInputChange}
                    className="h-11 border-epic-gold/30 bg-epic-veil/50 text-epic-parchment placeholder:text-epic-parchment/40"
                    placeholder="The Fall of Starhaven"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="blurb" className="font-display text-xs uppercase tracking-widest text-epic-gold">
                    The Prologue
                  </Label>
                  <Textarea
                    id="blurb"
                    value={newBook.blurb}
                    onChange={handleInputChange}
                    rows={3}
                    className="border-epic-gold/30 bg-epic-veil/50 text-epic-parchment placeholder:text-epic-parchment/40"
                    placeholder="A kingdom teeters on the edge of twilight…"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="outline" className="font-display text-xs uppercase tracking-widest text-epic-gold">
                    Grand Outline
                  </Label>
                  <Textarea
                    id="outline"
                    value={newBook.outline}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-epic-gold/30 bg-epic-veil/50 text-epic-parchment placeholder:text-epic-parchment/40"
                    placeholder="Act I — The exile. Act II — The reckoning…"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="coverImage" className="font-display text-xs uppercase tracking-widest text-epic-gold">
                    Cover Illumination
                  </Label>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="border-epic-gold/30 bg-epic-veil/50 text-epic-parchment"
                  />
                </div>
                {newBook.coverImage && (
                  <Image
                    src={newBook.coverImage}
                    alt="Cover preview"
                    width={100}
                    height={150}
                    className="aspect-[2/3] rounded-sm border border-epic-gold/40 object-cover"
                  />
                )}
              </div>
              <DialogFooter className="flex-col-reverse gap-2 border-t border-epic-gold/20 pt-4 sm:flex-row">
                <DialogClose asChild>
                  <Button variant="outline" className="epic-btn-ghost border-epic-gold/30">
                    Abandon
                  </Button>
                </DialogClose>
                <Button onClick={handleAddBook} disabled={isLoading} className="epic-btn-primary">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Seal the Binding
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book, index) => (
              <EpicTomeCard
                key={book.id}
                book={book}
                volumeIndex={index}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="epic-hero flex flex-col items-center px-6 py-16 text-center sm:py-24">
            <BookMarked className="mb-6 h-20 w-20 text-epic-gold/40" />
            <h3 className="font-display text-2xl font-bold text-epic-gold sm:text-3xl">
              The Shelves Stand Empty
            </h3>
            <p className="mt-4 max-w-md font-epic text-lg italic leading-relaxed text-epic-parchment/70">
              No saga yet bears your name. Bind your first tome and let the first chapter thunder
              across the page.
            </p>
            <EpicFlourish className="my-8" />
            <Button className="epic-btn-primary h-12 px-10" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Begin the First Legend
            </Button>
          </div>
        )}
      </section>

      <footer className="pb-4 text-center">
        <p className="font-epic text-sm italic text-epic-parchment/40">
          ✦ &ldquo;Every master was once a disaster. Every epic began as a single terrified sentence.&rdquo; ✦
        </p>
      </footer>
    </div>
  );
}
