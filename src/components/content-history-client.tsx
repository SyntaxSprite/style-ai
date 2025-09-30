'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react";
import { getContentHistory, getBook, deleteContent, type Book, type GeneratedContent } from "@/services/firestore";
import { useAuth } from "./auth-provider";
import { useSearchParams, notFound } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";


export default function ContentHistoryClient() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { toast } = useToast();

  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setIsLoading(false);
        return;
    }
    if (!bookId) {
        setIsLoading(false);
        notFound();
        return;
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [history, bookData] = await Promise.all([
                getContentHistory(user.uid, bookId),
                getBook(user.uid, bookId),
            ]);
            
            if (!bookData) {
                notFound();
                return;
            }

            setContentHistory(history);
            setBook(bookData);
        } catch (error) {
            console.error("Error fetching content history:", error);
            toast({
                title: "Failed to load history",
                description: "There was a problem fetching the chapter history for this book.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();

  }, [user, authLoading, bookId, toast]);

  const handleView = (content: GeneratedContent) => {
    setSelectedContent(content);
    setIsViewOpen(true);
  }

  const handleCopy = (content: GeneratedContent) => {
    navigator.clipboard.writeText(content.generatedText);
    toast({ title: "Chapter Copied!", description: "The chapter text has been copied to your clipboard." });
  }

  const handleDelete = async (contentId: string) => {
    if (!user) return;
    try {
        await deleteContent(user.uid, contentId);
        setContentHistory(contentHistory.filter(c => c.id !== contentId));
        toast({ title: "Chapter Deleted", description: "The chapter has been permanently removed." });
    } catch (error) {
        console.error("Error deleting content:", error);
        toast({ title: "Error Deleting", description: "Could not delete the chapter. Please try again.", variant: "destructive" });
    }
  }
  
  if (isLoading || authLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4">
                            <Skeleton className="h-6 flex-1" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!bookId) {
    return notFound();
  }
  
  if (!book) {
      return (
          <Card>
            <CardHeader>
                <CardTitle>History Not Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The requested book could not be found or you don't have permission to view it.</p>
            </CardContent>
          </Card>
      )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Chapters for: {book.title}</CardTitle>
        <CardDescription>
          Browse and manage your previously generated chapters for this book.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chapters written for this book yet.
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chapter</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated on</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentHistory.map((item, index) => (
                <TableRow key={item.id}>
                   <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.prompt.split('\n')[0].replace('Title: ', '') || `Chapter ${item.id}`}</TableCell>
                   <TableCell>
                    <Badge variant="outline">{item.contentType}</Badge>
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <AlertDialog>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleView(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleCopy(item)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this chapter
                                from your book's history.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id!)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedContent?.prompt.split('\n')[0].replace('Title: ', '')}</DialogTitle>
                <DialogDescription>
                   Generated on {selectedContent && new Date(selectedContent.createdAt).toLocaleString()}
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
                <div className="whitespace-pre-wrap py-4 prose prose-sm dark:prose-invert max-w-none">
                    {selectedContent?.generatedText}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
    </>
  );
}
