import { usePageSEO } from "@/hooks/use-page-seo";

const plans = [
  {
    name: "Academy Monthly",
    price: "$XXX / month",
    highlight: "Most popular",
    details: ["2x training sessions per week", "Player evaluation each season", "Access to clinics with discount"],
  },
  {
    name: "Clinics & Camps",
    price: "From $XX / event",
    highlight: "Flexible",
    details: ["Seasonal events", "Skill-specific themes", "Limited spots for high reps"],
  },
  {
    name: "Private Training",
    price: "Custom pricing",
    highlight: "Individual focus",
    details: ["1-on-1 or small groups", "Position-specific work", "Tryout & showcase preparation"],
  },
];

const Pricing = () => {
  usePageSEO({
    title: "Pricing | PR Soccer School Programs & Plans",
    description:
      "View PR Soccer School pricing for academy training, clinics, camps, and private soccer sessions for youth players.",
    path: "/pricing",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Transparent plans for every family and player.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Exact pricing may vary by location and season. Use this overview as a guide and contact us for current
              rates and promotions.
            </p>
          </header>
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="container grid gap-6 py-12 md:grid-cols-3 md:py-16">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale"
            >
              <header className="mb-4 space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">{plan.name}</h2>
                <p className="text-sm text-primary">{plan.price}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{plan.highlight}</p>
              </header>
              <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                {plan.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-auto text-xs text-muted-foreground">
                For full details and current pricing, reach out through our contact form.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">FAQ</h2>
          <div className="space-y-4 text-sm text-muted-foreground md:text-base">
            <div>
              <h3 className="text-sm font-medium text-foreground md:text-base">Do you offer a free trial?</h3>
              <p>Yes. Most players start with a trial session so we can understand their level and goals.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground md:text-base">How are payments handled?</h3>
              <p>
                We typically work with monthly tuition for academy programs and separate payments for clinics and
                private sessions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground md:text-base">What happens if my child misses a class?</h3>
              <p>
                We do our best to offer make-up options when possible, depending on schedule and capacity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Pricing;
