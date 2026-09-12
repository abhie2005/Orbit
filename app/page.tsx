import { ButtonLink, Card, SectionLabel } from "@/components/ui/primitives";
import { HeroConstellation } from "@/components/ui/hero-constellation";
import { SiteHeader } from "@/components/ui/site-header";
import { DEMO_CLASSROOM } from "@/lib/seed-data";

const PRINCIPLES = [
  {
    title: "Connection, not popularity",
    body: "No follower counts, no rankings, no likes. Every node in the constellation is exactly the same size as every other one.",
    accent: "text-blue",
  },
  {
    title: "Every match explains itself",
    body: "Matching is deterministic and reads straight from what students chose. If Orbit cannot say why in one sentence, it does not draw the line.",
    accent: "text-violet",
  },
  {
    title: "Choice, not disclosure",
    body: "Only a display name is required. Every other question is skippable, and students decide what appears on their passport.",
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
        <section className="orbit-stars relative mx-auto w-full max-w-6xl px-5 pt-16 pb-20 sm:pt-24">
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <SectionLabel>First-day classroom belonging</SectionLabel>
              <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Find your people
                <br />
                in the room.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Orbit transforms first-day introductions into student passports and a
                living classroom constellation.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
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
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroConstellation />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <Card key={principle.title} as="article" className="p-6">
                <h2 className={`text-base font-semibold ${principle.accent}`}>
                  {principle.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {principle.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24">
          <Card className="overflow-hidden">
            <div className="grid gap-px bg-line/60 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Answer six short questions",
                  body: "Chips and cards, not a form. Skip anything you would rather not share.",
                },
                {
                  step: "02",
                  title: "Get your passport",
                  body: "Interests, the skill you can teach, the skill you want to learn, and how you like to meet people.",
                },
                {
                  step: "03",
                  title: "Meet one person",
                  body: "Orbit hands you a name, the reason, and an opening question. That is the whole job.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-surface/70 p-7">
                  <span className="font-mono text-sm text-amber">{item.step}</span>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-line/60 px-5 py-7">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>Orbit — a hackathon prototype. All student data shown is fictional.</p>
          <p>Not a production system. Not reviewed for FERPA compliance.</p>
        </div>
      </footer>
    </>
  );
}
