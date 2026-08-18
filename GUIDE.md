# Kerozel Carousel — Complete User Guide

## 1. What this setup is

Three layers, one product:

| Layer | What it does | Lives at |
|---|---|---|
| **Copywriting skill** | Turns a topic into slide-by-slide copy (cover/context/body/CTA) | `~/.config/opencode/skills/social-carousel-writer/` |
| **Rendering engine + skill** | Renders the copy as styled slides (12 types, 6 formats, 640 style combos), serves a live preview, exports PNG/PDF | `~/.config/opencode/skills/threads-carousel/` + `~/carousel-studio/` |
| **Carousel agent** | Chains both: writes copy → maps it into `slides.ts` → starts the preview | `~/.config/opencode/agent/carousel.md` |
| **GitHub backup** | Publishes the studio so you can redeploy/share | `github.com/Abdullah-Chaudary/Kerozel` (public, `master`) |

The engine is a Next.js + TypeScript app ("the studio"). **You only ever edit `src/slides.ts`** — the engine files stay untouched.

## 2. The three ways to use it

### A. Fast path — ask the agent (recommended)
In opencode, just say:
> "Make me a 8-slide LinkedIn carousel about [topic]. Font `clean`, white surface, teal accent, handle `@you`."

The agent will: write the copy → inject it into `slides.ts` → start the dev server → hand you `http://localhost:3333`. You review in the browser and export. For changes, tell it and it re-edits `slides.ts` only (hot-reloads).

It follows the rules in the skills: hook = catchiest line, body = one idea ≤40 words, mix in `list`/`stats`/`quote`/`comparison`, last slide = CTA with handle.

### B. Manual — edit `slides.ts` yourself
Run the dev server, edit the file, refresh:
```powershell
cd ~/carousel-studio
bun dev --port 3333        # then open http://localhost:3333
```

### C. Live styling — the browser UI (no code)
Everything below is also switchable live in the preview and persists in your browser (`localStorage` keys `kerozel.custom.v1`, `kerozel.presets.v1`).

## 3. The studio UI

**Toolbar rows** (choose one per axis):
- **Format** — canvas size: `threads-4x5` (1080×1350, Threads/IG, default) · `instagram-square` / `linkedin-square` (1080×1080) · `tiktok-9x16` / `story-9x16` (1080×1920) · `wide-16x9` (1920×1080, presentations)
- **Mode (purpose)** — `carousel` (44px UPPERCASE titles, accent divider) or `presentation` (72px sentence-case, no divider)
- **Font** — `minimal` (Unbounded, default) · `editorial` (Playfair) · `clean` (Inter) · `mono` (JetBrains Mono) · `condensed` (Oswald)
- **Surface** — `dark` · `white` · `light` · `paper` · `gradient` · `pastel` · `neon` · `ember`
- **Accent** — `yellow` · `red` · `teal` · `coral` · `orange` · `violet` · `lime` · `blue` · `fuchsia` · `pink` · `amber`
- **Background** — decoration on top of the surface: `none` · `blobs` · `grid` · `lines` · `paper` (ruled) · `noise` · `bignumber` · `glow` (default)
- **RU / EN** — toolbar language toggle (top-right)

Nice combos: `dark+teal` (noir), `paper+orange` (literary), `ember+lime` (announcement), `white+coral` (editorial), `pastel+fuchsia` (playful).

**Customize panel** (button in the toolbar) — per-card sections:
- **Presets** — save the *entire* state (fonts + backgrounds + accents + decor + logo + typography + all 6 selected axes) under a name; Load / Delete; Download / Import as JSON to move presets between browsers.
- **Typography** — title size/weight/case/align/spacing, body size/weight/line-height/align, accent blend.
- **Custom fonts** — upload `woff2/woff/ttf/otf`; applied as a new font option.
- **Backgrounds** — custom solid, gradient (visual editor with color stops + angle + code mode), or image (tint + blend).
- **Accents** — your own colors.
- **Decor layers** — stackable background decorations with fill/blend/opacity/size.
- **Logo / watermark** — position, size, opacity, blend, rotation, corner radius, "every slide" toggle.

**Export**:
- Click any slide thumbnail → download just that slide as PNG.
- **PNG** button → every slide as `01-hook.png`, `02-body.png`, …
- **PDF** button → all slides in one file.

## 4. `slides.ts` reference

Top of the file sets defaults:
```ts
export const DEFAULT_FONT: FontId = "minimal";
export const DEFAULT_SURFACE: SurfaceId = "dark";
export const DEFAULT_ACCENT: AccentId = "yellow";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "glow";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
```

**12 slide types** in the `SLIDES` array:

| Type | Use | Required fields |
|---|---|---|
| `hook` | Opening — catchiest line | `text` |
| `body` | Title + paragraph (≤40 words) | `title`, `text` |
| `body` w/ `points` | Pros/cons with ✓/✗ SVG icons | `title`, `points: {type:"plus"\|"minus", text}[]` |
| `list` | Numbered items | `title`, `items[]` |
| `stats` | Big numbers | `title`, `stats: {value, label}[]` |
| `quote` | Pulled quote | `text`, `author` |
| `checklist` | Checkmark bullets | `title`, `items[]` |
| `process` | Numbered steps w/ connector | `title`, `steps[]` |
| `comparison` | Before/after, VS | `leftLabel`, `leftItems[]`, `rightLabel`, `rightItems[]` |
| `cta` | Final call to action | `text`, `handle` |
| `image` | Screenshot/photo | `imageSrc` (file in `public/images/`), optional `title`, `imageCaption` |
| `emoji` | Giant emoji + text | `emoji`, optional `title`, `text` |
| `number` | Huge hero number | `bigNumber`, optional `title`, `text` |

**Common options** on any slide: `badge` ("01", "TIP", max 4 chars), `highlight` (1–2 words tinted in accent color), `highlightStyle: "italic-box"` (Playfair italic on a colored rectangle).

**Per-slide overrides** (optional): `align`, `textColor`, `fontFamily`, `titleSize`, `bodySize`, `titleUppercase`.

**Images**: copy the file to `~/carousel-studio/public/images/`, reference as `imageSrc: "/images/<file>.png"`. No external URLs (export blanks them).

## 5. Commands cheat sheet

```powershell
cd ~/carousel-studio
bun install                  # one-time
bun dev --port 3333          # preview at http://localhost:3333
bunx tsc --noEmit            # typecheck content before finishing
```

For parallel carousels: copy the folder to `carousel-studio-2` and run on port 3334.

## 6. Repo / backup

- Live work: `~/carousel-studio`
- Git repo: this repo (`studio/` is the mirror) → push to `github.com/Abdullah-Chaudary/Kerozel`
- Sync changed files studio→repo, then `git add …`, `git commit`, `git push origin master`.

## 7. Troubleshooting

- **Preview already running on 3333** — edit `slides.ts` and refresh; no restart needed.
- **Slides don't update** — check for a `tsc` error in the file; the dev server reports it in the terminal.
- **Image slide blank in export** — image isn't in `public/images/` or uses an external URL.
- **Text overflowing** — shorten copy (≤40 words/5 lines) or add an extra slide; mixing more types usually fixes crowded decks.
