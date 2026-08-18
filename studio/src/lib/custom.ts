// ============================================================
// Customization store + helpers.
// User-defined fonts, surfaces, accents, decor layers, logo and
// typography live in localStorage and are merged with the built-in
// style axes at runtime.
// ============================================================

import type {
  Accent,
  AccentOverride,
  BgKind,
  BlendMode,
  BgType,
  CustomData,
  CustomFont,
  CustomSurface,
  DecorLayer,
  DecorOverride,
  FormatId,
  LogoConfig,
  PurposeId,
  StylePreset,
  Surface,
  SurfaceOverride,
  TypographyConfig,
} from "./types";

export const STORAGE_KEY = "kerozel.custom.v1";
export const PRESETS_KEY = "kerozel.presets.v1";

// ---- defaults ----

export function defaultLogo(): LogoConfig {
  return {
    enabled: false,
    dataUrl: undefined,
    width: 160,
    x: 8,
    y: 8,
    opacity: 1,
    blend: "normal",
    rotate: 0,
    radius: 0,
    everySlide: false,
  };
}

export function defaultTypo(): TypographyConfig {
  return {
    titleSize: 0,
    titleWeight: 0,
    titleUppercase: undefined,
    titleAlign: undefined,
    bodySize: 0,
    bodyWeight: 0,
    bodyLineHeight: 0,
    bodyAlign: undefined,
    letterSpacing: 0,
    accentBlend: undefined,
  };
}

export function defaultData(): CustomData {
  return {
    fonts: [], surfaces: [], accents: [], decors: [],
    surfaceOverrides: {}, accentOverrides: {}, decorOverrides: {},
    logo: defaultLogo(), typo: defaultTypo(),
  };
}

// ---- persistence ----

export function loadCustomData(): CustomData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<CustomData>;
    return {
      fonts: parsed.fonts ?? [],
      surfaces: parsed.surfaces ?? [],
      accents: parsed.accents ?? [],
      decors: parsed.decors ?? [],
      surfaceOverrides: parsed.surfaceOverrides ?? {},
      accentOverrides: parsed.accentOverrides ?? {},
      decorOverrides: parsed.decorOverrides ?? {},
      logo: { ...defaultLogo(), ...(parsed.logo ?? {}) },
      typo: { ...defaultTypo(), ...(parsed.typo ?? {}) },
    };
  } catch {
    return defaultData();
  }
}

export function saveCustomData(data: CustomData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — ignore
  }
}

// ============================================================
// Named presets — the full state (custom assets + active axes)
// ============================================================

export interface PresetAxes {
  fontId: string;
  surfaceId: string;
  accentId: string;
  purposeId: PurposeId;
  formatId: FormatId;
  bgType: BgType;
}

export interface SavedPreset {
  id: string;
  name: string;
  savedAt: number;
  data: CustomData;
  axes: PresetAxes;
}

export function loadPresets(): SavedPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedPreset[]) : [];
  } catch {
    return [];
  }
}

export function savePresets(list: SavedPreset[]): void {
  try {
    window.localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
  } catch {
    // storage full or unavailable — ignore
  }
}

// ---- misc ----

export function uid(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export const BLEND_LABELS: Record<BlendMode, string> = {
  normal: "Normal",
  multiply: "Multiply",
  screen: "Screen",
  overlay: "Overlay",
  darken: "Darken",
  lighten: "Lighten",
  "color-dodge": "Color dodge",
  "color-burn": "Color burn",
  "hard-light": "Hard light",
  "soft-light": "Soft light",
  difference: "Difference",
  exclusion: "Exclusion",
  hue: "Hue",
  saturation: "Saturation",
  color: "Color",
  luminosity: "Luminosity",
};

// ---- font-face registration ----

/**
 * Inject a @font-face rule for a custom font (data URL).
 * Returns a cleanup function that removes the rule.
 */
export function registerFontFace(font: CustomFont): () => void {
  if (typeof document === "undefined") return () => {};
  const id = `kerozel-font-${font.id}`;
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    @font-face {
      font-family: '${font.family}';
      src: url('${font.dataUrl}') format('${font.format}');
      font-weight: 400 900;
      font-display: swap;
    }
  `;
  return () => {
    styleEl?.remove();
  };
}

// ---- surface -> CSS background ----

export interface SurfaceBgStyle {
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundBlendMode?: BlendMode;
  backgroundColor?: string;
}

/** Convert a (built-in or custom) surface into CSS background properties. */
export function surfaceToBg(
  kind: BgKind,
  solidColor: string | undefined,
  gradient: string | undefined,
  imageData: string | undefined,
  blend?: BlendMode,
  overlayColor?: string,
  overlayOpacity?: number
): SurfaceBgStyle {
  if (kind === "image" && imageData) {
    const style: SurfaceBgStyle = {
      backgroundImage: `url(${imageData})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: overlayColor && overlayOpacity ? hexA(overlayColor, overlayOpacity) : "transparent",
    };
    if (blend && blend !== "normal") style.backgroundBlendMode = blend;
    return style;
  }
  if (kind === "gradient" && gradient) {
    return { background: gradient };
  }
  return { background: solidColor || "transparent" };
}

export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function isCustomSurface(s: { id: string }): boolean {
  return s.id.startsWith("custom-");
}

// ---- built-in preset overrides ----

/** Apply a built-in surface override on top of the stock surface definition. */
export function applySurfaceOverride(s: Surface, o: SurfaceOverride | undefined): Surface {
  if (!o) return s;
  const next: Surface = {
    ...s,
    name: o.name ?? s.name,
    textColor: o.textColor ?? s.textColor,
    textSecondary: o.textSecondary ?? s.textSecondary,
    accentColor: o.accentColor ?? s.accentColor,
  };
  if (o.kind === "image" && o.imageData) {
    next.bg = o.overlayColor ?? "#0a0a0a";
    next.bgImage = { url: o.imageData, tint: o.overlayColor, blend: o.blendMode };
    delete next.bgGradient;
  } else if (o.kind === "gradient" && o.gradient) {
    next.bg = o.color ?? s.bg;
    next.bgGradient = o.gradient;
    delete next.bgImage;
  } else if (o.color) {
    next.bg = o.color;
    delete next.bgGradient;
    delete next.bgImage;
  }
  return next;
}

/** Apply a built-in accent override on top of the stock accent definition. */
export function applyAccentOverride(a: Accent, o: AccentOverride | undefined): Accent {
  if (!o) return a;
  return { ...a, name: o.name ?? a.name, color: o.color ?? a.color };
}

// ---- typography ----

/** Apply the global typography config on top of a composed style preset.
 *  Only non-sentinel values are applied (0 / undefined = keep theme default). */
export function applyTypography(preset: StylePreset, typo: TypographyConfig): StylePreset {
  const next: StylePreset = { ...preset };
  if (typo.titleSize > 0) next.titleFontSize = typo.titleSize;
  if (typo.titleWeight > 0) next.titleFontWeight = typo.titleWeight;
  if (typo.titleUppercase !== undefined) next.titleUppercase = typo.titleUppercase;
  if (typo.titleAlign !== undefined) next.titleAlign = typo.titleAlign;
  if (typo.bodySize > 0) next.bodyFontSize = typo.bodySize;
  if (typo.bodyWeight > 0) next.bodyFontWeight = typo.bodyWeight;
  if (typo.bodyLineHeight > 0) next.bodyLineHeight = typo.bodyLineHeight;
  if (typo.bodyAlign !== undefined) next.bodyAlign = typo.bodyAlign;
  if (typo.letterSpacing > 0) next.letterSpacing = typo.letterSpacing;
  if (typo.accentBlend !== undefined) next.accentBlend = typo.accentBlend;
  return next;
}

/** Resolve the effective fill for a decor layer. */
export function decorFill(
  layer: DecorLayer,
  fallback: string
): { color: string } | { background: string } {
  if (layer.fillKind === "solid" && layer.fill) return { color: layer.fill };
  if (layer.fillKind === "gradient" && layer.fill) return { background: layer.fill };
  if (layer.fillKind === "image" && layer.fill) return { background: `url(${layer.fill})` };
  return { color: fallback };
}

export type { BgKind, CustomSurface, DecorLayer, CustomFont, SurfaceOverride, AccentOverride, DecorOverride };