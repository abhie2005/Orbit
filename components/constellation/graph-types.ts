import type { Edge, Node } from "@xyflow/react";
import type { MatchCategory, Passport } from "@/lib/types";

export type StudentNodeData = {
  passport: Passport;
  isCurrent: boolean;
  /** Dimmed when a selection, hover or filter excludes this student. */
  dimmed: boolean;
  /** The hovered or selected student. Never changes node SIZE — only the ring. */
  focused: boolean;
  index: number;
  [key: string]: unknown;
};

export type StudentNode = Node<StudentNodeData, "student">;

export type ConnectionEdgeData = {
  category: MatchCategory;
  confirmed: boolean;
  dimmed: boolean;
  highlighted: boolean;
  categoryLabel: string;
  glyph: string;
  [key: string]: unknown;
};

export type ConnectionEdge = Edge<ConnectionEdgeData, "connection">;

/**
 * A redundant, non-colour channel for edge category (spec §20: never
 * communicate meaning through colour alone).
 */
export const CATEGORY_GLYPH: Record<MatchCategory, string> = {
  complementary_skill: "◆",
  academic: "●",
  social: "▲",
  language: "■",
};
