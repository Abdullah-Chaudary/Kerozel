"use client";

import { useRef, useState } from "react";
import type {
  BlendMode,
  BgType,
  CustomAccent,
  CustomData,
  CustomFont,
  CustomSurface,
  DecorLayer,
  TextAlign,
} from "../lib/types";
import { BLEND_LABELS, BLEND_MODES, defaultTypo, uid } from "../lib/custom";
import GradientEditor, { ColorField, Slider } from "./GradientEditor";

// ============================================================
// Control primitives (dark theme)
// ============================================================

const inp: React.CSSProperties = {
  background: "#1c1c1e",
  color: "#eee",
  border: "1px solid #333",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 12,
  fontFamily: "inherit",
};
const btn: React.CSSProperties = {
  ...inp,
  cursor: "pointer",
};

function Section({
  title,
  children,
  right,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      style={{
        background: "#17171a",
        border: "1px solid #26262a",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        gridColumn: wide ? "1 / -1" : undefined,
        minWidth: 0,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3
          style={{
            margin: 0,
            flex: 1,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9a9aa3",
          }}
        >
          {title}
        </h3>
        {right}
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>{children}</div>
    </section>
  );
}

function Row({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#9a9aa3", minWidth: 96, flexShrink: 0 }}>{labelText}</span>
      {children}
    </div>
  );
}

function Num({
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
  width = 64,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ...inp, width }}
    />
  );
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            ...btn,
            padding: "5px 10px",
            background: value === o.v ? "#6366F1" : "transparent",
            borderColor: value === o.v ? "#6366F1" : "#333",
            color: value === o.v ? "#fff" : "#bbb",
            fontSize: 11,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function BlendSel({ value, onChange }: { value: BlendMode; onChange: (v: BlendMode) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BlendMode)}
      style={{ ...inp, width: 150, flexShrink: 0 }}
    >
      {BLEND_MODES.map((m) => (
        <option key={m} value={m}>
          {BLEND_LABELS[m]}
        </option>
      ))}
    </select>
  );
}

function Value({ children, width = 38 }: { children: React.ReactNode; width?: number }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: "#8a8a92",
        width,
        flexShrink: 0,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </span>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ============================================================
// Panel
// ============================================================

const DECOR_TYPES: BgType[] = ["blobs", "grid", "lines", "paper", "noise", "bignumber", "glow"];
const DECOR_LABELS: Record<string, string> = {
  blobs: "Blobs", grid: "Grid", lines: "Lines", paper: "Ruled",
  noise: "Noise", bignumber: "Bignumber", glow: "Glow",
};

export default function Customizer({
  data,
  onChange,
}: {
  data: CustomData;
  onChange: (d: CustomData) => void;
}) {
  const [addingSurface, setAddingSurface] = useState<"solid" | "gradient" | "image" | null>(null);
  const [surfaceName, setSurfaceName] = useState("");
  const [solidColor, setSolidColor] = useState("#1a1a2e");
  const [gradCss, setGradCss] = useState("linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)");
  const [imgData, setImgData] = useState<string | undefined>();
  const [imgOverlay, setImgOverlay] = useState("#000000");
  const [imgOverlayOp, setImgOverlayOp] = useState(0.3);
  const [imgBlend, setImgBlend] = useState<BlendMode>("normal");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textSecondary, setTextSecondary] = useState("rgba(255,255,255,0.55)");
  const [accentColor, setAccentColor] = useState("#FACC15");
  const fontInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [accentName, setAccentName] = useState("");
  const [newAccentColor, setNewAccentColor] = useState("#FACC15");

  const t = data.typo;
  const set = (patch: Partial<CustomData>) => onChange({ ...data, ...patch });

  const updateFonts = (fonts: CustomFont[]) => set({ fonts });
  const updateSurfaces = (surfaces: CustomSurface[]) => set({ surfaces });
  const updateAccents = (accents: CustomAccent[]) => set({ accents });
  const updateDecors = (decors: DecorLayer[]) => set({ decors });
  const setLogo = (patch: Partial<CustomData["logo"]>) => set({ logo: { ...data.logo, ...patch } });
  const setTypo = (patch: Partial<CustomData["typo"]>) => set({ typo: { ...t, ...patch } });

  const addFont = async (file: File) => {
    const ext = file.name.toLowerCase().split(".").pop();
    const format = ext === "woff" ? "woff" : ext === "woff2" ? "woff2" : ext === "otf" ? "otf" : "ttf";
    const name = file.name.replace(/\.[^.]+$/, "");
    const family = name.replace(/[^\w -]/g, "").replace(/\s+/g, " ").trim();
    const dataUrl = await readFileAsDataUrl(file);
    updateFonts([...data.fonts, { id: uid(), name, family, dataUrl, format }]);
  };

  const addSolidSurface = () => {
    if (!surfaceName.trim()) return;
    updateSurfaces([
      ...data.surfaces,
      {
        id: uid(), name: surfaceName.trim(), kind: "solid", color: solidColor,
        textColor, textSecondary, accentColor,
      },
    ]);
    setSurfaceName("");
    setAddingSurface(null);
  };

  const addGradientSurface = () => {
    if (!surfaceName.trim()) return;
    updateSurfaces([
      ...data.surfaces,
      {
        id: uid(), name: surfaceName.trim(), kind: "gradient", gradient: gradCss,
        textColor, textSecondary, accentColor,
      },
    ]);
    setSurfaceName("");
    setAddingSurface(null);
  };

  const addImageSurface = () => {
    if (!surfaceName.trim() || !imgData) return;
    updateSurfaces([
      ...data.surfaces,
      {
        id: uid(), name: surfaceName.trim(), kind: "image", imageData: imgData,
        blendMode: imgBlend, overlayColor: imgOverlay, overlayOpacity: imgOverlayOp,
        textColor, textSecondary, accentColor,
      },
    ]);
    setSurfaceName("");
    setImgData(undefined);
    setAddingSurface(null);
  };

  const addAccent = () => {
    updateAccents([...data.accents, { id: uid(), name: accentName.trim() || newAccentColor, color: newAccentColor }]);
    setAccentName("");
  };

  const addDecor = () => {
    updateDecors([
      ...data.decors,
      { id: uid(), type: "blobs", fillKind: "auto", fill: undefined, opacity: 1, blend: "normal", size: 1, enabled: true },
    ]);
  };

  const patchDecor = (id: string, patch: Partial<DecorLayer>) =>
    updateDecors(data.decors.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto 28px",
        padding: "20px 24px 24px",
        background: "#141416",
        border: "1px solid #2a2a2c",
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#eee" }}>🎛 Customize</div>
        <div style={{ fontSize: 11, color: "#8a8a92" }}>All changes are saved automatically in your browser</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* ---------- Typography ---------- */}
        <Section
          title="Typography"
          right={
            <button onClick={() => setTypo(defaultTypo())} style={{ ...btn, padding: "4px 10px", fontSize: 11 }}>
              Reset
            </button>
          }
        >
          <Row labelText="Title size">
            <Num value={t.titleSize} onChange={(v) => setTypo({ titleSize: v })} min={0} max={120} />
            <span style={{ fontSize: 11, color: "#8a8a92" }}>px · 0 = auto</span>
          </Row>
          <Row labelText="Title weight">
            <Slider value={t.titleWeight} min={0} max={900} step={100} onChange={(v) => setTypo({ titleWeight: v })} />
            <Value width={34}>{t.titleWeight === 0 ? "Auto" : t.titleWeight}</Value>
          </Row>
          <Row labelText="Title case">
            <Seg
              value={t.titleUppercase === undefined ? "auto" : t.titleUppercase ? "up" : "norm"}
              options={[
                { v: "auto", label: "Auto" },
                { v: "up", label: "UPPERCASE" },
                { v: "norm", label: "Sentence" },
              ]}
              onChange={(v) => setTypo({ titleUppercase: v === "auto" ? undefined : v === "up" })}
            />
          </Row>
          <Row labelText="Title align">
            <Seg<TextAlign | "auto">
              value={t.titleAlign ?? "auto"}
              options={[
                { v: "auto", label: "Auto" },
                { v: "left", label: "Left" },
                { v: "center", label: "Center" },
                { v: "right", label: "Right" },
              ]}
              onChange={(v) => setTypo({ titleAlign: v === "auto" ? undefined : v })}
            />
          </Row>
          <Row labelText="Title space">
            <Slider value={t.letterSpacing} min={0} max={0.2} step={0.005} onChange={(v) => setTypo({ letterSpacing: v })} />
            <Value width={44}>{t.letterSpacing === 0 ? "Auto" : `${t.letterSpacing.toFixed(3)}em`}</Value>
          </Row>
          <Row labelText="Body size">
            <Num value={t.bodySize} onChange={(v) => setTypo({ bodySize: v })} min={0} max={120} />
            <span style={{ fontSize: 11, color: "#8a8a92" }}>px · 0 = auto</span>
          </Row>
          <Row labelText="Body weight">
            <Slider value={t.bodyWeight} min={0} max={900} step={100} onChange={(v) => setTypo({ bodyWeight: v })} />
            <Value width={34}>{t.bodyWeight === 0 ? "Auto" : t.bodyWeight}</Value>
          </Row>
          <Row labelText="Body line-h">
            <Slider value={t.bodyLineHeight} min={0} max={2} step={0.05} onChange={(v) => setTypo({ bodyLineHeight: v })} />
            <Value width={34}>{t.bodyLineHeight === 0 ? "Auto" : t.bodyLineHeight.toFixed(2)}</Value>
          </Row>
          <Row labelText="Body align">
            <Seg<TextAlign | "auto">
              value={t.bodyAlign ?? "auto"}
              options={[
                { v: "auto", label: "Auto" },
                { v: "left", label: "Left" },
                { v: "center", label: "Center" },
                { v: "right", label: "Right" },
              ]}
              onChange={(v) => setTypo({ bodyAlign: v === "auto" ? undefined : v })}
            />
          </Row>
          <Row labelText="Accent blend">
            <select
              value={t.accentBlend ?? "auto"}
              onChange={(e) => setTypo({ accentBlend: e.target.value === "auto" ? undefined : (e.target.value as BlendMode) })}
              style={{ ...inp, width: 150, flexShrink: 0 }}
            >
              <option value="auto">Auto</option>
              {BLEND_MODES.map((m) => (
                <option key={m} value={m}>{BLEND_LABELS[m]}</option>
              ))}
            </select>
          </Row>
        </Section>

        {/* ---------- Custom fonts ---------- */}
        <Section
          title={`Custom fonts · ${data.fonts.length}`}
          right={
            <button onClick={() => fontInputRef.current?.click()} style={{ ...btn, padding: "4px 10px", fontSize: 11 }}>
              + Upload
            </button>
          }
        >
          <input
            ref={fontInputRef}
            type="file"
            accept=".woff2,.woff,.ttf,.otf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addFont(f);
              e.target.value = "";
            }}
          />
          {data.fonts.length === 0 && (
            <div style={{ fontSize: 11, color: "#777", lineHeight: 1.5 }}>
              Upload .woff2 / .ttf / .otf — it appears in the Font menu. The file name becomes the font's name.
            </div>
          )}
          {data.fonts.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: 15, flex: 1, color: "#eee" }}>
                Abc — {f.name}
              </span>
              <button
                onClick={() => updateFonts(data.fonts.filter((x) => x.id !== f.id))}
                style={{ ...btn, padding: "4px 10px", fontSize: 11, color: "#f87171" }}
              >
                Delete
              </button>
            </div>
          ))}
        </Section>

        {/* ---------- Custom backgrounds ---------- */}
        <Section
          title={`Backgrounds · ${data.surfaces.length}`}
          right={
            <div style={{ display: "flex", gap: 4 }}>
              {(["solid", "gradient", "image"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setAddingSurface(addingSurface === k ? null : k)}
                  style={{
                    ...btn,
                    padding: "4px 10px",
                    fontSize: 11,
                    background: addingSurface === k ? "#6366F1" : "transparent",
                    borderColor: addingSurface === k ? "#6366F1" : "#333",
                    color: addingSurface === k ? "#fff" : "#bbb",
                  }}
                >
                  + {k}
                </button>
              ))}
            </div>
          }
        >
          {addingSurface && (
            <div style={{ border: "1px dashed #3a3a3e", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <Row labelText="Name">
                <input
                  value={surfaceName}
                  onChange={(e) => setSurfaceName(e.target.value)}
                  placeholder="My background"
                  style={{ ...inp, flex: 1, minWidth: 0 }}
                />
              </Row>
              {addingSurface === "solid" && (
                <Row labelText="Color">
                  <ColorField value={solidColor} onChange={setSolidColor} />
                </Row>
              )}
              {addingSurface === "gradient" && <GradientEditor value={gradCss} onChange={setGradCss} />}
              {addingSurface === "image" && (
                <>
                  <Row labelText="Image">
                    <button onClick={() => imageInputRef.current?.click()} style={btn}>
                      {imgData ? "Change image" : "Upload image"}
                    </button>
                  </Row>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setImgData(await readFileAsDataUrl(f));
                      e.target.value = "";
                    }}
                  />
                  {imgData && (
                    <img
                      src={imgData}
                      alt="bg preview"
                      style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8 }}
                    />
                  )}
                  <Row labelText="Tint">
                    <ColorField value={imgOverlay} onChange={setImgOverlay} />
                  </Row>
                  <Row labelText="Tint op">
                    <Slider value={imgOverlayOp} min={0} max={1} onChange={setImgOverlayOp} />
                    <Value width={34}>{Math.round(imgOverlayOp * 100)}%</Value>
                  </Row>
                  <Row labelText="Blend">
                    <BlendSel value={imgBlend} onChange={setImgBlend} />
                  </Row>
                </>
              )}
              <Row labelText="Text color">
                <ColorField value={textColor} onChange={setTextColor} />
              </Row>
              <Row labelText="Text 2">
                <input
                  type="text"
                  value={textSecondary}
                  onChange={(e) => setTextSecondary(e.target.value)}
                  placeholder="rgba(255,255,255,0.55)"
                  style={{ ...inp, flex: 1, minWidth: 0, fontFamily: "ui-monospace, monospace", fontSize: 11 }}
                />
              </Row>
              <Row labelText="Accent">
                <ColorField value={accentColor} onChange={setAccentColor} />
              </Row>
              <button
                onClick={addingSurface === "solid" ? addSolidSurface : addingSurface === "gradient" ? addGradientSurface : addImageSurface}
                style={{ ...btn, background: "#6366F1", color: "#fff", fontWeight: 600, alignSelf: "flex-start" }}
              >
                Add background
              </button>
            </div>
          )}
          {data.surfaces.length === 0 && addingSurface === null && (
            <div style={{ fontSize: 11, color: "#777", lineHeight: 1.5 }}>
              Add solid, gradient, or image backgrounds — they show in the Surface menu.
            </div>
          )}
          {data.surfaces.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: s.kind === "image" ? `url(${s.imageData}) center/cover` : s.kind === "gradient" ? s.gradient : s.color,
                  border: "1px solid #333",
                }}
              />
              <span style={{ flex: 1, fontSize: 12, color: "#eee", minWidth: 0 }}>{s.name}</span>
              <button
                onClick={() => updateSurfaces(data.surfaces.filter((x) => x.id !== s.id))}
                style={{ ...btn, padding: "4px 10px", fontSize: 11, color: "#f87171" }}
              >
                Delete
              </button>
            </div>
          ))}
        </Section>

        {/* ---------- Custom accents ---------- */}
        <Section title={`Accents · ${data.accents.length}`}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={accentName}
              onChange={(e) => setAccentName(e.target.value)}
              placeholder="Name"
              style={{ ...inp, flex: 1, minWidth: 80 }}
            />
            <ColorField value={newAccentColor} onChange={setNewAccentColor} />
            <button onClick={addAccent} style={{ ...btn, background: "#6366F1", color: "#fff", padding: "5px 12px" }}>
              Add
            </button>
          </div>
          {data.accents.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: a.color, border: "1px solid #333" }} />
              <span style={{ flex: 1, fontSize: 12, color: "#eee" }}>{a.name}</span>
              <button
                onClick={() => updateAccents(data.accents.filter((x) => x.id !== a.id))}
                style={{ ...btn, padding: "4px 10px", fontSize: 11, color: "#f87171" }}
              >
                Delete
              </button>
            </div>
          ))}
        </Section>

        {/* ---------- Decor layers ---------- */}
        <Section
          title={`Decor layers · ${data.decors.length}`}
          right={
            <button onClick={addDecor} style={{ ...btn, padding: "4px 10px", fontSize: 11 }}>
              + Add decor
            </button>
          }
        >
          {data.decors.length === 0 && (
            <div style={{ fontSize: 11, color: "#777", lineHeight: 1.5 }}>
              Stack decorations: blobs, grid, noise, glow… each with its own color / gradient / image, opacity, blend and size.
            </div>
          )}
          {data.decors.map((d) => (
            <div key={d.id} style={{ border: "1px solid #2f2f31", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select value={d.type} onChange={(e) => patchDecor(d.id, { type: e.target.value as BgType })} style={{ ...inp, flex: 1, minWidth: 0 }}>
                  {DECOR_TYPES.map((ty) => (
                    <option key={ty} value={ty}>{DECOR_LABELS[ty]}</option>
                  ))}
                </select>
                <button
                  onClick={() => patchDecor(d.id, { enabled: !d.enabled })}
                  style={{
                    ...btn,
                    padding: "4px 10px",
                    fontSize: 11,
                    color: d.enabled ? "#4ade80" : "#888",
                    borderColor: d.enabled ? "#2d6a3a" : "#333",
                  }}
                >
                  {d.enabled ? "On" : "Off"}
                </button>
                <button
                  onClick={() => updateDecors(data.decors.filter((x) => x.id !== d.id))}
                  style={{ ...btn, padding: "4px 10px", fontSize: 11, color: "#f87171" }}
                >
                  ✕
                </button>
              </div>
              <Row labelText="Fill">
                <Seg
                  value={d.fillKind}
                  options={[
                    { v: "auto", label: "Accent" },
                    { v: "solid", label: "Color" },
                    { v: "gradient", label: "Gradient" },
                    { v: "image", label: "Image" },
                  ]}
                  onChange={(v) => patchDecor(d.id, { fillKind: v })}
                />
              </Row>
              {d.fillKind === "solid" && (
                <Row labelText="Color">
                  <ColorField value={d.fill ?? "#FACC15"} onChange={(v) => patchDecor(d.id, { fill: v })} />
                </Row>
              )}
              {d.fillKind === "gradient" && (
                <GradientEditor value={d.fill ?? undefined} onChange={(v) => patchDecor(d.id, { fill: v })} />
              )}
              {d.fillKind === "image" && (
                <Row labelText="Image URL">
                  <input
                    type="text"
                    value={d.fill ?? ""}
                    onChange={(e) => patchDecor(d.id, { fill: e.target.value })}
                    placeholder="/images/x.png or data:image/..."
                    style={{ ...inp, flex: 1, minWidth: 0, fontFamily: "ui-monospace, monospace", fontSize: 11 }}
                  />
                </Row>
              )}
              <Row labelText="Opacity">
                <Slider value={d.opacity} min={0} max={1} onChange={(v) => patchDecor(d.id, { opacity: v })} />
                <Value width={34}>{Math.round(d.opacity * 100)}%</Value>
              </Row>
              <Row labelText="Blend">
                <BlendSel value={d.blend} onChange={(v) => patchDecor(d.id, { blend: v })} />
              </Row>
              <Row labelText="Size">
                <Slider value={d.size} min={0.1} max={3} step={0.05} onChange={(v) => patchDecor(d.id, { size: v })} />
                <Value width={38}>{d.size.toFixed(2)}×</Value>
              </Row>
            </div>
          ))}
        </Section>

        {/* ---------- Logo ---------- */}
        <Section
          title="Logo / watermark"
          right={
            <button
              onClick={() => setLogo({ enabled: !data.logo.enabled })}
              style={{
                ...btn,
                padding: "4px 10px",
                fontSize: 11,
                color: data.logo.enabled ? "#4ade80" : "#888",
                borderColor: data.logo.enabled ? "#2d6a3a" : "#333",
              }}
            >
              {data.logo.enabled ? "On" : "Off"}
            </button>
          }
        >
          <Row labelText="Image">
            <button onClick={() => logoInputRef.current?.click()} style={btn}>
              {data.logo.dataUrl ? "Change logo" : "Upload logo"}
            </button>
            {data.logo.dataUrl && (
              <button onClick={() => setLogo({ dataUrl: undefined })} style={{ ...btn, padding: "4px 10px", fontSize: 11, color: "#f87171" }}>
                Remove
              </button>
            )}
          </Row>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setLogo({ dataUrl: await readFileAsDataUrl(f), enabled: true });
              e.target.value = "";
            }}
          />
          {data.logo.dataUrl && (
            <img
              src={data.logo.dataUrl}
              alt="logo preview"
              style={{ width: 90, height: 90, objectFit: "contain", borderRadius: 8, background: "#111113", border: "1px solid #333" }}
            />
          )}
          <Row labelText="Width">
            <Num value={data.logo.width} onChange={(v) => setLogo({ width: v })} min={20} max={600} />
            <span style={{ fontSize: 11, color: "#8a8a92" }}>px</span>
          </Row>
          <Row labelText="Position X">
            <Slider value={data.logo.x} min={0} max={100} step={1} onChange={(v) => setLogo({ x: v })} />
            <Value width={34}>{data.logo.x}%</Value>
          </Row>
          <Row labelText="Position Y">
            <Slider value={data.logo.y} min={0} max={100} step={1} onChange={(v) => setLogo({ y: v })} />
            <Value width={34}>{data.logo.y}%</Value>
          </Row>
          <Row labelText="Opacity">
            <Slider value={data.logo.opacity} min={0} max={1} onChange={(v) => setLogo({ opacity: v })} />
            <Value width={34}>{Math.round(data.logo.opacity * 100)}%</Value>
          </Row>
          <Row labelText="Blend">
            <BlendSel value={data.logo.blend} onChange={(v) => setLogo({ blend: v })} />
          </Row>
          <Row labelText="Rotate">
            <Slider value={data.logo.rotate} min={-180} max={180} step={1} onChange={(v) => setLogo({ rotate: v })} />
            <Value width={40}>{data.logo.rotate}°</Value>
          </Row>
          <Row labelText="Radius">
            <Num value={data.logo.radius} onChange={(v) => setLogo({ radius: v })} min={0} max={100} />
            <span style={{ fontSize: 11, color: "#8a8a92" }}>px</span>
          </Row>
          <Row labelText="Show on">
            <Seg
              value={data.logo.everySlide ? "every" : "last"}
              options={[{ v: "every", label: "Every slide" }, { v: "last", label: "Last slide" }]}
              onChange={(v) => setLogo({ everySlide: v === "every" })}
            />
          </Row>
        </Section>
      </div>
    </div>
  );
}