"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/onboarding/chip-group";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import {
  BONUS_QUESTIONS,
  CORE_QUESTIONS,
  PROJECT_ROLE_BLURBS,
  PROJECT_ROLE_LABELS,
} from "@/lib/questions";
import { upsertCurrentStudent, useOrbit } from "@/lib/store";
import type { ProjectRole, Question, QuestionKey } from "@/lib/types";

type Answers = Partial<Record<QuestionKey, string[]>>;

const TEST_STUDENT_PRESET: Answers = {
  academicInterests: ["Machine Learning", "Web Development", "Entrepreneurship"],
  skillsOffered: ["Frontend Development", "UI/UX Design"],
  skillsWanted: ["Python", "Machine Learning"],
  hobbies: ["Gaming", "Coffee", "Photography"],
  projectRoles: ["builder"],
  meetingPreference: ["either"],
  movieGenres: ["Science Fiction", "Comedy"],
  musicGenres: ["Indie", "Hip Hop"],
  sports: ["Basketball"],
  languages: ["Spanish"],
  home: ["Atlanta, USA"],
  conversationStarter: ["Ask me what I am building at the hackathon."],
};

export function OnboardingFlow() {
  const router = useRouter();
  const { classroom } = useOrbit();
  const reduceMotion = useReducedMotion();

  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [includeBonus, setIncludeBonus] = useState(false);
  const [step, setStep] = useState(0);

  const questions = useMemo(
    () => (includeBonus ? [...CORE_QUESTIONS, ...BONUS_QUESTIONS] : [...CORE_QUESTIONS]),
    [includeBonus],
  );

  // step 0 = identity, 1..n = questions, n+1 = review
  const reviewStep = questions.length + 1;
  const totalSteps = reviewStep + 1;
  const question = step >= 1 && step <= questions.length ? questions[step - 1] : null;

  const answeredCount = Object.values(answers).filter((v) => v && v.length > 0).length;
  const canContinueIdentity = displayName.trim().length > 0;

  function setAnswer(key: QuestionKey, values: string[]) {
    setAnswers((prev) => ({ ...prev, [key]: values }));
  }

  function finish() {
    upsertCurrentStudent({ displayName, pronouns, answers });
    router.push("/passport");
  }

  function applyTestPreset() {
    setDisplayName("Test Student");
    setPronouns("they/them");
    setAnswers(TEST_STUDENT_PRESET);
    setIncludeBonus(true);
    setStep(CORE_QUESTIONS.length + BONUS_QUESTIONS.length + 1);
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <Card className="w-full max-w-2xl p-7 sm:p-9">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel>
          {classroom.courseCode} · {classroom.name}
        </SectionLabel>
        <span className="text-xs text-muted">
          {Math.min(step + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-none bg-surface-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={Math.min(step + 1, totalSteps)}
        aria-label="Onboarding progress"
      >
        <motion.div
          className="h-full rounded-none bg-wine"
          initial={false}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={transition}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={transition}
          className="mt-8 min-h-[19rem]"
        >
          {step === 0 ? (
            <IdentityStep
              displayName={displayName}
              pronouns={pronouns}
              onName={setDisplayName}
              onPronouns={setPronouns}
              onUseTestPreset={applyTestPreset}
            />
          ) : question ? (
            <QuestionStep
              question={question}
              options={optionsFor(question, answers)}
              values={answers[question.key] ?? []}
              onChange={(values) => setAnswer(question.key, values)}
            />
          ) : (
            <ReviewStep
              answeredCount={answeredCount}
              questionCount={questions.length}
              canAddBonus={!includeBonus}
              onAddBonus={() => {
                setIncludeBonus(true);
                setStep(CORE_QUESTIONS.length + 1);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3 border-t-2 border-ink pt-6">
        <Button
          variant="ghost"
          className="px-4 py-2 text-sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {question && question.optional ? (
            <Button
              variant="ghost"
              className="px-4 py-2 text-sm"
              onClick={() => {
                setAnswer(question.key, []);
                setStep((s) => s + 1);
              }}
            >
              Skip
            </Button>
          ) : null}

          {step === reviewStep ? (
            <Button onClick={finish}>Create my passport</Button>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !canContinueIdentity}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function IdentityStep({
  displayName,
  pronouns,
  onName,
  onPronouns,
  onUseTestPreset,
}: {
  displayName: string;
  pronouns: string;
  onName: (v: string) => void;
  onPronouns: (v: string) => void;
  onUseTestPreset: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        What should classmates call you?
      </h1>
      <p className="mt-2.5 text-sm text-muted">
        This is the only required answer in the whole flow.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <label htmlFor="display-name" className="text-sm font-medium">
            Display name
          </label>
          <input
            id="display-name"
            value={displayName}
            onChange={(e) => onName(e.target.value)}
            autoComplete="off"
            placeholder="Abhi"
            className="mt-2 w-full rounded-none border-2 border-ink bg-surface-2 px-4 py-3.5 text-lg text-ink placeholder:text-muted/40"
          />
        </div>

        <div>
          <label htmlFor="pronouns" className="text-sm font-medium">
            Pronouns{" "}
            <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="pronouns"
            value={pronouns}
            onChange={(e) => onPronouns(e.target.value)}
            autoComplete="off"
            placeholder="they/them"
            className="mt-2 w-full rounded-none border-2 border-ink bg-surface-2 px-4 py-3.5 text-ink placeholder:text-muted/40"
          />
        </div>
      </div>

      <div className="mt-7 border-t border-dashed border-ink/50 pt-5">
        <p className="text-xs leading-relaxed text-muted">
          Testing the demo? Load a complete fictional profile and jump to review.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full text-sm"
          onClick={onUseTestPreset}
        >
          Use test student preset
        </Button>
      </div>
    </div>
  );
}

/**
 * Offering a skill and wanting to learn the same skill is contradictory, and it
 * would produce a nonsense match reason ("they want to learn X, a skill they
 * can help with"). Each list simply hides what the other already claimed.
 */
function optionsFor(question: Question, answers: Answers): readonly string[] {
  const all = question.options ?? [];
  if (question.key === "skillsWanted") {
    const offered = new Set(answers.skillsOffered ?? []);
    return all.filter((option) => !offered.has(option));
  }
  if (question.key === "skillsOffered") {
    const wanted = new Set(answers.skillsWanted ?? []);
    return all.filter((option) => !wanted.has(option));
  }
  return all;
}

function QuestionStep({
  question,
  options,
  values,
  onChange,
}: {
  question: Question;
  options: readonly string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const helperId = `helper-${question.key}`;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {question.prompt}
      </h1>
      <p id={helperId} className="mt-2.5 text-sm text-muted">
        {question.helper}
        {question.maxSelections ? ` Up to ${question.maxSelections}.` : ""}
      </p>

      <div className="mt-7">
        {question.type === "text" ? (
          <textarea
            value={values[0] ?? ""}
            onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
            placeholder={question.placeholder}
            rows={3}
            aria-describedby={helperId}
            aria-label={question.prompt}
            className="w-full rounded-none border-2 border-ink bg-surface-2 px-4 py-3.5 text-ink placeholder:text-muted/40"
          />
        ) : question.key === "projectRoles" ? (
          <RoleCards values={values} onChange={onChange} describedBy={helperId} />
        ) : (
          <ChipGroup
            questionKey={question.key}
            options={options}
            selected={values}
            onChange={onChange}
            multiple={question.type === "chips"}
            maxSelections={question.maxSelections}
            describedBy={helperId}
          />
        )}
      </div>

      {question.usedForMatching ? null : (
        <p className="mt-5 text-xs text-muted">
          Shown on your passport. Never used to match you with anyone.
        </p>
      )}
    </div>
  );
}

function RoleCards({
  values,
  onChange,
  describedBy,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  describedBy: string;
}) {
  const roles = Object.keys(PROJECT_ROLE_LABELS) as ProjectRole[];
  return (
    <div role="radiogroup" aria-describedby={describedBy} className="grid gap-2.5 sm:grid-cols-2">
      {roles.map((role) => {
        const selected = values[0] === role;
        return (
          <label
            key={role}
            className={`cursor-pointer rounded-none border px-4 py-3.5 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-blue ${
              selected
                ? "border-wine bg-wine/15"
                : "border-ink bg-surface-2 hover:border-blue/50"
            }`}
          >
            <input
              type="radio"
              name="projectRoles"
              value={role}
              checked={selected}
              onChange={() => onChange([role])}
              className="sr-only"
            />
            <span className="block text-sm font-semibold text-ink">
              {selected ? "✓ " : ""}
              {PROJECT_ROLE_LABELS[role]}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">
              {PROJECT_ROLE_BLURBS[role]}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ReviewStep({
  answeredCount,
  questionCount,
  canAddBonus,
  onAddBonus,
}: {
  answeredCount: number;
  questionCount: number;
  canAddBonus: boolean;
  onAddBonus: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        That is everything Orbit needs.
      </h1>
      <p className="mt-2.5 text-sm text-muted">
        You answered {answeredCount} of {questionCount}. Skipped questions simply
        will not be used — they cost you nothing.
      </p>

      <ul className="mt-7 space-y-2.5 text-sm text-muted">
        {[
          "Your passport is built only from what you chose.",
          "Matching runs on your answers, not on guesses about you.",
          "Nobody can see how many connections you have.",
          "You can dismiss any suggestion without giving a reason.",
        ].map((line) => (
          <li key={line} className="flex gap-2.5">
            <span aria-hidden="true" className="text-green">
              ✓
            </span>
            {line}
          </li>
        ))}
      </ul>

      {canAddBonus ? (
        <button
          type="button"
          onClick={onAddBonus}
          className="mt-7 w-full rounded-none border border-dashed border-ink px-4 py-3.5 text-sm text-muted transition-colors hover:border-blue/60 hover:text-ink"
        >
          Add {BONUS_QUESTIONS.length} more optional questions for better matches
        </button>
      ) : null}
    </div>
  );
}
