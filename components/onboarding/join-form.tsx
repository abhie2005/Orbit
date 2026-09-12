"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, SectionLabel } from "@/components/ui/primitives";
import { joinCodeMatches, useOrbit } from "@/lib/store";

export function JoinForm() {
  const router = useRouter();
  const { classroom } = useOrbit();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!joinCodeMatches(code, classroom)) {
      setError(
        `That code does not match a class on this device. The demo class code is ${classroom.joinCode}.`,
      );
      return;
    }
    router.push("/onboarding");
  }

  return (
    <Card className="w-full max-w-md p-8">
      <SectionLabel>Step 1 of 3</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Enter your class code</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Your professor is showing a six-character code. Orbit only ever shows you
        people in that one class.
      </p>

      <form onSubmit={submit} className="mt-7">
        <label htmlFor="join-code" className="text-sm font-medium text-ink">
          Class code
        </label>
        <input
          id="join-code"
          name="join-code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError(null);
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={6}
          placeholder="ORBIT7"
          aria-describedby={error ? "join-error" : "join-hint"}
          aria-invalid={error ? true : undefined}
          className="mt-2 w-full rounded-2xl border border-line bg-surface-2 px-5 py-4 text-center font-mono text-3xl tracking-[0.35em] text-ink placeholder:text-muted/40"
        />

        {error ? (
          <p id="join-error" role="alert" className="mt-3 text-sm text-amber">
            {error}
          </p>
        ) : (
          <p id="join-hint" className="mt-3 text-sm text-muted">
            Try{" "}
            <button
              type="button"
              onClick={() => setCode(classroom.joinCode)}
              className="font-mono font-semibold text-blue underline underline-offset-4"
            >
              {classroom.joinCode}
            </button>{" "}
            to enter the demo class.
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={code.length < 6}>
          Continue
        </Button>
      </form>

      <p className="mt-6 border-t border-line/70 pt-5 text-xs leading-relaxed text-muted">
        No account, no email, no password. Orbit stores your answers on this
        device for the demo and nothing is sent anywhere.
      </p>
    </Card>
  );
}
