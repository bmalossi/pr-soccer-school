import { usePageSEO } from "@/hooks/use-page-seo";

const Legal = () => {
  usePageSEO({
    title: "Legal | Terms & Privacy | PR Soccer School",
    description:
      "Read PR Soccer School legal information including basic terms of use, privacy practices, and image usage notes.",
    path: "/legal",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms, privacy, and image usage.</h1>
            <p className="text-base text-muted-foreground md:text-lg">
              This page is a starting point and does not replace advice from a licensed attorney. Customize it with your
              own legal text.
            </p>
          </header>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container space-y-8 py-12 md:py-16">
          <article className="space-y-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-md md:text-base">
            <h2 className="text-lg font-semibold text-foreground">Terms of Use (Overview)</h2>
            <p>
              PR Soccer School provides training services for youth players. Participation in any activity involves
              inherent physical risks. Parents or guardians are responsible for ensuring that players are medically
              cleared for participation.
            </p>
            <p>
              By registering a player or using this website, you agree to follow our safety rules, payment policies, and
              communication guidelines, which will be clearly shared during registration.
            </p>
          </article>

          <article className="space-y-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-md md:text-base">
            <h2 className="text-lg font-semibold text-foreground">Privacy (Overview)</h2>
            <p>
              We collect basic contact information from parents and guardians to manage training, billing, and
              communication about programs. We do not sell your data to third parties.
            </p>
            <p>
              You can request that we update or remove your contact information from our systems at any time by
              contacting us directly.
            </p>
          </article>

          <article className="space-y-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-md md:text-base">
            <h2 className="text-lg font-semibold text-foreground">Photos & Media</h2>
            <p>
              We may capture photos and short videos during training sessions and events to share with families and on
              official PR Soccer School channels. We respect family preferences and will follow your instructions
              regarding use of your child&apos;s image.
            </p>
            <p>
              Please let us know in writing if you prefer that your child is not included in any photos or media content.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Legal;
