// ============================================================
// Normalize raw LLM JSON into valid SlideData[].
// LLMs are sloppy — this repairs field types, drops junk and
// guarantees the slide list is renderable by the engine.
// ============================================================

import type { SlideData, SlideType, BgType } from "./types";

const VALID_TYPES: SlideType[] = [
  "hook", "body", "cta", "quote", "stats", "list",
  "checklist", "process", "comparison", "image", "emoji", "number",
];

export const VALID_BGS: BgType[] = ["none", "blobs", "grid", "lines", "noise", "bignumber", "glow", "paper"];

function str(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return undefined;
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => str(x)).filter((x): x is string => !!x);
}

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseInt(str(v) ?? "", 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Pull a JSON object out of a model response that may include prose / code fences. */
export function extractJson(text: string): unknown {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // find the first '[' or '{' and last matching bracket
  const start = t.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in the model response.");
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(t.slice(start, i + 1));
      }
    }
  }
  throw new Error("Unbalanced JSON in the model response.");
}

/** Coerce one raw object into a SlideData. Returns null if unusable. */
function toSlide(raw: unknown, index: number): SlideData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  let type = str(o.type)?.toLowerCase() as SlideType | undefined;
  if (!type || !VALID_TYPES.includes(type)) {
    // tolerate common mislabels
    const guess: Record<string, SlideType> = {
      cover: "hook", intro: "body", conclusion: "cta", ending: "cta",
      checklist: "checklist", steps: "process", proscons: "body",
    };
    type = guess[str(o.type)?.toLowerCase() ?? ""];
    if (!type) type = index === 0 ? "hook" : "body";
  }

  const slide: SlideData = { type };
  const text = str(o.text);
  const title = str(o.title);
  if (text !== undefined) slide.text = text;
  if (title !== undefined) slide.title = title;
  if (o.badge) slide.badge = str(o.badge)?.slice(0, 4);
  if (o.highlight) slide.highlight = str(o.highlight);
  if (o.handle) slide.handle = str(o.handle);
  if (o.author) slide.author = str(o.author);
  if (o.role) slide.role = str(o.role);
  if (o.emoji) slide.emoji = str(o.emoji);
  if (o.bigNumber) slide.bigNumber = str(o.bigNumber);
  if (o.imageSrc) slide.imageSrc = str(o.imageSrc);
  if (o.imageCaption) slide.imageCaption = str(o.imageCaption);
  if (o.highlightStyle === "italic-box") slide.highlightStyle = "italic-box";

  if (Array.isArray(o.stats)) {
    const stats = (o.stats as unknown[])
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const so = s as Record<string, unknown>;
        const v = str(so.value) ?? str(so.num) ?? str(so.number) ?? str(so.text);
        const l = str(so.label) ?? str(so.text);
        return v ? { value: v, label: l ?? "" } : null;
      })
      .filter((x): x is { value: string; label: string } => !!x);
    if (stats.length) slide.stats = stats;
  }

  if (Array.isArray(o.items)) slide.items = strArr(o.items);
  if (Array.isArray(o.steps)) {
    const steps = (o.steps as unknown[])
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const so = s as Record<string, unknown>;
        const t = str(so.title) ?? str(so.name);
        return t ? { title: t, text: str(so.text) ?? str(so.description) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (steps.length) slide.steps = steps;
  }

  if (Array.isArray(o.points)) {
    const points = (o.points as unknown[])
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const po = p as Record<string, unknown>;
        const t = str(po.text) ?? str(po.title);
        const kind = str(po.type)?.toLowerCase();
        return t ? { type: kind === "minus" ? "minus" : "plus", text: t } : null;
      })
      .filter((x): x is { type: "plus" | "minus"; text: string } => !!x);
    if (points.length) slide.points = points;
  }

  if (o.leftLabel || o.rightLabel || Array.isArray(o.leftItems) || Array.isArray(o.rightItems)) {
    if (o.leftLabel) slide.leftLabel = str(o.leftLabel);
    if (o.rightLabel) slide.rightLabel = str(o.rightLabel);
    if (Array.isArray(o.leftItems)) slide.leftItems = strArr(o.leftItems);
    if (Array.isArray(o.rightItems)) slide.rightItems = strArr(o.rightItems);
  }

  // a slide with zero renderable content is unusable
  const hasContent =
    slide.text || slide.title || slide.points?.length || slide.items?.length ||
    slide.stats?.length || slide.steps?.length || slide.leftItems?.length ||
    slide.rightItems?.length || slide.emoji || slide.bigNumber || slide.imageSrc;
  if (!hasContent) return null;

  return slide;
}

export interface NormalizeOptions {
  handle?: string;
}

/** Convert the raw model output into a clean, renderable SlideData[]. */
export function normalizeSlides(raw: unknown, opts: NormalizeOptions = {}): SlideData[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.slides)) arr = o.slides;
    else if (Array.isArray(o.data)) arr = o.data;
  }
  if (!arr.length) throw new Error("The model returned no slides.");

  const slides: SlideData[] = [];
  for (const item of arr) {
    const s = toSlide(item, slides.length);
    if (s) slides.push(s);
  }
  if (!slides.length) throw new Error("The model returned no usable slides.");

  return ensureStructure(slides, opts);
}

/** Guarantee slide 1 is a hook and the final slide is a CTA (with handle). */
export function ensureStructure(slides: SlideData[], opts: NormalizeOptions = {}): SlideData[] {
  const out = slides.length ? [...slides] : [];

  if (out.length && out[0].type !== "hook") {
    const first = out[0];
    const hook: SlideData = { type: "hook", text: first.title || first.text || "Hook line" };
    if (first.badge) hook.badge = first.badge;
    out[0] = hook;
  }

  const last = out[out.length - 1];
  const handle = opts.handle?.trim();
  if (!last || last.type !== "cta") {
    out.push({
      type: "cta",
      text: last && (last.text || last.title) ? (last.text || last.title)! : "Save this for later.",
      handle: handle || "@username",
    });
  } else if (handle && !last.handle) {
    out[out.length - 1] = { ...last, handle };
  }

  return out;
}