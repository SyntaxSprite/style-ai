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
import { BookMarked, BookOpen, Loader2, PenLine, PlusCircle, Sparkles } from 'lucide-react';

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
          title: 'Could not load dashboard',
          description: 'Please refresh and try again.',
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
      toast({ title: 'Image too large', description: 'Please use an image under 1MB.', variant: 'destructive' });
      return;
    }
    const dataUri = await fileToDataURI(file);
    setNewBook((prev) => ({ ...prev, coverImage: dataUri }));
  };

  const handleAddBook = async () => {
    if (!user) return;
    if (!newBook.title || !newBook.blurb || !newBook.outline) {
      toast({
        title: 'Missing fields',
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
      toast({ title: 'Book created', description: `"${bookData.title}" is ready to write.` });
    } catch {
      toast({ title: 'Could not create book', variant: 'destructive' });
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
      toast({ title: 'Could not update status', variant: 'destructive' });
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="page-section w-full">
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid w-full grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const ongoingCount = books.filter((b) => b.status === 'ongoing').length;
  const completedCount = books.length - ongoingCount;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="page-section w-full max-w-none">
      {/* Welcome */}
      <section className="w-full rounded-xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 shadow-soft sm:p-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {firstName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Manage your books, refine your writing style, and generate chapters that sound like you.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/style-profile">
                <PenLine className="mr-2 h-4 w-4" />
                Writing style
              </Link>
            </Button>
            <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New book
            </Button>
          </div>
        </div>
      </section>

      {!hasStyleProfile && (
        <Card className="w-full border-accent/30 bg-accent/5">
          <CardHeader className="pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent" />
                Set up your writing style
              </CardTitle>
              <CardDescription>
                Upload writing samples so generated chapters match your voice.
              </CardDescription>
            </div>
            <Button asChild className="mt-4 h-11 w-full shrink-0 sm:mt-0 sm:w-auto">
              <Link href="/style-profile">Get started</Link>
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Stats */}
      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total books</CardDescription>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{books.length}</p>
          </CardContent>
        </Card>
        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>In progress</CardDescription>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-primary">{ongoingCount}</p>
          </CardContent>
        </Card>
        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Completed</CardDescription>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{completedCount}</p>
          </CardContent>
        </Card>
      </section>

      {/* Library */}
      <section className="w-full space-y-6">
        <PageHeader title="Your books" description="Open a book to write or view chapter history.">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                New book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a new book</DialogTitle>
                <DialogDescription>Add a title, blurb, and outline for your project.</DialogDescription>
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
                  <Label htmlFor="coverImage">Cover image (optional)</Label>
                  <Input id="coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} />
                </div>
                {newBook.coverImage && (
                  <Image
                    src={newBook.coverImage}
                    alt="Cover preview"
                    width={100}
                    height={150}
                    className="aspect-[2/3] rounded-lg object-cover"
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
          <div className="grid w-full grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} />
            ))}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center sm:py-20">
            <BookMarked className="mb-4 h-14 w-14 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold">No books yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Create your first book to start writing chapters in your style.
            </p>
            <Button className="mt-6 h-11" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first book
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
