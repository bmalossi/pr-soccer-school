import { usePageSEO } from "@/hooks/use-page-seo";
import { ContactForm } from "@/components/ContactForm";

const Contact = () => {
  usePageSEO({
    title: "Contact | Book Now with PR Soccer School",
    description:
      "Contact PR Soccer School to book or ask about youth soccer programs, pricing, and locations.",
    path: "/contact",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Book your player&apos;s free trial session.</h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Share a few details about your child and we&apos;ll reach out with available dates, locations, and the best
              program fit.
            </p>
          </header>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container grid gap-10 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:py-14">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <ContactForm />
          </div>
          <aside className="space-y-5 text-sm text-muted-foreground md:text-base">
            <div>
              <h2 className="mb-2 text-base font-semibold text-foreground">Other ways to reach us</h2>
              <p>Email: prsoccerschool@outlook.com</p>
              <p>Phone: +1 (408) 908-9805</p>
              <p>Address: San Jose, CA</p>
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold text-foreground">What to expect after you submit</h2>
              <ol className="space-y-2 list-decimal pl-5">
                <li>We review your information and match your player with the best program.</li>
                <li>We contact you with trial options, locations, and next steps.</li>
                <li>Your player joins a session and experiences PR Soccer training first-hand.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Contact;
