"use client";

import { useRef, useState } from "react";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { answerStudentQuestion, type AssistantAnswer } from "@/lib/assistant";
import { useOrbit } from "@/lib/store";

type Turn = { question: string; answer: AssistantAnswer };

const SUGGESTIONS = [
  "Who can help me with frontend?",
  "Who wants to learn Python?",
  "Who else is into machine learning?",
  "Who should I talk to next?",
];

/**
 * Ask Orbit — a grounded assistant over the class's explicit answers.
 *
 * No model call and no API key: every name it returns is filtered from tags
 * students actually chose, and every name comes with the reason. That is the
 * whole point — an assistant that invents a classmate is worse than none.
 */
export function AssistantChat({ onFocusStudent }: { onFocusStudent?: (id: string) => void }) {
  const state = useOrbit();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const answer = answerStudentQuestion(trimmed, {
      students: state.students,
      connections: state.connections,
      currentStudentId: state.currentStudentId,
    });
    setTurns((prev) => [...prev, { question: trimmed, answer }]);
    setInput("");
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={logRef} className="flex-1 overflow-y-auto p-5">
        {turns.length === 0 ? (
          <div className="mx-auto max-w-xl py-8 text-center">
            <SectionLabel>Ask Orbit</SectionLabel>
            <h2 className="mt-4 text-2xl">Who should you talk to?</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
              I only name people from what they chose to share, and I always tell you
              why. I never rank anyone.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="brut-press brut-shadow-sm border-2 border-ink bg-surface px-3 py-2 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="mx-auto max-w-2xl space-y-6">
            {turns.map((turn, i) => (
              <li key={i}>
                <p className="ml-auto w-fit max-w-[85%] border-2 border-ink bg-wine px-3.5 py-2 text-sm font-medium text-bg">
                  {turn.question}
                </p>

                <div className="mt-3 border-2 border-ink bg-surface p-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {turn.answer.text}
                  </p>

                  {turn.answer.matched.length > 0 ? (
                    <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                      matched: {turn.answer.matched.join(" · ")}
                    </p>
                  ) : null}

                  {turn.answer.people.length > 0 ? (
                    <ul className="mt-4 space-y-2.5">
                      {turn.answer.people.map((person) => (
                        <li key={person.id}>
                          <button
                            type="button"
                            onClick={() => onFocusStudent?.(person.id)}
                            className="w-full border-l-4 border-wine bg-bg px-3 py-2 text-left transition-colors hover:bg-surface-2"
                          >
                            <span className="block text-sm font-bold">{person.name}</span>
                            <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                              {person.why}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t-2 border-ink p-4"
      >
        <label htmlFor="ask-orbit" className="sr-only">
          Ask Orbit a question about your class
        </label>
        <input
          id="ask-orbit"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Who can help me with frontend?"
          autoComplete="off"
          className="min-w-0 flex-1 border-2 border-ink bg-surface px-3.5 py-2.5 text-ink placeholder:text-muted/60"
        />
        <Button type="submit" className="px-5 py-2.5 text-sm" disabled={!input.trim()}>
          Ask
        </Button>
      </form>
    </div>
  );
}
