import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Feather, BookHeart, Sparkles, BrainCircuit, Library } from 'lucide-react';
import LandingHeader from '@/components/landing-header';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />

      <main className="flex-grow">
        <section className="relative overflow-hidden py-16 sm:py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" aria-hidden />
          <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl sm:h-96 sm:w-96" aria-hidden />
          <div className="page-container relative text-center">
            <p className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              AI-powered ghostwriting
            </p>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Unleash Your Inner Author
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
              Overcome writer&apos;s block and build your world, one perfect chapter at a time.
              ChapterCraft learns your voice and helps you tell your story.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">Start Your First Chapter</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="journey" className="border-y border-border/60 bg-secondary/40 py-16 sm:py-20">
          <div className="page-container">
            <div className="mb-10 text-center sm:mb-14">
              <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">Your Co-Authoring Journey</h3>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                From a spark of an idea to a finished manuscript.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-border md:left-1/2 md:block md:-translate-x-1/2" aria-hidden />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                <JourneyStep
                  icon={<Feather className="h-8 w-8 text-primary" />}
                  title="1. Define Your Muse"
                  description="Upload your past writing. Our AI learns your cadence and rhythm—not just your words."
                />
                <JourneyStep
                  icon={<BookHeart className="h-8 w-8 text-primary" />}
                  title="2. Sculpt Your World"
                  description="For each book, provide a blurb and outline—the blueprint for your universe."
                />
                <JourneyStep
                  icon={<Sparkles className="h-8 w-8 text-primary" />}
                  title="3. Co-Write with AI"
                  description="When inspiration stalls, feed the AI a prompt. Chapters that feel authentically yours."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-24">
          <div className="page-container">
            <div className="mb-10 text-center sm:mb-14">
              <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">More Than a Writing Tool</h3>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Everything you need to stay organized and inspired.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              <FeatureCard
                icon={<BrainCircuit className="h-10 w-10 text-accent" />}
                title="Personalized Style Engine"
                description="Your writing DNA is at the core—every sentence reflects you."
              />
              <FeatureCard
                icon={<Library className="h-10 w-10 text-accent" />}
                title="Multi-Book Library"
                description="Manage multiple projects, each with its own world and history."
              />
              <FeatureCard
                icon={<Feather className="h-10 w-10 text-accent" />}
                title="Blurb & Outline Context"
                description="The AI remembers your foundation—plot and character consistency across chapters."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-secondary/40 py-16 sm:py-20">
          <div className="page-container text-center">
            <Quote className="mx-auto mb-4 h-10 w-10 text-primary/50 sm:h-12 sm:w-12" />
            <blockquote className="text-balance mx-auto max-w-3xl text-lg font-medium sm:text-xl md:text-2xl">
              &ldquo;ChapterCraft didn&apos;t just help me write; it helped me think. It&apos;s like having a
              brainstorming partner who already knows what you want to say.&rdquo;
            </blockquote>
            <cite className="mt-4 block text-sm text-muted-foreground not-italic sm:text-base">
              — A. N. Author
            </cite>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/50 py-8">
        <div className="page-container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ChapterCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function JourneyStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="app-card relative p-6 text-center transition-shadow hover:shadow-card sm:p-8">
      <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">{icon}</div>
      <h4 className="mb-2 text-lg font-bold sm:text-xl">{title}</h4>
      <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="app-card text-center shadow-soft transition-shadow hover:shadow-card">
      <CardHeader className="pb-2">
        <div className="mx-auto w-fit rounded-xl bg-accent/10 p-4">{icon}</div>
        <CardTitle className="mt-4 text-lg sm:text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </CardContent>
    </Card>
  );
}
