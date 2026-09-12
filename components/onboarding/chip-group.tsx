"use client";

import { optionLabel } from "@/lib/questions";
import type { QuestionKey } from "@/lib/types";

type Props = {
  questionKey: QuestionKey;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multiple: boolean;
  maxSelections?: number;
  describedBy?: string;
};

/**
 * Selectable chips. Rendered as real checkboxes/radios so keyboard and screen
 * reader users get the native behaviour for free — the styling is entirely in
 * the label (spec §20).
 */
export function ChipGroup({
  questionKey,
  options,
  selected,
  onChange,
  multiple,
  maxSelections,
  describedBy,
}: Props) {
  const atLimit =
    multiple && maxSelections !== undefined && selected.length >= maxSelections;

  function toggle(option: string) {
    if (!multiple) {
      onChange(selected[0] === option ? [] : [option]);
      return;
    }
    if (selected.includes(option)) {
      onChange(selected.filter((value) => value !== option));
    } else if (!atLimit) {
      onChange([...selected, option]);
    }
  }

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-describedby={describedBy}
      className="flex flex-wrap gap-2.5"
    >
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const isDisabled = !isSelected && atLimit;
        return (
          <label
            key={option}
            className={`cursor-pointer select-none rounded-none border px-4 py-2.5 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-blue ${
              isSelected
                ? "border-wine bg-wine/20 font-medium text-ink"
                : isDisabled
                  ? "cursor-not-allowed border-ink bg-surface-2/40 text-muted/45"
                  : "border-ink bg-surface-2 text-muted hover:border-blue/50 hover:text-ink"
            }`}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={questionKey}
              value={option}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => toggle(option)}
              className="sr-only"
            />
            {isSelected ? <span aria-hidden="true">✓ </span> : null}
            {optionLabel(questionKey, option)}
          </label>
        );
      })}
    </div>
  );
}
