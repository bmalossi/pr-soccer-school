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
          <header className="space-y-3 max-w-2xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal Information</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms of Service & Privacy Policy</h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </header>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container space-y-12 py-12 md:py-16">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <aside className="space-y-4">
              <h2 className="text-xl font-bold">Terms of Service</h2>
              <p className="text-sm text-muted-foreground">
                Your agreement when using our website and services.
              </p>
            </aside>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h3>
                <p>
                  By accessing the PR Soccer School website (www.prsoccerschool.com) or registering for our programs, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">2. Medical Release & Liability</h3>
                <p>
                  Participation in athletic training involves inherent risks. By registering, parents/guardians certify that the player is in good health. PR Soccer School and its coaches are not liable for any injuries sustained during training sessions. We recommend consistent medical check-ups for all young athletes.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">3. Payment & Cancellations</h3>
                <p>
                  Fees for training sessions, clinics, and camps must be paid according to the schedule provided at registration. Cancellation policies vary by program; typically, 24-hour notice is required for private session reschedules.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">4. Code of Conduct</h3>
                <p>
                  We maintain a positive environment. Players and parents are expected to show respect to coaches, teammates, and opponents. PR Soccer School reserves the right to dismiss any participant who violates our community standards.
                </p>
              </section>
            </div>
          </div>

          <hr className="border-border" />

          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <aside className="space-y-4">
              <h2 className="text-xl font-bold">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground">
                How we handle and protect your personal information.
              </p>
            </aside>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">1. Information We Collect</h3>
                <p>
                  We collect information provided directly by you, such as name, email address, phone number, and player details (age, experience) when you fill out our contact or registration forms.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">2. How We Use Information</h3>
                <p>
                  Data is used to manage training schedules, process payments, send program updates, and ensure player safety. We will never sell or rent your personal information to third parties.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">3. Media & Photography</h3>
                <p>
                  PR Soccer School may take photos or videos of training for promotional use on our website or social media. If you prefer your child not be photographed, please submit a written request to prsoccerschool@outlook.com.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">4. Contact Us</h3>
                <p>
                  If you have questions about these terms or wish to request data deletion, contact us at prsoccerschool@outlook.com or +1 (408) 908-9805.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Legal;
