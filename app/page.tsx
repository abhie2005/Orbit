import { ButtonLink, Card, SectionLabel } from "@/components/ui/primitives";
import { SiteHeader } from "@/components/ui/site-header";
import { WordReveal } from "@/components/ui/word-reveal";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

/** Spec §11 fixes the hero copy; everything below it is ours. */
const PROBLEM_CARDS = [
  {
    title: "The quiet student",
    body: "Speaks once in week one, then never again. Not because they have nothing to say — because there was no second opening.",
  },
  {
    title: "The project team",
    body: "Formed by who sat nearby on day one. The same four people, every group task, all semester.",
  },
  {
    title: "The professor",
    body: "Can see who is failing an assignment. Cannot see who has not spoken to another human in the room.",
  },
];

const FEATURES = [
  {
    label: "Passport",
    title: "A card, not a form",
    body: "Six short questions become a printed-looking ID card: what you can teach, what you want to learn, how you like to meet people.",
    accent: "text-amber",
  },
  {
    label: "Constellation",
    title: "Every line has a reason",
    body: "Tap any connection and read it in one plain sentence. If Orbit cannot explain it from what you both chose, it does not draw it.",
    accent: "text-blue",
  },
  {
    label: "Missions",
    title: "One person at a time",
    body: "A name, why them, and a question to open with. Skipping is free and nobody is told.",
    accent: "text-wine",
  },
  {
    label: "Bridge the class",
    title: "Groups that mix",
    body: "The professor gets groups balanced by role and skill, quietly weighted toward students who have not met anyone yet.",
    accent: "text-green",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader>
        <ButtonLink href="/professor/dashboard" variant="ghost" className="px-4 py-2 text-sm">
          Professor view
        </ButtonLink>
        <ButtonLink href="/join" variant="secondary" className="px-5 py-2 text-sm">
          Join a class
        </ButtonLink>
      </SiteHeader>

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero — type only. No graphic, by decision; see STATUS.md.          */}
        {/* ---------------------------------------------------------------- */}
        <section className="orbit-stars relative mx-auto w-full max-w-6xl px-5 pt-20 pb-28 sm:pt-28 sm:pb-32">
          <SectionLabel>First-day classroom belonging</SectionLabel>
          <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold leading-[1.03] tracking-tight sm:text-7xl">
            Find your people
            <br />
            in the room.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Orbit transforms first-day introductions into student passports and a living
            classroom constellation.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/join">Join a class</ButtonLink>
            <ButtonLink href="/professor/create" variant="secondary">
              Create a class
            </ButtonLink>
          </div>

          <p className="mt-6 text-sm text-muted">
            Demo class{" "}
            <span className="font-mono font-semibold tracking-[0.2em] text-blue">
              {DEMO_CLASSROOM.joinCode}
            </span>{" "}
            is preloaded with twelve fictional students.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Problem                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t-2 border-ink px-5 py-24">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              A semester is long.
              <br />
              <span className="text-muted">The first day is short.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Students can share a room for fifteen weeks and stay strangers. Standard
              icebreakers make a few temporary conversations and leave the quiet ones
              exactly where they started.
            </p>

            <div className="mt-14 grid gap-px overflow-hidden rounded-none border-2 border-ink bg-line/50 sm:grid-cols-3">
              {PROBLEM_CARDS.map((card) => (
                <article key={card.title} className="bg-bg p-7">
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{card.body}</p>
                </article>
              ))}
            </div>

            <p className="mt-10 text-xl font-medium sm:text-2xl">
              If nobody makes the first introduction, nobody makes it.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Manifesto — word-by-word reveal                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t-2 border-ink px-5 py-28">
          <div className="mx-auto w-full max-w-5xl">
            <WordReveal
              text="We are building a classroom where every student has one real reason to talk to someone new, where the reason is always said out loud, and where nobody is ever scored, ranked or counted for it."
              highlight={["reason", "out", "loud,", "nobody"]}
              className="text-balance text-3xl font-semibold leading-[1.25] tracking-tight sm:text-5xl sm:leading-[1.2]"
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Features                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t-2 border-ink px-5 py-24">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel>What Orbit actually does</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Four pieces. One conversation.
            </h2>

            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <Card key={feature.label} as="article" className="p-8">
                  <p
                    className={`font-mono text-xs uppercase tracking-[0.2em] ${feature.accent}`}
                  >
                    {feature.label}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{feature.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Principles                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t-2 border-ink px-5 py-24">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              The rules we refuse to break.
            </h2>

            <dl className="mt-14 divide-y divide-ink border-y-2 border-ink">
              {[
                [
                  "No popularity, anywhere",
                  "No follower counts, no rankings, no likes. Every node in the constellation is exactly the same size as every other one, always.",
                ],
                [
                  "Every match explains itself",
                  "Matching is deterministic and reads straight from what students chose. No model invents a compatibility score.",
                ],
                [
                  "Choice, not disclosure",
                  "Only a display name is required. Every other question is skippable, and skipping costs nothing.",
                ],
                [
                  "Nobody is labelled",
                  "Students with fewer connections are quietly prioritised for suggestions and never identified — not to classmates, not to the professor.",
                ],
              ].map(([title, body]) => (
                <div key={title} className="grid gap-3 py-7 sm:grid-cols-[18rem_1fr] sm:gap-10">
                  <dt className="text-lg font-semibold">{title}</dt>
                  <dd className="leading-relaxed text-muted">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Closing CTA                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-5 pb-28 pt-10">
          <div className="orbit-stars relative mx-auto w-full max-w-6xl overflow-hidden rounded-none border-2 border-ink bg-surface/50 px-8 py-20 text-center sm:px-14">
            <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Start your first day.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Answer six short questions, get your passport, and meet exactly one person.
              That is the whole job.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/join">Join a class</ButtonLink>
              <ButtonLink href="/professor/create" variant="secondary">
                Create a class
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink px-5 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>Orbit — a hackathon prototype. All student data shown is fictional.</p>
          <p>Not a production system. Not reviewed for FERPA compliance.</p>
        </div>
      </footer>
    </>
  );
}
