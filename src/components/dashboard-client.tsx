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
import { getBook, type Book } from '@/services/data';
import Link from 'next/link';
import { useSearchParams, notFound } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { PageHeader } from '@/components/page-header';
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

    getBook(bookId)
      .then((bookData) => {
        if (!bookData) notFound();
        else setBook(bookData);
      })
      .catch(() => toast({ title: 'Failed to load book', variant: 'destructive' }))
      .finally(() => setIsFetchingBook(false));
  }, [user, authLoading, bookId, toast]);

  const handleGenerate = async (isRefinement = false) => {
    if (!user || !book?.id) return;
    if (!prompt || !chapterTitle) {
      toast({
        title: 'Missing information',
        description: 'Provide a chapter title and prompt.',
        variant: 'destructive',
      });
      return;
    }
    if (isRefinement && !refinementPrompt) {
      toast({
        title: 'Refinement prompt missing',
        description: 'Add instructions for refining the chapter.',
        variant: 'destructive',
      });
      return;
    }

    setGenerationState('loading');
    if (!isRefinement) setGeneratedText('');

    try {
      const result = await generateContent({
        bookId: book.id,
        prompt: `Title: ${chapterTitle}\n\nPrompt: ${prompt}`,
        contentType: 'Chapter',
        textToRefine: isRefinement ? generatedText : undefined,
        refinementPrompt: isRefinement ? refinementPrompt : undefined,
      });
      setGeneratedText(result.generatedText);
      setGenerationState('done');
    } catch (error: unknown) {
      toast({
        title: 'Error generating chapter',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setGenerationState('idle');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleAccept = async () => {
    if (!user || !book?.id || !generatedText) return;
    setIsAccepting(true);
    try {
      await acceptContent({
        bookId: book.id,
        prompt: `Title: ${chapterTitle}\n\nPrompt: ${prompt}`,
        generatedText,
        contentType: 'Chapter',
      });
      toast({ title: 'Chapter accepted', description: 'Saved to your book history.' });
      setGeneratedText('');
      setPrompt('');
      setChapterTitle('');
      setRefinementPrompt('');
      setGenerationState('idle');
    } catch {
      toast({ title: 'Error accepting chapter', variant: 'destructive' });
    } finally {
      setIsAccepting(false);
    }
  };

  const isLoading = generationState === 'loading';

  if (authLoading || isFetchingBook) {
    return (
      <div className="page-section">
        <Skeleton className="h-10 w-36" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Skeleton className="h-96 rounded-xl xl:col-span-2" />
          <Skeleton className="h-[32rem] rounded-xl xl:col-span-3" />
        </div>
      </div>
    );
  }

  if (!bookId) return notFound();
  if (!book) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-muted-foreground">Book not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-section">
      <Button variant="outline" size="sm" asChild className="h-10 w-fit">
        <Link href="/dashboard">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      <div className="app-card flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Current book</p>
          <p className="truncate text-lg font-semibold">{book.title}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="h-10 w-full shrink-0 sm:w-auto">
          <Link href={`/content-history?bookId=${book.id}`}>View chapters</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:gap-8">
        <Card className="app-card flex flex-col xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Chapter details</CardTitle>
            <CardDescription>Describe what happens in this chapter.</CardDescription>
          </CardHeader>
          <CardContent className="form-stack flex-1">
            <div className="form-field">
              <Label htmlFor="chapter-title">Chapter title</Label>
              <Input
                id="chapter-title"
                placeholder="e.g., Chapter 1: The Discovery"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="prompt">Chapter prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., The protagonist finds a mysterious map..."
                className="min-h-[10rem] resize-y sm:min-h-[12rem]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              onClick={() => handleGenerate(false)}
              disabled={isLoading}
              className="h-11 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Write chapter
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="app-card flex min-h-[20rem] flex-col xl:col-span-3 xl:min-h-[36rem]">
          <CardHeader className="shrink-0 border-b pb-4">
            <CardTitle className="text-lg sm:text-xl">Generated chapter</CardTitle>
            <CardDescription>Preview appears below after you generate.</CardDescription>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 p-0">
            {generationState === 'loading' ? (
              <div className="flex h-[min(50vh,24rem)] flex-col items-center justify-center gap-3 text-muted-foreground xl:h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">Crafting your chapter...</p>
              </div>
            ) : generatedText ? (
              <ScrollArea className="h-[min(50vh,24rem)] xl:h-[calc(100%-1px)] xl:max-h-none">
                <div
                  className="prose prose-sm max-w-none px-4 py-4 sm:px-6 sm:py-6 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: marked(generatedText) }}
                />
              </ScrollArea>
            ) : (
              <div className="mx-4 my-4 flex h-[min(50vh,20rem)] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 text-center text-muted-foreground sm:mx-6">
                <BookOpen className="mb-4 h-12 w-12 text-primary/40" />
                <p className="font-medium text-foreground">No chapter yet</p>
                <p className="mt-1 max-w-xs text-sm">
                  Enter a title and prompt above, then tap Write chapter.
                </p>
              </div>
            )}
          </CardContent>

          {generationState === 'done' && (
            <CardFooter className="shrink-0 flex-col gap-3 border-t pt-4">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                <Button onClick={handleAccept} className="h-11" disabled={isAccepting}>
                  {isAccepting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Accept
                </Button>
                <Button
                  onClick={() => setGenerationState('refining')}
                  variant="secondary"
                  className="h-11"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refine
                </Button>
                <Button onClick={handleCopy} variant="outline" className="h-11">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardFooter>
          )}

          {generationState === 'refining' && (
            <CardFooter className="shrink-0 flex-col gap-4 border-t pt-4">
              <div className="form-field w-full">
                <Label htmlFor="refine-prompt" className="font-semibold">
                  Refinement instructions
                </Label>
                <Textarea
                  id="refine-prompt"
                  placeholder="e.g., Make the dialogue more tense..."
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  className="min-h-[5rem]"
                />
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                <Button onClick={() => handleGenerate(true)} className="h-11" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Regenerate
                </Button>
                <Button
                  onClick={() => setGenerationState('done')}
                  variant="ghost"
                  className="h-11"
                >
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
