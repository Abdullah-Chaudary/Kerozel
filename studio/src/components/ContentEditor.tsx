"use client";

import { useState } from "react";
import type { SlideData, SlideType, SlideSvg, BlendMode } from "../lib/types";
import type { Lang } from "../lib/strings";
import { UI } from "../lib/strings";
import { BLEND_MODES, BLEND_LABELS } from "../lib/custom";
import { Area, Btn, Card, Field, SelectInput, TextInput } from "./ui";

const TYPE_OPTIONS: SlideType[] = [
  "hook", "body", "cta", "quote", "stats", "list",
  "checklist", "process", "comparison", "image", "emoji", "number",
];

function linesFrom(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function ContentEditor({
  lang,
  slides,
  onChange,
  onReset,
}: {
  lang: Lang;
  slides: SlideData[];
  onChange: (slides: SlideData[]) => void;
  onReset: () => void;
}) {
  const t = UI[lang];
  const [confirmReset, setConfirmReset] = useState(false);

  const patch = (i: number, p: Partial<SlideData>) => {
    onChange(slides.map((s, idx) => (idx === i ? { ...s, ...p } : s)));
  };

  const remove = (i: number) => onChange(slides.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const add = () => {
    const next = [...slides];
    const fresh: SlideData = { type: "body", title: "New slide", text: "New text" };
    const last = next[next.length - 1];
    if (last && last.type === "cta") next.splice(next.length - 1, 0, fresh);
    else next.push(fresh);
    onChange(next);
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    onReset();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#eee", textWrap: "balance" }}>{t.contentTitle}</h2>
          <div style={{ fontSize: 12, color: "#8a8a92", marginTop: 4 }}>
            {slides.length} · {t.contentSubtitle}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={add}>{t.addSlide}</Btn>
          <Btn variant="danger" onClick={reset}>{confirmReset ? "✓ " + t.resetDraft : t.resetDraft}</Btn>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {slides.map((slide, i) => (
          <SlideCard
            key={i}
            index={i}
            total={slides.length}
            lang={lang}
            slide={slide}
            onPatch={(p) => patch(i, p)}
            onRemove={() => remove(i)}
            onMove={(d) => move(i, d)}
          />
        ))}
      </div>
    </div>
  );
}

function SlideCard({
  index,
  total,
  lang,
  slide,
  onPatch,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  lang: Lang;
  slide: SlideData;
  onPatch: (p: Partial<SlideData>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const t = UI[lang];
  const [pointsMode, setPointsMode] = useState(!!slide.points);

  const switchType = (type: SlideType) => {
    const seed: Partial<SlideData> = { type };
    if (type === "stats" && !slide.stats?.length) seed.stats = [{ value: "", label: "" }];
    if (type === "list" && !slide.items?.length) seed.items = [""];
    if (type === "checklist" && !slide.items?.length) seed.items = [""];
    if (type === "process" && !slide.steps?.length) seed.steps = [{ title: "" }];
    if (type === "comparison" && !slide.leftItems?.length) seed.leftItems = [""];
    onPatch({ ...seed, points: type === "body" && pointsMode ? slide.points : undefined });
  };

  const hasTitle = ["body", "stats", "list", "checklist", "process", "comparison", "image", "emoji", "number"].includes(slide.type);
  const showCommon = slide.type !== "emoji";

  return (
    <Card>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div
          style={{
            background: "#26262b",
            color: "#c7c7cf",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 6,
            padding: "4px 8px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {index + 1}/{total}
        </div>
        <div style={{ width: 150 }}>
          <SelectInput value={slide.type} onChange={(e) => switchType(e.target.value as SlideType)}>
            {TYPE_OPTIONS.map((tp) => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </SelectInput>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <Btn variant="ghost" onClick={() => onMove(-1)} disabled={index === 0} style={{ padding: "6px 10px" }}>{t.moveUp}</Btn>
          <Btn variant="ghost" onClick={() => onMove(1)} disabled={index === total - 1} style={{ padding: "6px 10px" }}>{t.moveDown}</Btn>
          <Btn variant="danger" onClick={onRemove} style={{ padding: "6px 10px" }}>{t.remove}</Btn>
        </div>
      </div>

      {/* common */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
        {showCommon && (
          <Field label={t.lblBadge}>
            <TextInput value={slide.badge ?? ""} maxLength={4} onChange={(e) => onPatch({ badge: e.target.value })}
              style={{ textTransform: "uppercase" }} />
          </Field>
        )}
        <Field label={t.lblHighlight}>
          <TextInput value={slide.highlight ?? ""} onChange={(e) => onPatch({ highlight: e.target.value })} />
        </Field>
        <Field label={t.lblHighlightStyle}>
          <SelectInput
            value={slide.highlightStyle ?? "default"}
            onChange={(e) => onPatch({ highlightStyle: e.target.value === "italic-box" ? "italic-box" : "default" })}
          >
            <option value="default">{t.hlDefault}</option>
            <option value="italic-box">{t.hlItalicBox}</option>
          </SelectInput>
        </Field>
      </div>

      {/* type-specific fields */}
      {hasTitle && (
        <div style={{ marginBottom: 12 }}>
          <Field label={t.lblTitle}>
            <TextInput value={slide.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} />
          </Field>
        </div>
      )}

      {slide.type === "hook" && (
        <Field label={t.lblText}>
          <Area rows={3} value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
        </Field>
      )}

      {slide.type === "body" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Field label={t.lblBodyKind}>
              <SelectInput
                value={pointsMode ? "points" : "paragraph"}
                onChange={(e) => {
                  const m = e.target.value === "points";
                  setPointsMode(m);
                  onPatch(m ? { points: slide.points ?? [{ type: "plus", text: "" }], text: undefined }
                          : { points: undefined });
                }}
              >
                <option value="paragraph">{t.bodyParagraph}</option>
                <option value="points">{t.bodyPoints}</option>
              </SelectInput>
            </Field>
          </div>
          {pointsMode ? (
            <PointsEditor points={slide.points} onChange={(points) => onPatch({ points })} lang={lang} />
          ) : (
            <Field label={t.lblText}>
              <Area rows={3} value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
            </Field>
          )}
        </>
      )}

      {slide.type === "cta" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label={t.lblText}>
            <Area rows={3} value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
          </Field>
          <Field label={t.lblHandle}>
            <TextInput value={slide.handle ?? ""} onChange={(e) => onPatch({ handle: e.target.value })} placeholder="@username" />
          </Field>
        </div>
      )}

      {slide.type === "quote" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label={t.lblText}>
            <Area rows={3} value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.lblAuthor}>
              <TextInput value={slide.author ?? ""} onChange={(e) => onPatch({ author: e.target.value })} />
            </Field>
            <Field label={t.lblRole}>
              <TextInput value={slide.role ?? ""} onChange={(e) => onPatch({ role: e.target.value })} />
            </Field>
          </div>
        </div>
      )}

      {(slide.type === "list" || slide.type === "checklist") && (
        <Field label={t.lblItems}>
          <Area rows={Math.max(3, (slide.items?.length ?? 1))} value={(slide.items ?? []).join("\n")}
            onChange={(e) => onPatch({ items: linesFrom(e.target.value) })} />
        </Field>
      )}

      {slide.type === "stats" && (
        <StatsEditor stats={slide.stats} onChange={(stats) => onPatch({ stats })} lang={lang} />
      )}

      {slide.type === "process" && (
        <StepsEditor steps={slide.steps} onChange={(steps) => onPatch({ steps })} lang={lang} />
      )}

      {slide.type === "comparison" && (
        <ComparisonEditor slide={slide} onPatch={onPatch} lang={lang} />
      )}

      {slide.type === "image" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label={t.lblImageSrc}>
            <TextInput value={slide.imageSrc ?? ""} onChange={(e) => onPatch({ imageSrc: e.target.value })} placeholder="/images/your-file.png" />
          </Field>
          <Field label={t.lblCaption}>
            <TextInput value={slide.imageCaption ?? ""} onChange={(e) => onPatch({ imageCaption: e.target.value })} />
          </Field>
        </div>
      )}

      {slide.type === "emoji" && (
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
          <Field label={t.lblEmoji}>
            <TextInput value={slide.emoji ?? ""} onChange={(e) => onPatch({ emoji: e.target.value })} placeholder="🚀" />
          </Field>
          <Field label={t.lblText}>
            <TextInput value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
          </Field>
        </div>
      )}

      {slide.type === "number" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12 }}>
          <Field label={t.lblBigNumber}>
            <TextInput value={slide.bigNumber ?? ""} onChange={(e) => onPatch({ bigNumber: e.target.value })} placeholder="10x" />
          </Field>
          <Field label={t.lblText}>
            <TextInput value={slide.text ?? ""} onChange={(e) => onPatch({ text: e.target.value })} />
          </Field>
        </div>
      )}

      {/* per-slide SVG background */}
      <div style={{ marginTop: 16, borderTop: "1px solid #2a2a2e", paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#c7c7cf" }}>{t.svgTitle}</span>
          <span style={{ fontSize: 11, color: "#6b6b72" }}>
            {slide.svg ? (slide.svg.enabled ? "· " + t.svgEnabled : "· " + t.svgHide) : ""}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {slide.svg ? (
              <Btn variant="danger" onClick={() => onPatch({ svg: undefined })} style={{ padding: "6px 10px" }}>{t.svgRemove}</Btn>
            ) : (
              <Btn variant="ghost" onClick={() => onPatch({ svg: defaultSvg() })} style={{ padding: "6px 10px" }}>{t.svgAdd}</Btn>
            )}
          </div>
        </div>
        {slide.svg && <SvgFields svg={slide.svg} onPatch={(p) => onPatch({ svg: { ...slide.svg!, ...p } })} lang={lang} />}
      </div>
    </Card>
  );
}

function clampNum(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function defaultSvg(): SlideSvg {
  return {
    code: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.5"/></svg>',
    x: 85,
    y: 15,
    scale: 0.5,
    opacity: 0.3,
    rotate: 0,
    color: "",
    recolor: true,
    blend: "normal",
    enabled: true,
  };
}

function SvgFields({
  svg,
  onPatch,
  lang,
}: {
  svg: SlideSvg;
  onPatch: (p: Partial<SlideSvg>) => void;
  lang: Lang;
}) {
  const t = UI[lang];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 92,
            height: 92,
            flexShrink: 0,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#0f0f11",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {svg.code ? (
            <div
              style={{
                width: 80 * Math.min(Math.max(svg.scale, 0.2), 1.5),
                height: 80 * Math.min(Math.max(svg.scale, 0.2), 1.5),
                color: svg.color || "#FACC15",
                opacity: svg.opacity,
                transform: `rotate(${svg.rotate ?? 0}deg)`,
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: svg.code }} style={{ width: "100%", height: "100%" }} />
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#6b6b72" }}>—</span>
          )}
        </div>
        <Field label={t.svgCode} style={{ flex: 1, minWidth: 0 }}>
          <Area
            rows={4}
            value={svg.code}
            onChange={(e) => onPatch({ code: e.target.value })}
            placeholder={t.svgCodePh}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Field label={t.svgX}>
          <TextInput type="number" min={0} max={100} value={svg.x} onChange={(e) => onPatch({ x: clampNum(Number(e.target.value), 0, 100) })} />
        </Field>
        <Field label={t.svgY}>
          <TextInput type="number" min={0} max={100} value={svg.y} onChange={(e) => onPatch({ y: clampNum(Number(e.target.value), 0, 100) })} />
        </Field>
        <Field label={t.svgSize} hint={t.svgScaleHint}>
          <TextInput type="number" min={0.1} max={3} step={0.1} value={svg.scale} onChange={(e) => onPatch({ scale: clampNum(Number(e.target.value), 0.1, 3) })} />
        </Field>
        <Field label={t.svgOpacity}>
          <TextInput type="number" min={0} max={1} step={0.05} value={svg.opacity} onChange={(e) => onPatch({ opacity: clampNum(Number(e.target.value), 0, 1) })} />
        </Field>
        <Field label={t.svgRotate}>
          <TextInput type="number" min={-360} max={360} value={svg.rotate ?? 0} onChange={(e) => onPatch({ rotate: clampNum(Number(e.target.value), -360, 360) })} />
        </Field>
        <Field label={t.svgBlend}>
          <SelectInput value={svg.blend ?? "normal"} onChange={(e) => onPatch({ blend: e.target.value as BlendMode })}>
            {BLEND_MODES.map((b) => (
              <option key={b} value={b}>{BLEND_LABELS[b]}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t.svgColor} hint={t.svgColorPh}>
          <TextInput
            type="text"
            value={svg.color ?? ""}
            placeholder="#FACC15"
            onChange={(e) => onPatch({ color: e.target.value || undefined })}
          />
        </Field>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 12, color: "#c7c7cf", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={!!svg.recolor} onChange={(e) => onPatch({ recolor: e.target.checked })} />
          {t.svgRecolor}
        </label>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Btn variant="ghost" onClick={() => onPatch({ enabled: !svg.enabled })} style={{ padding: "6px 10px" }}>
            {svg.enabled ? t.svgHide : t.svgShow}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function PointsEditor({
  points,
  onChange,
  lang,
}: {
  points: Array<{ type: "plus" | "minus"; text: string }> | undefined;
  onChange: (p: Array<{ type: "plus" | "minus"; text: string }>) => void;
  lang: Lang;
}) {
  const t = UI[lang];
  const list = points ?? [];
  const set = (i: number, p: Partial<{ type: "plus" | "minus"; text: string }>) =>
    onChange(list.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  return (
    <Field label={t.lblText}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 110, flexShrink: 0 }}>
              <SelectInput value={p.type} onChange={(e) => set(i, { type: e.target.value as "plus" | "minus" })}>
                <option value="plus">+ plus</option>
                <option value="minus">− minus</option>
              </SelectInput>
            </div>
            <TextInput value={p.text} onChange={(e) => set(i, { text: e.target.value })} />
            <Btn variant="danger" onClick={() => onChange(list.filter((_, idx) => idx !== i))} style={{ padding: "6px 10px" }}>✕</Btn>
          </div>
        ))}
        <div>
          <Btn variant="ghost" onClick={() => onChange([...list, { type: "plus", text: "" }])}>{t.addItem}</Btn>
        </div>
      </div>
    </Field>
  );
}

function StatsEditor({
  stats,
  onChange,
  lang,
}: {
  stats: Array<{ value: string; label: string }> | undefined;
  onChange: (s: Array<{ value: string; label: string }>) => void;
  lang: Lang;
}) {
  const t = UI[lang];
  const list = stats ?? [];
  return (
    <Field label={t.lblStats}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <TextInput value={s.value} placeholder={t.lblValue} style={{ width: 160, flexShrink: 0 }}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))} />
            <TextInput value={s.label} placeholder={t.lblLabel}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} />
            <Btn variant="danger" onClick={() => onChange(list.filter((_, idx) => idx !== i))} style={{ padding: "6px 10px" }}>✕</Btn>
          </div>
        ))}
        <div>
          <Btn variant="ghost" onClick={() => onChange([...list, { value: "", label: "" }])}>{t.addItem}</Btn>
        </div>
      </div>
    </Field>
  );
}

function StepsEditor({
  steps,
  onChange,
  lang,
}: {
  steps: Array<{ title: string; text?: string }> | undefined;
  onChange: (s: Array<{ title: string; text?: string }>) => void;
  lang: Lang;
}) {
  const t = UI[lang];
  const list = steps ?? [];
  return (
    <Field label={t.lblSteps}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput value={s.title} placeholder={t.lblStepTitle} style={{ flex: 1 }}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))} />
            <TextInput value={s.text ?? ""} placeholder={t.lblStepText} style={{ flex: 1 }}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)))} />
            <Btn variant="danger" onClick={() => onChange(list.filter((_, idx) => idx !== i))} style={{ padding: "6px 10px" }}>✕</Btn>
          </div>
        ))}
        <div>
          <Btn variant="ghost" onClick={() => onChange([...list, { title: "" }])}>{t.addItem}</Btn>
        </div>
      </div>
    </Field>
  );
}

function ComparisonEditor({
  slide,
  onPatch,
  lang,
}: {
  slide: SlideData;
  onPatch: (p: Partial<SlideData>) => void;
  lang: Lang;
}) {
  const t = UI[lang];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field label={t.lblLeftLabel}>
        <TextInput value={slide.leftLabel ?? ""} onChange={(e) => onPatch({ leftLabel: e.target.value })} />
      </Field>
      <Field label={t.lblRightLabel}>
        <TextInput value={slide.rightLabel ?? ""} onChange={(e) => onPatch({ rightLabel: e.target.value })} />
      </Field>
      <Field label={t.lblLeftItems}>
        <Area rows={4} value={(slide.leftItems ?? []).join("\n")}
          onChange={(e) => onPatch({ leftItems: linesFrom(e.target.value) })} />
      </Field>
      <Field label={t.lblRightItems}>
        <Area rows={4} value={(slide.rightItems ?? []).join("\n")}
          onChange={(e) => onPatch({ rightItems: linesFrom(e.target.value) })} />
      </Field>
    </div>
  );
}