import { usePageSEO } from "@/hooks/use-page-seo";

const programs = [
  {
    name: "Energy Boost Break",
    ages: "All Ages",
    level: "All Levels",
    frequency: "",
    focus: "We offer snacks and plenty of hydration during the practice break.",
  },
  {
    name: "Where Energy Meets Fun",
    ages: "All Ages",
    level: "All Levels",
    frequency: "",
    focus: "High-energy, fun-filled practices that keep our mini champions happy and engaged.",
  },
  {
    name: "Private & Small Group Training",
    ages: "All Ages",
    level: "All Levels",
    frequency: "Custom schedule",
    focus: "Individualized plans for position-specific work, tryout prep, and confidence building.",
  },
  {
    name: "Goalkeeper Training",
    ages: "All Ages",
    level: "All Levels",
    frequency: "Weekly",
    focus: "Footwork, handling, positioning, and game situations for modern keepers.",
  },
];

const Programs = () => {
  usePageSEO({
    title: "Programs | PR Soccer School Youth Training",
    description:
      "Explore PR Soccer School programs: Academy, clinics, camps, private training, and goalkeeper sessions for youth players.",
    path: "/programs",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Programs</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Find the right program for your player&apos;s age and ambition.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              All programs follow the same philosophy: high-quality coaching, lots of ball contact, and a positive
              competitive environment.
            </p>
          </header>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container grid gap-6 py-12 md:grid-cols-2 md:py-16">
          {programs.map((program) => (
            <article
              key={program.name}
              className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-md hover-scale"
            >
              <header className="mb-3 space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">{program.name}</h2>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{program.ages}</p>
              </header>
              <dl className="mb-4 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt className="font-medium text-foreground">Level</dt>
                  <dd>{program.level}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-foreground">Frequency</dt>
                  <dd>{program.frequency}</dd>
                </div>
              </dl>
              <p className="mb-4 text-sm text-muted-foreground">{program.focus}</p>
              <p className="mt-auto text-sm text-primary">
                Interested in this program? Mention it in your request on the contact page.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Programs;
