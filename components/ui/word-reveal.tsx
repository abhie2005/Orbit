"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/**
 * Editorial manifesto type that reveals a word at a time as it scrolls in.
 *
 * Two accessibility guarantees:
 *  - the sentence is one continuous string for screen readers (`aria-label`),
 *    so it is never announced as a pile of disconnected words;
 *  - with `prefers-reduced-motion` the whole block is simply visible, with no
 *    stagger and no transform.
 */
export function WordReveal({
  text,
  className = "",
  highlight = [],
}: {
  text: string;
  className?: string;
  /** Words rendered in the accent colour. Matched case-insensitively. */
  highlight?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduceMotion = useReducedMotion();

  const words = text.split(" ");
  const accent = new Set(highlight.map((w) => w.toLowerCase().replace(/[.,]/g, "")));

  return (
    <p ref={ref} aria-label={text} className={className}>
      {words.map((word, i) => {
        const bare = word.toLowerCase().replace(/[.,]/g, "");
        const isAccent = accent.has(bare);
        return (
          <motion.span
            key={`${word}-${i}`}
            aria-hidden="true"
            className="inline-block"
            style={isAccent ? { color: "var(--orbit-wine)" } : undefined}
            initial={reduceMotion ? false : { opacity: 0.12, y: "0.25em" }}
            animate={inView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        );
      })}
    </p>
  );
}
