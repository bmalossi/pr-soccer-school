import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import heroKids from "@/assets/gallery-kids-3.jpg";
import { ContactForm } from "@/components/ContactForm";
import { usePublishedSiteContent } from "@/hooks/use-published-site-content";

type HomeHeroPublished = {
  tagline?: string;
  heading?: string;
  description?: string;
  heroCaptionTitle?: string;
  heroCaptionText?: string;
};

type SiteSettingsPublished = {
  seoTitle?: string;
  seoDescription?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length ? value : undefined;

const Index = () => {
  const { data: published } = usePublishedSiteContent(["home_hero", "site_settings"]);

  const homeHero = ((): HomeHeroPublished => {
    const raw = published["home_hero"]?.published;
    return isRecord(raw) ? (raw as HomeHeroPublished) : {};
  })();

  const siteSettings = ((): SiteSettingsPublished => {
    const raw = published["site_settings"]?.published;
    return isRecord(raw) ? (raw as SiteSettingsPublished) : {};
  })();

  const seoTitle =
    asString(siteSettings.seoTitle) ?? "PR Soccer School | Elite Youth Soccer Training";
  const seoDescription =
    asString(siteSettings.seoDescription) ??
    "Elite Brazilian soccer training for youth players in the USA. Develop technique, discipline, and confidence with PR Soccer School.";

  usePageSEO({
    title: seoTitle,
    description: seoDescription,
    path: "/",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-gradient-to-b from-background to-muted/60">
        <div className="container flex flex-col gap-8 py-12 md:grid md:grid-cols-2 md:items-center md:py-20">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {asString(homeHero.tagline) ?? "Brazilian Method. American Opportunity."}
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {asString(homeHero.heading) ?? "Elite Youth Soccer Training for Future Game Changers."}
            </h1>
            <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              {asString(homeHero.description) ?? (
                <>
                  PR Soccer School combines Brazilian creativity with professional structure to help young players in the
                  U.S. build real skills, confidence, and discipline on and off the field.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#trial-form">Book Your Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/programs">View Programs</a>
              </Button>
            </div>
            <dl className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <dt className="font-semibold text-foreground">5+ Years</dt>
                <dd>Developing youth players in the U.S.</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Brazilian Method</dt>
                <dd>Technical, fast, creative training.</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Player-Centered</dt>
                <dd>Small groups, real individual feedback.</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border bg-card p-2 shadow-sm md:p-4">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={heroKids}
                alt="Young PR Soccer School players smiling together on the field"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {asString(homeHero.heroCaptionTitle) ?? "Real players. Real smiles. Real development."}
              </p>
              <p>
                {asString(homeHero.heroCaptionText) ?? (
                  <>
                    Sessions focus on first touch, ball control, decision making, and game intelligence  everything young
                    players need to stand out in tryouts and matches.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="container space-y-8 py-12 md:py-16">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Why Families Choose PR Soccer</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              More than drills. We build complete players with strong fundamentals, mindset, and respect for the game.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-2 text-base font-semibold">Professional Brazilian Coaching</h3>
              <p className="text-sm text-muted-foreground">
                Sessions led by licensed coaches with experience in Brazilian methodology, adapted to U.S. youth soccer
                reality.
              </p>
            </article>
            <article className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-2 text-base font-semibold">Small Groups, Big Results</h3>
              <p className="text-sm text-muted-foreground">
                Limited players per session so every child gets real touches on the ball and specific feedback.
              </p>
            </article>
            <article className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-2 text-base font-semibold">Character On and Off the Field</h3>
              <p className="text-sm text-muted-foreground">
                We teach discipline, respect, and teamwork so players grow as athletes and as people.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="container space-y-8 py-12 md:py-16">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Highlighted Programs</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              From first touches to competitive preparation, choose the program that matches your player's age and goals.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-1 text-base font-semibold">Academy Training</h3>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ages 8–14</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Progressive technical and tactical development in a structured weekly program.
              </p>
              <div className="mt-auto flex items-center justify-between text-sm">
                <span className="font-semibold">2x per week</span>
                <a href="/programs" className="text-sm font-medium text-primary story-link">
                  Learn more
                </a>
              </div>
            </article>
            <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-1 text-base font-semibold">Clinics & Camps</h3>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ages 6–16</p>
              <p className="mb-4 text-sm text-muted-foreground">
                High-intensity sessions during breaks and weekends, focused on specific skills like finishing or 1v1.
              </p>
              <div className="mt-auto flex items-center justify-between text-sm">
                <span className="font-semibold">Seasonal</span>
                <a href="/programs" className="text-sm font-medium text-primary story-link">
                  View dates
                </a>
              </div>
            </article>
            <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <h3 className="mb-1 text-base font-semibold">Private Training</h3>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ages 8–17</p>
              <p className="mb-4 text-sm text-muted-foreground">
                1-on-1 or small groups designed around your player's position, level, and competitive goals.
              </p>
              <div className="mt-auto flex items-center justify-between text-sm">
                <span className="font-semibold">Custom schedule</span>
                <a href="/contact" className="text-sm font-medium text-primary story-link">
                  Request details
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="container space-y-8 py-12 md:py-16">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What Parents Are Saying</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Real feedback from families who trust PR Soccer School with their children's development.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            <figure className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <blockquote className="mb-3 text-sm text-muted-foreground">
                "Our son not only improved technically, but also gained so much confidence. The coaches truly care."
              </blockquote>
              <figcaption className="text-sm font-medium">Parent of U12 player</figcaption>
            </figure>
            <figure className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <blockquote className="mb-3 text-sm text-muted-foreground">
                "Training is intense but fun. You can see the Brazilian style in the way they encourage creativity."
              </blockquote>
              <figcaption className="text-sm font-medium">Parent of U14 player</figcaption>
            </figure>
            <figure className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
              <blockquote className="mb-3 text-sm text-muted-foreground">
                "Flexible schedules, great communication, and most importantly, our daughter loves every session."
              </blockquote>
              <figcaption className="text-sm font-medium">Parent of U10 player</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="trial-form" className="border-b bg-background">
        <div className="container space-y-8 py-12 md:py-16">
          <header className="space-y-2 text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to See Your Player Train the Brazilian Way?
            </h2>
            <p className="max-w-2xl mx-auto text-balance text-muted-foreground">
              Book a free trial session and let your child experience the difference in intensity, attention, and joy for
              the game.
            </p>
          </header>
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-foreground text-left">
              Quick Trial Request
            </h3>
            <p className="mb-4 text-sm text-muted-foreground text-left">
              Share a few details and we&apos;ll contact you with available dates and the best program for your player.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
