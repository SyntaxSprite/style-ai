import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Feather, BookHeart, Sparkles, BrainCircuit, Library } from 'lucide-react';
import Logo from '@/components/logo';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
        <Link href="/" className="flex items-center gap-2" aria-label="ChapterCraft Home">
          <Logo />
          <h1 className="text-2xl font-bold text-primary">ChapterCraft</h1>
        </Link>
        <nav className="flex items-center gap-2">
           <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 sm:py-24 md:py-40">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-foreground">
              Unleash Your Inner Author.
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Overcome writer's block and build your world, one perfect chapter at a time. ChapterCraft is the AI partner that learns your voice and helps you tell your story.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">Start Your First Chapter</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="journey" className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-3xl md:text-4xl font-bold">Your Co-Authoring Journey</h3>
              <p className="text-lg text-muted-foreground mt-2">From a spark of an idea to a finished manuscript.</p>
            </div>
            <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <JourneyStep
                        icon={<Feather className="w-8 h-8 text-primary" />}
                        title="1. Define Your Muse"
                        description="Upload your past writing. Our AI doesn't just read your words—it learns your soul, capturing the unique cadence and rhythm of your authorial voice."
                    />
                    <JourneyStep
                        icon={<BookHeart className="w-8 h-8 text-primary" />}
                        title="2. Sculpt Your World"
                        description="For each new book, provide a blurb and outline. This is the blueprint for your universe, ensuring every chapter builds upon your grand design."
                    />
                    <JourneyStep
                        icon={<Sparkles className="w-8 h-8 text-primary" />}
                        title="3. Co-Write with AI"
                        description="When inspiration stalls, feed the AI a prompt. It generates entire chapters that feel authentically yours, keeping your narrative flowing."
                    />
                </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                    <h3 className="text-3xl md:text-4xl font-bold">More Than Just a Writing Tool</h3>
                    <p className="text-lg text-muted-foreground mt-2">Everything you need to stay organized and inspired.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<BrainCircuit className="w-10 h-10 text-accent" />}
                        title="Personalized Style Engine"
                        description="Your writing DNA is at the core of our AI, ensuring every sentence it generates is a reflection of you."
                    />
                    <FeatureCard
                        icon={<Library className="w-10 h-10 text-accent" />}
                        title="Multi-Book Library"
                        description="Manage multiple projects at once, each with its own world, outline, and history. Perfect for the prolific author."
                    />
                     <FeatureCard
                        icon={<Feather className="w-10 h-10 text-accent" />}
                        title="Blurb &amp; Outline Context"
                        description="The AI always remembers your story's foundation, maintaining plot and character consistency across chapters."
                    />
                </div>
            </div>
        </section>

        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Quote className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                <blockquote className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl font-medium text-foreground">
                    “ChapterCraft didn't just help me write; it helped me think. It’s like having a brainstorming partner who already knows exactly what you want to say.”
                </blockquote>
                <cite className="mt-4 block text-muted-foreground not-italic">— A. N. Author</cite>
            </div>
        </section>


      </main>

      <footer className="py-8 bg-card/50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChapterCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function JourneyStep({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="relative text-center bg-background p-8 rounded-xl shadow-lg border border-transparent hover:border-primary/50 transition-all duration-300">
      <div className="mb-4 inline-block bg-primary/10 p-4 rounded-full">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center bg-background/50 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 group p-2">
      <CardHeader>
        <div className="mx-auto bg-accent/10 rounded-lg p-4 w-fit group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="mt-4 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
