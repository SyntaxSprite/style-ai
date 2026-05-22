'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, Loader2, BookImage } from 'lucide-react';
import Image from 'next/image';
import { addBook, updateBookStatus, getBooks, type Book as BookType } from '@/services/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from './ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { BookCard } from '@/components/book-card';

const fileToDataURI = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const INITIAL_BOOK_STATE = { title: '', blurb: '', outline: '', coverImage: '' };

export default function BooksClient() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<BookType[]>([]);
  const [newBook, setNewBook] = useState(INITIAL_BOOK_STATE);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBooks, setIsFetchingBooks] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      getBooks()
        .then(setBooks)
        .catch(() =>
          toast({
            title: 'Error fetching books',
            description: 'Could not load your library.',
            variant: 'destructive',
          })
        )
        .finally(() => setIsFetchingBooks(false));
    } else {
      setIsFetchingBooks(false);
    }
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
    if (!user || !newBook.title || !newBook.blurb || !newBook.outline) {
      toast({ title: 'Missing information', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const bookData = { ...newBook, status: 'ongoing' as const };
      const newBookId = await addBook(bookData);
      setBooks([{ ...bookData, id: newBookId, createdAt: new Date(), userId: user.id }, ...books]);
      setNewBook(INITIAL_BOOK_STATE);
      setIsDialogOpen(false);
      toast({ title: 'Book created!', description: `"${bookData.title}" added.` });
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
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  if (authLoading || isFetchingBooks) {
    return (
      <div className="page-section">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
        <div className="grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <PageHeader
        title="My Books"
        description="Full library — tap a book to write or view chapters."
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
              <DialogDescription>Blueprint for your story.</DialogDescription>
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
        <div className="grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-6 py-16 text-center sm:py-24">
          <BookImage className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold">No books yet</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Create a book to start writing chapters in your style.
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
