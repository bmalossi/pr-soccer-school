import { usePageSEO } from "@/hooks/use-page-seo";
import coachingFun from "@/assets/gallery-patrick-fun-2.jpg";

const About = () => {
  usePageSEO({
    title: "About PR Soccer School | Brazilian Methodology in the USA",
    description:
      "Learn about PR Soccer School, our mission, Brazilian coaching methodology, and commitment to youth player development.",
    path: "/about",
  });

  return (
    <main className="bg-background text-foreground">
      <section className="border-b bg-background">
        <div className="container space-y-4 py-10 md:py-14">
          <header className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About PR Soccer School</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Developing complete players through Brazilian-inspired training.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              PR Soccer School was created to bring the intensity, joy, and creativity of Brazilian soccer to youth
              players in the United States  in a safe, structured, and family-focused environment.
            </p>
          </header>
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="container grid gap-10 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:py-14">
          <article className="space-y-4 text-sm text-muted-foreground md:text-base">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Our Story & Mission</h2>
            <p>
              After years coaching young players, we saw a gap between club demands and the individual attention
              players truly need. PR Soccer School was born to bridge that gap, offering high-quality training focused
              on technique, decision making, and confidence with the ball.
            </p>
            <p>
              Our mission is simple: help each player reach their full potential while falling in love with the process
              of training, competing, and growing.
            </p>
            <p>
              We work closely with families to understand each player's goals  from first-time soccer experiences to
              competitive club and school teams.
            </p>
          </article>
          <aside className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Our Core Values</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Discipline:</span> We teach that effort and consistency
                matter more than talent alone.
              </li>
              <li>
                <span className="font-semibold text-foreground">Respect:</span> For teammates, opponents, referees, and
                the game itself.
              </li>
              <li>
                <span className="font-semibold text-foreground">Creativity:</span> Encouraging players to express
                themselves and make brave decisions on the ball.
              </li>
              <li>
                <span className="font-semibold text-foreground">Joy:</span> Training should be challenging, but always
                enjoyable and motivating.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="bg-background">
        <div className="container grid gap-10 py-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:py-14">
          <div className="rounded-2xl border bg-card p-2 shadow-md md:p-4">
            <div className="overflow-hidden rounded-xl">
              <img
                src={coachingFun}
                alt="Coach dressed up having fun with PR Soccer School kids on the field"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <article className="space-y-4 text-sm text-muted-foreground md:text-base">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Coaching Philosophy</h2>
            <p>
              Training sessions follow a clear structure: warm-up with the ball, technical repetition, small-sided games,
              and decision-making scenarios. Every activity has a purpose and a clear coaching point.
            </p>
            <p>
              We believe young players learn best through repetition and game-like situations  not endless lines or
              generic drills. That is why our sessions are dynamic, high-tempo, and full of touches on the ball.
            </p>
            <p>
              Safety and communication with families are at the center of everything we do. We want parents to feel
              confident that their children are in good hands, learning in a positive and professional environment.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default About;
