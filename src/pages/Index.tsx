import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import heroKids from "@/assets/gallery-kids-3.jpg";
import { ContactForm } from "@/components/ContactForm";
import { usePublishedSiteContent } from "@/hooks/use-published-site-content";

type HomeSectionType = "hero" | "benefits" | "programs_highlights" | "testimonials";

type HomeBuilderPublished = {
  version?: number;
  sections?: {
    id?: string;
    type?: HomeSectionType;
    enabled?: boolean;
    content?: Record<string, unknown>;
  }[];
};

type HomeHeroPublished = {
  tagline?: string;
  heading?: string;
  description?: string;
  heroCaptionTitle?: string;
  heroCaptionText?: string;
};

type Toggleable = { id?: string; enabled?: boolean };
type HeroCtaPublished = Toggleable & {
  label?: string;
  href?: string;
  variant?: "default" | "outline";
};

type SiteSettingsPublished = {
  seoTitle?: string;
  seoDescription?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length ? value : undefined;

const isEnabled = (v: unknown, fallback = true) => (typeof v === "boolean" ? v : fallback);

const Index = () => {
  const { data: published } = usePublishedSiteContent(["home_builder", "home_hero", "site_settings"]);

  const homeBuilder = ((): HomeBuilderPublished => {
    const raw = published["home_builder"]?.published;
    return isRecord(raw) ? (raw as HomeBuilderPublished) : {};
  })();

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

  const builderSections = (homeBuilder.sections ?? [])
    .filter((s) => s && typeof s === "object")
    .filter((s) => (s.enabled ?? true) !== false)
    .filter(
      (s) =>
        s.type === "hero" || s.type === "benefits" || s.type === "programs_highlights" || s.type === "testimonials",
    );
  const hasBuilder = builderSections.length > 0;

  const getContent = (s: (typeof builderSections)[number] | undefined) =>
    isRecord(s?.content) ? (s!.content as Record<string, unknown>) : {};

  return (
    <main className="bg-background text-foreground">
      {hasBuilder
        ? builderSections.map((s, idx) => {
            const c = getContent(s);

            if (s.type === "hero") {
              const tagline = asString(c.tagline) ?? asString(homeHero.tagline) ?? "Brazilian Method. American Opportunity.";
              const heading = asString(c.heading) ?? asString(homeHero.heading) ?? "Elite Youth Soccer Training for Future Game Changers.";
              const description = asString(c.description);

              const ctasRaw = Array.isArray(c.ctas) ? (c.ctas as unknown[]) : [];
              const ctas = ctasRaw
                .filter((it) => typeof it === "object" && it !== null)
                .map((it) => it as HeroCtaPublished)
                .filter((it) => isEnabled(it.enabled, true))
                .map((it) => ({
                  label: asString(it.label),
                  href: asString(it.href),
                  variant: (it.variant === "outline" ? "outline" : "default") as "outline" | "default",
                }))
                .filter((it) => it.label && it.href);

              const legacyPrimaryText = asString(c.primaryCtaText) ?? "Book Your Free Trial";
              const legacyPrimaryHref = asString(c.primaryCtaHref) ?? "#trial-form";
              const legacySecondaryText = asString(c.secondaryCtaText) ?? "View Programs";
              const legacySecondaryHref = asString(c.secondaryCtaHref) ?? "/programs";

              const captionTitle = asString(c.heroCaptionTitle) ?? asString(homeHero.heroCaptionTitle) ?? "Real players. Real smiles. Real development.";
              const captionText = asString(c.heroCaptionText);

              return (
                <section key={`${s.type}-${idx}`} className="border-b bg-gradient-to-b from-background to-muted/60">
                  <div className="container flex flex-col gap-8 py-12 md:grid md:grid-cols-2 md:items-center md:py-20">
                    <div className="space-y-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{tagline}</p>
                      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{heading}</h1>
                      <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
                        {description ?? (
                          <>
                            PR Soccer School combines Brazilian creativity with professional structure to help young players in the
                            U.S. build real skills, confidence, and discipline on and off the field.
                          </>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {ctas.length ? (
                          ctas.map((cta, i) => (
                            <Button key={i} size="lg" variant={cta.variant} asChild>
                              <a href={cta.href!}>{cta.label!}</a>
                            </Button>
                          ))
                        ) : (
                          <>
                            <Button size="lg" asChild>
                              <a href={legacyPrimaryHref}>{legacyPrimaryText}</a>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                              <a href={legacySecondaryHref}>{legacySecondaryText}</a>
                            </Button>
                          </>
                        )}
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
                        <p className="font-medium text-foreground">{captionTitle}</p>
                        <p>
                          {captionText ?? (
                            <>
                              Sessions focus on first touch, ball control, decision making, and game intelligence — everything young
                              players need to stand out in tryouts and matches.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            if (s.type === "benefits") {
              const heading = asString(c.heading) ?? "Why Families Choose PR Soccer";
              const description =
                asString(c.description) ??
                "More than drills. We build complete players with strong fundamentals, mindset, and respect for the game.";
              const items = Array.isArray(c.items) ? (c.items as any[]).filter((it) => isEnabled(it?.enabled, true)) : [];
              const fallback = [
                {
                  title: "Professional Brazilian Coaching",
                  text: "Sessions led by licensed coaches with experience in Brazilian methodology, adapted to U.S. youth soccer reality.",
                },
                {
                  title: "Small Groups, Big Results",
                  text: "Limited players per session so every child gets real touches on the ball and specific feedback.",
                },
                {
                  title: "Character On and Off the Field",
                  text: "We teach discipline, respect, and teamwork so players grow as athletes and as people.",
                },
              ];
              const cards = items.length ? items : fallback;

              return (
                <section key={`${s.type}-${idx}`} className="border-b bg-background">
                  <div className="container space-y-8 py-12 md:py-16">
                    <header className="space-y-2 text-center">
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{heading}</h2>
                      <p className="max-w-2xl mx-auto text-muted-foreground">{description}</p>
                    </header>
                    <div className="grid gap-6 md:grid-cols-3">
                      {cards.map((it: any, i: number) => (
                        <article key={i} className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
                          <h3 className="mb-2 text-base font-semibold">{asString(it.title) ?? fallback[i % fallback.length].title}</h3>
                          <p className="text-sm text-muted-foreground">{asString(it.text) ?? fallback[i % fallback.length].text}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            if (s.type === "programs_highlights") {
              const heading = asString(c.heading) ?? "Highlighted Programs";
              const description =
                asString(c.description) ??
                "From first touches to competitive preparation, choose the program that matches your player's age and goals.";
              const items = Array.isArray(c.items) ? (c.items as any[]).filter((it) => isEnabled(it?.enabled, true)) : [];
              const fallback = [
                {
                  title: "Academy Training",
                  ages: "Ages 8–14",
                  description: "Progressive technical and tactical development in a structured weekly program.",
                  metaLeft: "2x per week",
                  linkText: "Learn more",
                  linkHref: "/programs",
                },
                {
                  title: "Clinics & Camps",
                  ages: "Ages 6–16",
                  description: "High-intensity sessions during breaks and weekends, focused on specific skills like finishing or 1v1.",
                  metaLeft: "Seasonal",
                  linkText: "View dates",
                  linkHref: "/programs",
                },
                {
                  title: "Private Training",
                  ages: "Ages 8–17",
                  description: "1-on-1 or small groups designed around your player's position, level, and competitive goals.",
                  metaLeft: "Custom schedule",
                  linkText: "Request details",
                  linkHref: "/contact",
                },
              ];
              const cards = items.length ? items : fallback;

              return (
                <section key={`${s.type}-${idx}`} className="border-b bg-muted/40">
                  <div className="container space-y-8 py-12 md:py-16">
                    <header className="space-y-2 text-center">
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{heading}</h2>
                      <p className="max-w-2xl mx-auto text-muted-foreground">{description}</p>
                    </header>
                    <div className="grid gap-6 md:grid-cols-3">
                      {cards.map((it: any, i: number) => (
                        <article key={i} className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale">
                          <h3 className="mb-1 text-base font-semibold">{asString(it.title) ?? fallback[i % fallback.length].title}</h3>
                          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {asString(it.ages) ?? fallback[i % fallback.length].ages}
                          </p>
                          <p className="mb-4 text-sm text-muted-foreground">{asString(it.description) ?? fallback[i % fallback.length].description}</p>
                          <div className="mt-auto flex items-center justify-between text-sm">
                            <span className="font-semibold">{asString(it.metaLeft) ?? fallback[i % fallback.length].metaLeft}</span>
                            <a
                              href={asString(it.linkHref) ?? fallback[i % fallback.length].linkHref}
                              className="text-sm font-medium text-primary story-link"
                            >
                              {asString(it.linkText) ?? fallback[i % fallback.length].linkText}
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            // testimonials
            const heading = asString(c.heading) ?? "What Parents Are Saying";
            const description =
              asString(c.description) ?? "Real feedback from families who trust PR Soccer School with their children's development.";
            const items = Array.isArray(c.items) ? (c.items as any[]).filter((it) => isEnabled(it?.enabled, true)) : [];
            const fallback = [
              {
                quote: "Our son not only improved technically, but also gained so much confidence. The coaches truly care.",
                author: "Parent of U12 player",
              },
              {
                quote: "Training is intense but fun. You can see the Brazilian style in the way they encourage creativity.",
                author: "Parent of U14 player",
              },
              {
                quote: "Flexible schedules, great communication, and most importantly, our daughter loves every session.",
                author: "Parent of U10 player",
              },
            ];
            const cards = items.length ? items : fallback;

            return (
              <section key={`${s.type}-${idx}`} className="border-b bg-background">
                <div className="container space-y-8 py-12 md:py-16">
                  <header className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{heading}</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground">{description}</p>
                  </header>
                  <div className="grid gap-6 md:grid-cols-3">
                    {cards.map((it: any, i: number) => (
                      <figure key={i} className="h-full rounded-2xl border bg-card p-6 shadow-md hover-scale">
                        <blockquote className="mb-3 text-sm text-muted-foreground">
                          {`“${asString(it.quote) ?? fallback[i % fallback.length].quote}”`}
                        </blockquote>
                        <figcaption className="text-sm font-medium">{asString(it.author) ?? fallback[i % fallback.length].author}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        : null}

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
