// ============================================================
// ✏️  EDIT THIS FILE TO CHANGE YOUR CAROUSEL CONTENT
// ============================================================
//
// This is the only file you need to touch to create a new carousel.
// The rendering engine lives in src/app/page.tsx and src/lib/*.
//
// - SLIDES: your slide content (see types for all available slide types)
// - DEFAULT_FONT:    typeface — "minimal" | "editorial" | "clean" | "mono" | "condensed"
// - DEFAULT_SURFACE: bg + text — "dark" | "white" | "light" | "paper" | "gradient" | "pastel" | "neon" | "ember"
// - DEFAULT_ACCENT:  pop color — "yellow" | "red" | "teal" | "coral" | "orange" | "violet" | "lime" | "blue" | "fuchsia" | "pink" | "amber"
// - DEFAULT_PURPOSE: layout   — "carousel" | "presentation"
// - DEFAULT_BG:      decoration — "none" | "blobs" | "grid" | "lines" | "paper" | "noise" | "bignumber" | "glow"
// - DEFAULT_FORMAT:  canvas size — "threads-4x5" | "instagram-square" | "linkedin-square" | "tiktok-9x16" | "story-9x16" | "wide-16x9"
//
// Demo below showcases all 12 slide types:
//   hook / body / list / stats / quote / checklist / process / comparison / cta / image / emoji / number
// body slides also support `points` — a list of { type: "plus" | "minus", text } rendered with SVG check/cross icons
// image slides use `imageSrc: "/images/your-file.png"` (drop PNG/JPG into template/public/images/)
// highlight can be styled with `highlightStyle: "italic-box"` — Playfair italic on a colored rectangle
// ============================================================

import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    type: "hook",
    text: "The 5-step framework\nbehind every post\nthat performs",
    highlight: "5-step framework",
  },
  {
    type: "body",
    badge: "01",
    title: "Why most posts fail",
    text: "People post for 30 days,\nsee nothing, and quit.\nThe problem isn't effort.\nIt's structure.",
  },
  {
    type: "body",
    badge: "02",
    title: "Step 1 — Hook last",
    text: "Write the full post first.\nThen craft a hook\nthat earns the read.",
    highlight: "Hook last",
  },
  {
    type: "body",
    badge: "03",
    title: "Step 2 — One idea",
    text: "The #1 reader-killer is\nsaying too much.\nPick one insight. Build\neverything around it.",
  },
  {
    type: "list",
    badge: "04",
    title: "Steps 3–5",
    items: [
      "Short lines — 2 max per paragraph",
      "One specific detail as proof",
      "End with a clear action",
    ],
  },
  {
    type: "stats",
    title: "Why it works",
    stats: [
      { value: "2–3×", label: "More comments with a CTA" },
      { value: "80%", label: "Of LinkedIn read on mobile" },
    ],
  },
  {
    type: "quote",
    text: "Great posts aren't written.\nThey're structured.",
    author: "carousel takeaway",
  },
  {
    type: "cta",
    text: "Save this framework.\nUse it on your next post.",
    handle: "@yourhandle",
  },
];

export const DEFAULT_FONT: FontId = "minimal";
export const DEFAULT_SURFACE: SurfaceId = "dark";
export const DEFAULT_ACCENT: AccentId = "yellow";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "glow";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
// For a presentation: set DEFAULT_PURPOSE = "presentation" and DEFAULT_FORMAT = "wide-16x9"
// Great combos to try:
//   dark + teal (noir)         ember + lime (announcement)
//   paper + orange (literary)  light + teal (calm info)
//   white + coral (editorial)  pastel + fuchsia (playful)
//   gradient + amber (glow)    neon + violet (tech)
