'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PlusCircle, Edit, Loader2, BookImage, BookOpen, Upload } from 'lucide-react';
import Link from 'next/link';
import { addBook, updateBookStatus, getBooks, type Book as BookType } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';

const fileToDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
    if (authLoading) return; // Wait for auth to finish loading

    if (user) {
      const fetchBooks = async () => {
        setIsFetchingBooks(true);
        try {
          const userBooks = await getBooks(user.uid);
          setBooks(userBooks);
        } catch (error) {
          console.error("Error fetching books:", error);
          toast({
            title: 'Error Fetching Books',
            description: 'Could not load your books. Please try again later.',
            variant: 'destructive',
          });
        } finally {
          setIsFetchingBooks(false);
        }
      };
      fetchBooks();
    } else {
        setIsFetchingBooks(false);
    }
  }, [user, authLoading, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewBook(prev => ({ ...prev, [id]: value }));
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 1MB.",
          variant: "destructive",
        });
        return;
      }
      const dataUri = await fileToDataURI(file);
      setNewBook(prev => ({ ...prev, coverImage: dataUri }));
    }
  };


  const handleAddBook = async () => {
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    if (!newBook.title || !newBook.blurb || !newBook.outline) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields for the new book.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const bookData = { ...newBook, status: 'ongoing' as const, userId: user.uid };
      const newBookId = await addBook(bookData);
      setBooks([{ ...bookData, id: newBookId, createdAt: new Date() }, ...books]);
      setNewBook(INITIAL_BOOK_STATE);
      setIsDialogOpen(false);
      toast({
        title: 'Book Created!',
        description: `"${bookData.title}" has been added to your library.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Creating Book',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookId: string, currentStatus: 'ongoing' | 'completed') => {
    if (!user) return;
    const newStatus = currentStatus === 'ongoing' ? 'completed' : 'ongoing';
    try {
        await updateBookStatus(user.uid, bookId, newStatus);
        setBooks(books.map(b => b.id === bookId ? {...b, status: newStatus} : b));
        toast({
            title: "Status Updated",
            description: `Book marked as ${newStatus}.`
        });
    } catch (error) {
        console.error(error);
        toast({
            title: "Error updating status",
            variant: "destructive"
        })
    }
  }

  if (authLoading || isFetchingBooks) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
              <p className="text-muted-foreground">Your personal library. Click a book to start writing.</p>
            </div>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Book
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create a New Book</DialogTitle>
              <DialogDescription>
                Provide the blueprint for your new story. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={newBook.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="blurb" className="text-right pt-2">Blurb</Label>
                <Textarea id="blurb" value={newBook.blurb} onChange={handleInputChange} className="col-span-3" placeholder="A short, enticing summary of your book." />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="outline" className="text-right pt-2">Outline</Label>
                <Textarea id="outline" value={newBook.outline} onChange={handleInputChange} className="col-span-3" placeholder="A high-level outline of your story's plot points."/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="coverImage" className="text-right">Cover</Label>
                  <div className="col-span-3">
                      <Input id="coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} />
                  </div>
              </div>
               {newBook.coverImage && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3">
                    <p className="text-sm text-muted-foreground mb-2">Cover Preview:</p>
                    <Image src={newBook.coverImage} alt="Cover preview" width={150} height={225} className="rounded-md object-cover aspect-[2/3]" />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleAddBook} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Book
              </Button>
            </DialogFooter>
          </DialogContent>
          <CardFooter/>

          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {books.map((book) => (
                <div key={book.id} className="group relative">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-secondary shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                        <Image 
                            src={book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`}
                            alt={`Cover for ${book.title}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint="book cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)'}}>
                            <CardTitle className="text-xl font-bold truncate">{book.title}</CardTitle>
                            <CardDescription className="text-white/90 line-clamp-2 mt-1">{book.blurb}</CardDescription>
                        </div>
                         <Badge variant={book.status === 'completed' ? 'secondary' : 'default'} className="absolute top-3 right-3">
                            {book.status}
                         </Badge>
                    </div>
                    
                     <div className="mt-4 flex flex-col gap-2">
                         <Button asChild className="w-full">
                          <Link href={`/write?bookId=${book.id}`}><Edit className="mr-2 h-4 w-4" /> Write</Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" className="flex-1">
                                <Link href={`/content-history?bookId=${book.id}`}><BookOpen className="mr-2 h-4 w-4" /> Chapters</Link>
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex-1">Details</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>{book.title}</DialogTitle>
                                        <DialogDescription asChild>
                                           <div>
                                             <Badge variant={book.status === 'completed' ? 'secondary' : 'default'} className="ml-1">{book.status}</Badge>
                                           </div>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-[60vh] pr-6">
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label className="font-semibold">Blurb</Label>
                                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{book.blurb}</p>
                                            </div>
                                            <div>
                                                <Label className="font-semibold">Outline</Label>
                                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{book.outline}</p>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <DialogFooter className="mt-4 border-t pt-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`status-switch-${book.id}`}
                                                checked={book.status === 'completed'}
                                                onCheckedChange={() => handleStatusChange(book.id!, book.status)}
                                            />
                                            <Label htmlFor={`status-switch-${book.id}`}>Mark as Completed</Label>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-secondary/50">
              <BookImage className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">Your Library is Empty</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">You haven't created any books yet. Click the "New Book" button to start your first story and bring your ideas to life.</p>
                <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Book
                </Button>
            </div>
          )}
      </Dialog>
    </div>
  );
}
