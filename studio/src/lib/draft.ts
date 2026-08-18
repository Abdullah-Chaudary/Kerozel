// ============================================================
// Draft carousel persistence — the user's working slides.
// Seeded from slides.ts; overwritten after AI generation / edits.
// ============================================================

import type { SlideData } from "./types";

export const DRAFT_KEY = "kerozel.draft.v1";

export function loadDraft(): SlideData[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SlideData[]) : null;
  } catch {
    return null;
  }
}

export function saveDraft(slides: SlideData[]): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(slides));
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}