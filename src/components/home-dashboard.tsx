'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { PageHeader } from '@/components/page-header';
import { BookCard } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  BookImage,
  Loader2,
  PenSquare,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

const INITIAL_BOOK_STATE = { title: '', blurb: '', outline: '', coverImage: '' };

const fileToDataURI = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
          title: 'Error loading dashboard',
          description: 'Could not load your data. Please refresh.',
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
      toast({ title: 'Image too large', description: 'Max 1MB.', variant: 'destructive' });
      return;
    }
    const dataUri = await fileToDataURI(file);
    setNewBook((prev) => ({ ...prev, coverImage: dataUri }));
  };

  const handleAddBook = async () => {
    if (!user) return;
    if (!newBook.title || !newBook.blurb || !newBook.outline) {
      toast({
        title: 'Missing information',
        description: 'Fill in title, blurb, and outline.',
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
      toast({ title: 'Book created!', description: `"${bookData.title}" is ready.` });
    } catch {
      toast({ title: 'Error creating book', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookId: string, currentStatus: 'ongoing' | 'completed') => {
    const newStatus = currentStatus === 'ongoing' ? 'completed' : 'ongoing';
    try {
      await updateBookStatus(bookId, newStatus);
      setBooks(books.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b)));
      toast({ title: 'Status updated', description: `Marked as ${newStatus}.` });
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="page-section">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const ongoingCount = books.filter((b) => b.status === 'ongoing').length;
  const completedCount = books.length - ongoingCount;
  const firstName = user?.name?.split(' ')[0] || 'Writer';

  return (
    <div className="page-section">
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/10 p-6 shadow-soft sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Pick up a book, write a chapter, or refine your AI writing style.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/style-profile">
                <PenSquare className="mr-2 h-4 w-4" />
                Writing Style
              </Link>
            </Button>
            <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Book
            </Button>
          </div>
        </div>
      </section>

      {!hasStyleProfile && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              Set up your writing style
            </CardTitle>
            <CardDescription>
              Upload samples so generated chapters match your voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/style-profile">Complete setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="app-card">
          <CardHeader className="pb-2">
            <CardDescription>Total books</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{books.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="app-card">
          <CardHeader className="pb-2">
            <CardDescription>In progress</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-primary">{ongoingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="app-card">
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <PageHeader
        title="Your library"
        description="Open a book to write or review chapters."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a new book</DialogTitle>
              <DialogDescription>Blueprint for your next story.</DialogDescription>
            </DialogHeader>
            <div className="form-stack py-4">
              <div className="form-field">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newBook.title} onChange={handleInputChange} className="h-11" />
              </div>
              <div className="form-field">
                <Label htmlFor="blurb">Blurb</Label>
                <Textarea id="blurb" value={newBook.blurb} onChange={handleInputChange} rows={3} />
              </div>
              <div className="form-field">
                <Label htmlFor="outline">Outline</Label>
                <Textarea id="outline" value={newBook.outline} onChange={handleInputChange} rows={4} />
              </div>
              <div className="form-field">
                <Label htmlFor="coverImage">Cover image</Label>
                <Input id="coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} />
              </div>
              {newBook.coverImage && (
                <Image
                  src={newBook.coverImage}
                  alt="Cover preview"
                  width={100}
                  height={150}
                  className="aspect-[2/3] rounded-lg object-cover shadow-soft"
                />
              )}
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAddBook} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create book
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-6 py-16 text-center sm:py-24">
          <BookImage className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold">Your library is empty</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Create your first book to start writing chapters with AI that matches your style.
          </p>
          <Button className="mt-6 h-11" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create your first book
          </Button>
        </div>
      )}

    </div>
  );
}
