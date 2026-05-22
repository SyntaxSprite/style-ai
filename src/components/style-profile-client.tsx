'use client';

import { useState, type ChangeEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeWritingStyle, type AnalyzeWritingStyleOutput } from '@/ai/flows/analyze-writing-style';
import { getStyleProfile } from '@/services/data';
import { UploadCloud, FileText, Loader2, Sparkles, BookOpen, Mic, Palette, Pilcrow, X, ArrowRight } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';

function fileToDataURI(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export default function StyleProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeWritingStyleOutput | null>(null);
  const { toast } = useToast();

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (authLoading) return;
    if (user) {
        const fetchProfile = async () => {
            setIsFetchingProfile(true);
            try {
                const profile = await getStyleProfile();
                if (profile) {
                    setAnalysisResult(profile);
                }
            } catch (error: unknown) {
                console.error("Error fetching style profile:", error);
                toast({
                    title: "Could not load profile",
                    description: "Failed to fetch your existing writing style profile.",
                    variant: "destructive",
                });
            } finally {
                setIsFetchingProfile(false);
            }
        };
        fetchProfile();
    } else {
        setIsFetchingProfile(false);
    }
  }, [user, authLoading, toast]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files) {
      const newFiles = [...files];
      newFiles[index] = e.target.files[0];
      setFiles(newFiles);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
    if (fileInputRefs[index].current) {
        fileInputRefs[index].current.value = '';
    }
  };


  const handleAnalyze = async () => {
    if (!user) {
        toast({ title: 'Not authenticated', variant: 'destructive' });
        return;
    }
    const validFiles = files.filter(f => f !== null) as File[];

    if (validFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please upload at least one writing sample.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
        const fileDataUris = await Promise.all(
            validFiles.map(file => fileToDataURI(file))
        );
      
      const result = await analyzeWritingStyle({ fileDataUris });
      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete!',
        description: 'Your writing style profile has been generated and saved.',
      });
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: 'Error Analyzing Style',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAnalyzeDisabled = isLoading || files.every(f => f === null);

  if (authLoading || isFetchingProfile) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-48" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="page-section">
      <Card className="app-card">
        <CardHeader>
          <CardTitle>Onboarding: Define Your Writing Style</CardTitle>
          <CardDescription>Upload 1-3 documents (.pdf, .txt) of your past work. The first is required. The more you provide, the better we can match your style.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(index => (
            <div key={index} className="flex w-full flex-col items-center justify-center">
              <label htmlFor={`dropzone-file-${index}`} className={`relative flex min-h-[12rem] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/50 transition-colors hover:bg-secondary sm:min-h-[14rem] ${files[index] ? 'border-primary' : 'border-border'}`}>
                {files[index] ? (
                  <>
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="w-8 h-8 mb-3 text-primary" />
                        <p className="font-semibold truncate max-w-full px-2">{files[index]?.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round((files[index]?.size || 0) / 1024)} KB</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background"
                        onClick={(e) => { e.preventDefault(); handleRemoveFile(index); }}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-center text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span></p>
                    <p className="text-xs text-muted-foreground">{index === 0 ? 'Required' : 'Optional'}</p>
                  </div>
                )}
                <Input
                  id={`dropzone-file-${index}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, index)}
                  accept=".pdf,.txt"
                  ref={fileInputRefs[index]}
                />
              </label>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row items-center gap-4">
          <Button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {analysisResult ? 'Re-analyze Writing Style' : 'Analyze Writing Style'}
          </Button>
           {analysisResult && (
            <Button onClick={() => router.push('/books')} variant="default" className="w-full sm:w-auto">
              Continue to My Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {isLoading && !analysisResult && (
        <Card className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Analyzing your style...
          </p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </Card>
      )}

      {analysisResult && !isLoading && (
        <Card className="app-card">
          <CardHeader>
            <CardTitle>Your Writing Style Profile</CardTitle>
            <CardDescription>Here's what we learned about your writing. This profile will be used to generate chapters in your voice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisItem icon={BookOpen} title="Vocabulary" content={analysisResult.analysisData.vocabularyComplexity} />
              <AnalysisItem icon={Pilcrow} title="Sentence Structure" content={analysisResult.analysisData.sentenceStructure} />
              <AnalysisItem icon={Mic} title="Tone & Mood" content={analysisResult.analysisData.toneAndMood} />
              <AnalysisItem icon={Palette} title="Punctuation" content={analysisResult.analysisData.punctuationUsage} />
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>View Full Style Analysis & Custom Prompt</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold">Point of View</h4>
                    <p className="text-sm text-muted-foreground">{analysisResult.analysisData.pointOfView}</p>
                    <h4 className="font-semibold">Dialogue Style</h4>
                    <p className="text-sm text-muted-foreground">{analysisResult.analysisData.dialogueStyle}</p>
                    <h4 className="font-semibold">Custom AI Prompt</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded">{analysisResult.customPrompt}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AnalysisItem({ icon: Icon, title, content }: { icon: React.ElementType, title: string, content: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-full mt-1">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}
