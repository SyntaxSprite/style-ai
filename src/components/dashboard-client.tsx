'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateContent, acceptContent } from '@/ai/flows/generate-content';
import { Sparkles, Loader2, Copy, BookOpen, ChevronLeft, Check, RefreshCcw } from 'lucide-react';
import { Input } from './ui/input';
import { getBook, type Book } from '@/services/firestore';
import Link from 'next/link';
import { useSearchParams, notFound } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { marked } from 'marked';


type GenerationState = 'idle' | 'loading' | 'refining' | 'done';

export default function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [prompt, setPrompt] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [isFetchingBook, setIsFetchingBook] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setIsFetchingBook(false);
        return;
    }
    if (!bookId) {
        setIsFetchingBook(false);
        notFound();
        return;
    }

    const fetchBook = async () => {
        setIsFetchingBook(true);
        try {
            const bookData = await getBook(user.uid, bookId);
            if (!bookData) {
                notFound();
                return;
            }
            setBook(bookData);
        } catch (error) {
            console.error("Error fetching book:", error);
            toast({ title: "Failed to load book", variant: 'destructive' });
        } finally {
            setIsFetchingBook(false);
        }
    };
    fetchBook();
  }, [user, authLoading, bookId, toast]);

  const handleGenerate = async (isRefinement = false) => {
    if (!user || !book?.id) return;
    if (!prompt || !chapterTitle) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a chapter title and a prompt.',
        variant: 'destructive',
      });
      return;
    }
    if (isRefinement && !refinementPrompt) {
        toast({
          title: 'Refinement Prompt Missing',
          description: 'Please provide instructions for refining the chapter.',
          variant: 'destructive',
        });
        return;
    }


    setGenerationState('loading');
    if (!isRefinement) {
      setGeneratedText('');
    }

    try {
      const result = await generateContent({
        userId: user.uid,
        bookId: book.id,
        prompt: `Title: ${chapterTitle}\n\nPrompt: ${prompt}`,
        contentType: 'Chapter',
        textToRefine: isRefinement ? generatedText : undefined,
        refinementPrompt: isRefinement ? refinementPrompt : undefined,
      });
      setGeneratedText(result.generatedText);
      setGenerationState('done');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error Generating Chapter',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setGenerationState('idle');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleAccept = async () => {
    if (!user || !book?.id || !generatedText) return;
    setIsAccepting(true);
    try {
        await acceptContent({
            userId: user.uid,
            bookId: book.id,
            prompt: `Title: ${chapterTitle}\n\nPrompt: ${prompt}`,
            generatedText,
            contentType: 'Chapter',
        });
        toast({
            title: "Chapter Accepted",
            description: "The chapter has been saved to your book's history."
        });
        // Reset state for next chapter
        setGeneratedText('');
        setPrompt('');
        setChapterTitle('');
        setRefinementPrompt('');
        setGenerationState('idle');
    } catch (error) {
        console.error(error);
        toast({ title: 'Error accepting chapter', variant: 'destructive' });
    } finally {
        setIsAccepting(false);
    }
  }

  const isLoading = generationState === 'loading';

  if (authLoading || isFetchingBook) {
      return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-40 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
                <Card className="lg:col-span-2 min-h-[500px]">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-5 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[350px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </CardContent>
                </Card>
            </div>
        </div>
      )
  }

  if (!bookId) return notFound();
  if (!book) return (
    <div className="text-center text-muted-foreground py-10">
      <p>Book not found or you don't have permission to view it.</p>
      <Button variant="link" asChild><Link href="/books">Go back to your books</Link></Button>
    </div>
  );

  return (
    <div className="space-y-4">
       <div>
        <Button variant="outline" asChild>
          <Link href="/books">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Write a New Chapter</CardTitle>
            <CardDescription>
              Working on: <span className="font-semibold text-primary">{book.title}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                placeholder="e.g., Chapter 1: The Discovery"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Chapter Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., The protagonist finds a mysterious map..."
                className="min-h-[200px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleGenerate(false)} disabled={isLoading} className="w-full">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Write Chapter</>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2 flex flex-col h-[70vh] lg:h-auto">
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Generated Chapter</CardTitle>
                  <CardDescription>Your AI-generated chapter will appear here.</CardDescription>
              </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            {generationState === 'loading' ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Crafting your chapter...</p>
              </div>
            ) : generatedText ? (
              <ScrollArea className="h-full pr-6 -mr-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: marked(generatedText) }}
                />
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <BookOpen className="h-10 w-10 text-primary/50 mb-4" />
                <p className="font-medium">Your generated chapter will appear here.</p>
                <p className="text-sm">Start by entering a title and prompt on the left.</p>
              </div>
            )}
          </CardContent>

          {generationState === 'done' && (
            <CardFooter className="flex-col gap-4 items-stretch border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleAccept} className="flex-1" disabled={isAccepting}>
                       {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                       Accept
                    </Button>
                    <Button onClick={() => setGenerationState('refining')} variant="secondary" className="flex-1">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refine
                    </Button>
                    <Button onClick={handleCopy} variant="outline" size="icon" className="w-full sm:w-auto">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </CardFooter>
          )}

          {generationState === 'refining' && (
             <CardFooter className="flex-col gap-4 items-stretch border-t pt-6">
                <Label htmlFor="refine-prompt" className="font-semibold">Refinement Instructions</Label>
                <Textarea
                    id="refine-prompt"
                    placeholder="e.g., Make the dialogue more tense. Add more description of the cave."
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleGenerate(true)} className="flex-1" disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Regenerate
                    </Button>
                    <Button onClick={() => setGenerationState('done')} variant="ghost">
                        Cancel
                    </Button>
                </div>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
