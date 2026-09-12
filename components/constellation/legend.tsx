"use client";

import { EDGE_CATEGORIES } from "@/lib/matching";
import type { MatchCategory } from "@/lib/types";
import { CATEGORY_GLYPH } from "./graph-types";

const ORDER: MatchCategory[] = ["complementary_skill", "academic", "social", "language"];

/**
 * Every category is identified by colour AND a glyph AND its name, so the
 * legend never depends on colour vision (spec §20).
 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-muted">
      {ORDER.map((category) => {
        const meta = EDGE_CATEGORIES[category];
        return (
          <span key={category} className="flex items-center gap-1.5">
            <span aria-hidden="true" style={{ color: meta.colorVar }}>
              {CATEGORY_GLYPH[category]}
            </span>
            <span style={{ color: meta.colorVar }}>{meta.label}</span>
          </span>
        );
      })}

      <span className="flex items-center gap-1.5">
        <svg width="26" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
        </svg>
        Suggested
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="26" height="8" aria-hidden="true">
          <line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="2" />
        </svg>
        Both confirmed they met
      </span>
    </div>
  );
}
