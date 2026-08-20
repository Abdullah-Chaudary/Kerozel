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
    text: "7 AI workflows\nthat save you\nhours every week",
    highlight: "7 AI workflows",
    svg: {
      code: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 26 V50 L66 60" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "01",
    title: "Meeting notes",
    text: "AI transcribes, summarizes, and assigns\naction items with owners & deadlines.\n≈57 min saved per meeting.",
    highlight: "Meeting notes",
    svg: {
      code: '<svg viewBox="0 0 100 100"><g fill="currentColor"><rect x="10" y="20" width="55" height="10" rx="5"/><rect x="10" y="45" width="55" height="10" rx="5"/><rect x="10" y="70" width="55" height="10" rx="5"/></g><path d="M70 25 l6 6 14-14" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "02",
    title: "Email triage",
    text: "AI sorts your inbox, flags priorities,\nand drafts replies in your voice.\nWorkers save 6–10 hrs per week.",
    highlight: "Email triage",
    svg: {
      code: '<svg viewBox="0 0 100 100"><rect x="12" y="25" width="76" height="50" rx="8" fill="none" stroke="currentColor" stroke-width="8"/><path d="M12 30 L50 58 L88 30" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "03",
    title: "Content repurposing",
    text: "One video or post becomes 30+ assets\nfor every platform you publish on.\nSaves 6–8 hrs per week.",
    highlight: "Content repurposing",
    svg: {
      code: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 16 A34 34 0 0 1 84 50" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M84 40 v10 h-10" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "04",
    title: "Research & summaries",
    text: "AI reads long documents and briefs you\nwith the answers you actually need.\nMinutes, not hours.",
    highlight: "Research",
    svg: {
      code: '<svg viewBox="0 0 100 100"><circle cx="42" cy="42" r="26" fill="none" stroke="currentColor" stroke-width="8"/><path d="M62 62 L86 86" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "05",
    title: "Data & reports",
    text: "Spreadsheets become live dashboards\nand weekly reports — automatically.",
    highlight: "Data & reports",
    svg: {
      code: '<svg viewBox="0 0 100 100"><rect x="16" y="52" width="14" height="32" rx="4" fill="currentColor"/><rect x="40" y="34" width="14" height="50" rx="4" fill="currentColor"/><rect x="64" y="18" width="14" height="66" rx="4" fill="currentColor"/><path d="M10 88 H90" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "06",
    title: "Admin & scheduling",
    text: "Meeting coordination drops from\n3–5 hours to 15 minutes of approvals.",
    highlight: "Admin & scheduling",
    svg: {
      code: '<svg viewBox="0 0 100 100"><rect x="12" y="20" width="76" height="64" rx="8" fill="none" stroke="currentColor" stroke-width="8"/><path d="M12 40 H88" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M34 10 v20 M66 10 v20" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M34 60 l10 10 18-20" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "body",
    badge: "07",
    title: "Support & CRM",
    text: "AI triages inquiries and logs every\ninteraction straight into your CRM.",
    highlight: "Support & CRM",
    svg: {
      code: '<svg viewBox="0 0 100 100"><rect x="12" y="22" width="76" height="46" rx="14" fill="none" stroke="currentColor" stroke-width="8"/><path d="M32 68 v14 a6 6 0 0 0 6 6 h18" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><circle cx="40" cy="45" r="5" fill="currentColor"/><circle cx="60" cy="45" r="5" fill="currentColor"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "stats",
    title: "The payoff",
    stats: [
      { value: "11+ hrs", label: "avg. worker spends on email weekly" },
      { value: "240+ hrs", label: "reclaimed per year with AI assistance" },
      { value: "90%", label: "less time on repetitive content" },
    ],
    svg: {
      code: '<svg viewBox="0 0 100 100"><path d="M10 84 L42 52 L60 66 L90 22" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M68 22 H90 V44" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "checklist",
    badge: "start",
    title: "Start this week",
    items: [
      "Pick ONE repetitive task",
      "Add AI — keep a human review step",
      "Measure the hours you get back",
      "Scale to the next workflow",
    ],
    svg: {
      code: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="8"/><path d="M34 52 l11 11 22-24" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
  {
    type: "cta",
    text: "Automate the busywork.\nKeep the thinking.",
    handle: "@yourhandle",
    svg: {
      code: '<svg viewBox="0 0 100 100"><path d="M58 8 L24 56 h22 l-6 36 38-50 H54 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      x: 86,
      y: 80,
      scale: 0.45,
      opacity: 0.35,
      recolor: true,
      enabled: true,
    },
  },
];

export const DEFAULT_FONT: FontId = "clean";
export const DEFAULT_SURFACE: SurfaceId = "light";
export const DEFAULT_ACCENT: AccentId = "teal";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "grid";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
// For a presentation: set DEFAULT_PURPOSE = "presentation" and DEFAULT_FORMAT = "wide-16x9"
// Great combos to try:
//   dark + teal (noir)         ember + lime (announcement)
//   paper + orange (literary)  light + teal (calm info)
//   white + coral (editorial)  pastel + fuchsia (playful)
//   gradient + amber (glow)    neon + violet (tech)
