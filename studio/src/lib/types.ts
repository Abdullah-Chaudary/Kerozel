// ============================================================
// Shared type definitions for carousel slides and presets.
// Imported by both page.tsx (browser preview) and any future
// server-side renderer (e.g. Satori export script).
// ============================================================

export type SlideType =
  | "hook"
  | "body"
  | "cta"
  | "quote"
  | "stats"
  | "list"
  | "checklist"
  | "process"
  | "comparison"
  | "image"
  | "emoji"
  | "number";

export type BgType =
  | "none"
  | "blobs"
  | "grid"
  | "lines"
  | "noise"
  | "bignumber"
  | "glow"
  | "paper";

export type FormatId =
  | "threads-4x5"
  | "instagram-square"
  | "linkedin-square"
  | "tiktok-9x16"
  | "story-9x16"
  | "wide-16x9";

// ---- Three independent style axes ----

/** Font / typeface selection */
export type FontId = "minimal" | "editorial" | "clean" | "mono" | "condensed";

/** Surface — bg + text neutrals (no pop color). */
export type SurfaceId =
  | "dark"
  | "white"
  | "light"
  | "paper"
  | "gradient"
  | "pastel"
  | "neon"
  | "ember";

/** Accent — the pop color used for highlighted words. */
export type AccentId =
  | "yellow"
  | "red"
  | "teal"
  | "coral"
  | "orange"
  | "violet"
  | "lime"
  | "blue"
  | "fuchsia"
  | "pink"
  | "amber";

/** Layout purpose — drives typography scale */
export type PurposeId = "carousel" | "presentation";

export interface FontStyle {
  id: string;
  name: string;
  fontFamily: string;
  hookFontFamily?: string;
}

export interface BgImage {
  /** image URL or data URL */
  url: string;
  /** tint color layered under the image */
  tint?: string;
  /** CSS background-blend-mode for the image against the tint */
  blend?: BlendMode;
}

export interface Surface {
  id: string;
  name: string;
  bg: string;
  bgGradient?: string;
  bgImage?: BgImage;
  textColor: string;
  textSecondary: string;
  /** Color used for titles, dividers, badges. For most surfaces equals textColor. */
  accentColor: string;
}

export interface Accent {
  id: string;
  name: string;
  /** Color used for highlighted words. */
  color: string;
}

// ---- Slide data ----

/** A single decorative SVG placed in the background of one slide. */
export interface SlideSvg {
  /** Raw inline SVG markup (a full `<svg viewBox="0 0 100 100">…</svg>`). */
  code: string;
  /** Horizontal anchor, percent of canvas width (center of the box). */
  x: number;
  /** Vertical anchor, percent of canvas height (center of the box). */
  y: number;
  /** Scale factor (0.1–3) relative to half of the smaller canvas edge. */
  scale: number;
  /** Opacity 0–1. */
  opacity: number;
  /** Rotation in degrees. */
  rotate?: number;
  /** Optional recolor — when empty the theme accent color is used. */
  color?: string;
  /** Force-tint every shape in the SVG to `color` (overrides hardcoded fills). */
  recolor?: boolean;
  /** Blend mode. */
  blend?: BlendMode;
  enabled: boolean;
}

export interface SlideData {
  type: SlideType;
  text?: string;
  title?: string;
  badge?: string;
  highlight?: string;
  handle?: string;
  // quote
  author?: string;
  role?: string;
  // stats
  stats?: { value: string; label: string }[];
  // list / checklist
  items?: string[];
  // process
  steps?: { title: string; text?: string }[];
  // comparison
  leftLabel?: string;
  leftItems?: string[];
  rightLabel?: string;
  rightItems?: string[];
  // icon points (plus/minus list with SVG icons)
  points?: Array<{ type: "plus" | "minus"; text: string }>;
  // image slide — put file into /public/images/ and reference as "/images/file.png"
  imageSrc?: string;
  imageCaption?: string;
  // emoji slide — single grapheme rendered large
  emoji?: string;
  // number slide — big hero number/string like "17", "5K+", "№1"
  bigNumber?: string;
  // highlight variant — "italic-box" renders highlighted word in Playfair italic on colored box
  highlightStyle?: "default" | "italic-box";
  // per-slide decorative SVG placed in the background (AI-generated or user-added)
  svg?: SlideSvg;
  // ---- per-slide text overrides (optional, applied on top of global typography) ----
  align?: TextAlign;
  textColor?: string;
  fontFamily?: string;
  titleSize?: number;
  bodySize?: number;
  titleUppercase?: boolean;
}

// ---- Internal composed type used by all slide components ----
// Built by composePreset(font, color, purpose) in presets.ts.

export interface StylePreset {
  id: string;
  name: string;
  bg: string;
  bgGradient?: string;
  bgImage?: BgImage;
  textColor: string;
  textSecondary: string;
  accentColor: string;
  highlightColor: string;
  fontFamily: string;
  hookFontFamily?: string;
  // Title overrides — defaults: 44px, 800, uppercase, accentColor, divider visible
  titleFontSize?: number;
  titleFontWeight?: number;
  titleUppercase?: boolean;
  titleDivider?: boolean;
  titleColor?: string;
  // Body text overrides — defaults: 600, textColor, lineHeight 1.2
  bodyFontWeight?: number;
  bodyColor?: string;
  bodyLineHeight?: number;
  bodyFontSize?: number; // override for adaptive body sizing
  // Alignment & spacing
  titleAlign?: TextAlign;
  bodyAlign?: TextAlign;
  letterSpacing?: number;
  bodyLetterSpacing?: number;
  // Blend mode applied to highlighted/accent text
  accentBlend?: BlendMode;
}

export interface FormatPreset {
  id: FormatId;
  name: string;
  w: number;
  h: number;
  platform: string;
}

// ============================================================
// CUSTOMIZATION ASSETS (user-defined, persisted in localStorage)
// ============================================================

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export type BgKind = "solid" | "gradient" | "image";

export type TextAlign = "left" | "center" | "right";

/** A user-uploaded font registered via @font-face (data URL). */
export interface CustomFont {
  id: string;
  /** Display name shown in the Font menu (file name without extension). */
  name: string;
  /** CSS @font-face family name. */
  family: string;
  /** Font file as a data URL. */
  dataUrl: string;
  format: "woff2" | "woff" | "ttf" | "otf";
}

/** A user-defined background (solid / gradient / image) with text colors. */
export interface CustomSurface {
  id: string;
  name: string;
  kind: BgKind;
  /** solid kind */
  color?: string;
  /** gradient kind — full CSS background string */
  gradient?: string;
  /** image kind — data URL */
  imageData?: string;
  /** image kind — blend of the image against the overlay color */
  blendMode?: BlendMode;
  /** image kind — tint color layered under the image */
  overlayColor?: string;
  /** image kind — 0..1 */
  overlayOpacity?: number;
  textColor: string;
  textSecondary: string;
  accentColor: string;
}

/** A user-defined accent (pop color for highlights). */
export interface CustomAccent {
  id: string;
  name: string;
  color: string;
}

/** Edits applied on top of a built-in surface (dark / white / …). */
export interface SurfaceOverride {
  name?: string;
  kind?: BgKind;
  /** solid kind */
  color?: string;
  /** gradient kind */
  gradient?: string;
  /** image kind */
  imageData?: string;
  blendMode?: BlendMode;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  textSecondary?: string;
  accentColor?: string;
  /** hide the surface from the Surface menu */
  hidden?: boolean;
}

/** Edits applied on top of a built-in accent (yellow / red / …). */
export interface AccentOverride {
  name?: string;
  color?: string;
  /** hide the accent from the Accent menu */
  hidden?: boolean;
}

/** Edits applied on top of a built-in background decoration (blobs / grid / …). */
export interface DecorOverride {
  /** overrides the accent color the decoration is drawn with */
  color?: string;
  opacity?: number;
  size?: number;
  /** hide the decoration from the Background menu */
  enabled?: boolean;
}

/** A single decoration layer, stackable with others. */
export interface DecorLayer {
  id: string;
  type: BgType;
  /** where the fill color comes from: accent, a solid color, a gradient, or an image */
  fillKind: "auto" | "solid" | "gradient" | "image";
  /** solid color / gradient CSS / image data URL (used when fillKind != auto) */
  fill?: string;
  opacity: number; // 0..1
  blend: BlendMode;
  size: number; // 0.1..3 scale factor
  enabled: boolean;
}

/** Global logo / watermark overlay. */
export interface LogoConfig {
  enabled: boolean;
  dataUrl?: string;
  width: number; // px in canvas space
  x: number; // percent of canvas width (center anchor)
  y: number; // percent of canvas height (center anchor)
  opacity: number; // 0..1
  blend: BlendMode;
  rotate: number; // degrees
  radius: number; // border radius px
  everySlide: boolean; // show on every slide vs. only the CTA slide
}

/** Global typography overrides applied on top of the style preset.
 *  Sentinel semantics: numeric fields use 0 for "keep the theme default";
 *  boolean/align/blend fields use `undefined` for "keep the theme default". */
export interface TypographyConfig {
  titleSize: number; // px, 0 = theme default
  titleWeight: number; // 0 = theme default
  titleUppercase?: boolean; // undefined = theme default
  titleAlign?: TextAlign; // undefined = theme default
  bodySize: number; // px, 0 = theme default (adaptive)
  bodyWeight: number; // 0 = theme default
  bodyLineHeight: number; // 0 = theme default
  bodyAlign?: TextAlign; // undefined = theme default
  letterSpacing: number; // em, 0 = theme default
  accentBlend?: BlendMode; // undefined = theme default
}

/** Everything the user has customized. Persisted as a whole. */
export interface CustomData {
  fonts: CustomFont[];
  surfaces: CustomSurface[];
  accents: CustomAccent[];
  decors: DecorLayer[];
  logo: LogoConfig;
  typo: TypographyConfig;
  /** edits applied to built-in surfaces, keyed by built-in id */
  surfaceOverrides?: Record<string, SurfaceOverride>;
  /** edits applied to built-in accents, keyed by built-in id */
  accentOverrides?: Record<string, AccentOverride>;
  /** edits applied to built-in background decorations, keyed by BgType */
  decorOverrides?: Record<string, DecorOverride>;
}
