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

// ============================================================
// Tiny control primitives (dark theme, matches app)
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
const label: React.CSSProperties = { fontSize: 11, color: "#999", minWidth: 76, flexShrink: 0 };

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #2a2a2c", borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title}
        </div>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={label}>{labelText}</span>
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
  suffix = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ...inp, width: 72 }}
    />
  );
}

function Range({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ flex: 1, accentColor: "#6366F1" }}
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
    <div style={{ display: "flex", gap: 4 }}>
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
    <select value={value} onChange={(e) => onChange(e.target.value as BlendMode)} style={{ ...inp, flex: 1 }}>
      {BLEND_MODES.map((m) => (
        <option key={m} value={m}>
          {BLEND_LABELS[m]}
        </option>
      ))}
    </select>
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
// Main panel
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
  const [gradFrom, setGradFrom] = useState("#6366F1");
  const [gradTo, setGradTo] = useState("#F59E0B");
  const [gradAngle, setGradAngle] = useState(135);
  const [imgData, setImgData] = useState<string | undefined>();
  const [imgOverlay, setImgOverlay] = useState("#000000");
  const [imgOverlayOp, setImgOverlayOp] = useState(0.3);
  const [imgBlend, setImgBlend] = useState<BlendMode>("normal");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textSecondary, setTextSecondary] = useState("rgba(255,255,255,0.55)");
  const [accentColor, setAccentColor] = useState("#FACC15");
  const fontInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [accentName, setAccentName] = useState("");
  const [newAccentColor, setNewAccentColor] = useState("#FACC15");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const t = data.typo;
  const set = (patch: Partial<CustomData>) => onChange({ ...data, ...patch });

  const updateFonts = (fonts: CustomFont[]) => set({ fonts });
  const updateSurfaces = (surfaces: CustomSurface[]) => set({ surfaces });
  const updateAccents = (accents: CustomAccent[]) => set({ accents });
  const updateDecors = (decors: DecorLayer[]) => set({ decors });
  const setLogo = (patch: Partial<CustomData["logo"]>) =>
    set({ logo: { ...data.logo, ...patch } });
  const setTypo = (patch: Partial<CustomData["typo"]>) =>
    set({ typo: { ...t, ...patch } });

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
        id: uid(), name: surfaceName.trim(), kind: "gradient",
        gradient: `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})`,
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
    <div style={{ border: "1px solid #2a2a2c", borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#eee", marginBottom: 12 }}>
        🎛 Customize — all changes saved in your browser
      </div>

      {/* ---------- Typography ---------- */}
      <Section title="Typography">
        <Row labelText="Title size">
          <Num value={t.titleSize} onChange={(v) => setTypo({ titleSize: v })} min={0} max={120} />
          <span style={{ fontSize: 11, color: "#777" }}>px (0 = auto)</span>
        </Row>
        <Row labelText="Title weight">
          <Range value={t.titleWeight} min={0} max={900} step={100} onChange={(v) => setTypo({ titleWeight: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{t.titleWeight === 0 ? "Auto" : t.titleWeight}</span>
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
        <Row labelText="Title spacing">
          <Range value={t.letterSpacing} min={0} max={0.2} step={0.005} onChange={(v) => setTypo({ letterSpacing: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 44 }}>{t.letterSpacing === 0 ? "Auto" : `${t.letterSpacing.toFixed(3)}em`}</span>
        </Row>
        <Row labelText="Body size">
          <Num value={t.bodySize} onChange={(v) => setTypo({ bodySize: v })} min={0} max={120} />
          <span style={{ fontSize: 11, color: "#777" }}>px (0 = auto)</span>
        </Row>
        <Row labelText="Body weight">
          <Range value={t.bodyWeight} min={0} max={900} step={100} onChange={(v) => setTypo({ bodyWeight: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{t.bodyWeight === 0 ? "Auto" : t.bodyWeight}</span>
        </Row>
        <Row labelText="Body line-h">
          <Range value={t.bodyLineHeight} min={0} max={2} step={0.05} onChange={(v) => setTypo({ bodyLineHeight: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{t.bodyLineHeight === 0 ? "Auto" : t.bodyLineHeight.toFixed(2)}</span>
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
            style={{ ...inp, flex: 1 }}
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
        title={`Fonts (${data.fonts.length} custom)`}
        right={
          <button onClick={() => fontInputRef.current?.click()} style={btn}>
            + Upload font
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
          <div style={{ fontSize: 11, color: "#777" }}>
            Upload a .woff2 / .ttf / .otf — it appears in the Font menu. The file name becomes the font's name.
          </div>
        )}
        {data.fonts.map((f) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: 15, flex: 1, color: "#eee" }}>Abc — {f.name}</span>
            <button onClick={() => updateFonts(data.fonts.filter((x) => x.id !== f.id))} style={{ ...btn, color: "#f87171" }}>
              Delete
            </button>
          </div>
        ))}
      </Section>

      {/* ---------- Custom surfaces ---------- */}
      <Section
        title={`Backgrounds (${data.surfaces.length} custom)`}
        right={
          <div style={{ display: "flex", gap: 4 }}>
            {(["solid", "gradient", "image"] as const).map((k) => (
              <button key={k} onClick={() => setAddingSurface(addingSurface === k ? null : k)} style={btn}>
                + {k}
              </button>
            ))}
          </div>
        }
      >
        {addingSurface && (
          <div style={{ border: "1px dashed #444", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row labelText="Name">
              <input value={surfaceName} onChange={(e) => setSurfaceName(e.target.value)} placeholder="My background" style={{ ...inp, flex: 1 }} />
            </Row>
            {addingSurface === "solid" && (
              <Row labelText="Color">
                <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
              </Row>
            )}
            {addingSurface === "gradient" && (
              <>
                <Row labelText="Angle">
                  <Range value={gradAngle} min={0} max={360} step={5} onChange={(v) => setGradAngle(v)} />
                  <span style={{ fontSize: 11, color: "#777", width: 40 }}>{gradAngle}°</span>
                </Row>
                <Row labelText="From / To">
                  <input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
                  <input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
                  <div style={{ flex: 1, height: 30, borderRadius: 6, background: `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})` }} />
                </Row>
              </>
            )}
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
                {imgData && <img src={imgData} alt="bg" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 6 }} />}
                <Row labelText="Tint color">
                  <input type="color" value={imgOverlay} onChange={(e) => setImgOverlay(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
                </Row>
                <Row labelText="Tint opacity">
                  <Range value={imgOverlayOp} min={0} max={1} onChange={(v) => setImgOverlayOp(v)} />
                </Row>
                <Row labelText="Blend">
                  <BlendSel value={imgBlend} onChange={(v) => setImgBlend(v)} />
                </Row>
              </>
            )}
            <Row labelText="Text color">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
            </Row>
            <Row labelText="Text 2">
              <input type="text" value={textSecondary} onChange={(e) => setTextSecondary(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="rgba(255,255,255,0.55)" />
            </Row>
            <Row labelText="Accent">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
            </Row>
            <button
              onClick={addingSurface === "solid" ? addSolidSurface : addingSurface === "gradient" ? addGradientSurface : addImageSurface}
              style={{ ...btn, background: "#6366F1", color: "#fff", fontWeight: 600 }}
            >
              Add background
            </button>
          </div>
        )}
        {data.surfaces.length === 0 && addingSurface === null && (
          <div style={{ fontSize: 11, color: "#777" }}>Add solid, gradient, or image backgrounds — they show in the Surface menu.</div>
        )}
        {data.surfaces.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: s.kind === "image" ? `url(${s.imageData}) center/cover` : s.kind === "gradient" ? s.gradient : s.color,
                border: "1px solid #333",
              }}
            />
            <span style={{ flex: 1, fontSize: 12, color: "#eee" }}>{s.name}</span>
            <button onClick={() => updateSurfaces(data.surfaces.filter((x) => x.id !== s.id))} style={{ ...btn, color: "#f87171" }}>
              Delete
            </button>
          </div>
        ))}
      </Section>

      {/* ---------- Custom accents ---------- */}
      <Section title={`Accents (${data.accents.length} custom)`}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={accentName}
            onChange={(e) => setAccentName(e.target.value)}
            placeholder="Name"
            style={{ ...inp, flex: 1, minWidth: 90 }}
          />
          <input type="color" value={newAccentColor} onChange={(e) => setNewAccentColor(e.target.value)} style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }} />
          <button onClick={addAccent} style={{ ...btn, background: "#6366F1", color: "#fff" }}>
            Add accent
          </button>
        </div>
        {data.accents.map((a) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: a.color, border: "1px solid #333" }} />
            <span style={{ flex: 1, fontSize: 12, color: "#eee" }}>{a.name}</span>
            <button onClick={() => updateAccents(data.accents.filter((x) => x.id !== a.id))} style={{ ...btn, color: "#f87171" }}>
              Delete
            </button>
          </div>
        ))}
      </Section>

      {/* ---------- Decor layers ---------- */}
      <Section
        title={`Decor layers (${data.decors.length})`}
        right={<button onClick={addDecor} style={btn}>+ Add decor</button>}
      >
        {data.decors.length === 0 && (
          <div style={{ fontSize: 11, color: "#777" }}>
            Stack decorations: blobs, grid, noise, glow… each with its own color, gradient/image, opacity, blend and size.
          </div>
        )}
        {data.decors.map((d) => (
          <div key={d.id} style={{ border: "1px solid #2f2f31", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={d.type} onChange={(e) => patchDecor(d.id, { type: e.target.value as BgType })} style={{ ...inp, flex: 1 }}>
                {DECOR_TYPES.map((ty) => (
                  <option key={ty} value={ty}>{DECOR_LABELS[ty]}</option>
                ))}
              </select>
              <button
                onClick={() => patchDecor(d.id, { enabled: !d.enabled })}
                style={{ ...btn, color: d.enabled ? "#4ade80" : "#888" }}
              >
                {d.enabled ? "On" : "Off"}
              </button>
              <button onClick={() => updateDecors(data.decors.filter((x) => x.id !== d.id))} style={{ ...btn, color: "#f87171" }}>
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
                <input
                  type="color"
                  value={d.fill ?? "#FACC15"}
                  onChange={(e) => patchDecor(d.id, { fill: e.target.value })}
                  style={{ width: 60, height: 30, background: "none", border: "none", cursor: "pointer" }}
                />
              </Row>
            )}
            {d.fillKind === "gradient" && (
              <Row labelText="Gradient">
                <input
                  type="text"
                  value={d.fill ?? ""}
                  onChange={(e) => patchDecor(d.id, { fill: e.target.value })}
                  placeholder="linear-gradient(135deg, #fff, #000)"
                  style={{ ...inp, flex: 1 }}
                />
              </Row>
            )}
            {d.fillKind === "image" && (
              <Row labelText="Image URL">
                <input
                  type="text"
                  value={d.fill ?? ""}
                  onChange={(e) => patchDecor(d.id, { fill: e.target.value })}
                  placeholder="/images/x.png or data:image/..."
                  style={{ ...inp, flex: 1 }}
                />
              </Row>
            )}
            <Row labelText="Opacity">
              <Range value={d.opacity} min={0} max={1} onChange={(v) => patchDecor(d.id, { opacity: v })} />
              <span style={{ fontSize: 11, color: "#777", width: 34 }}>{Math.round(d.opacity * 100)}%</span>
            </Row>
            <Row labelText="Blend">
              <BlendSel value={d.blend} onChange={(v) => patchDecor(d.id, { blend: v })} />
            </Row>
            <Row labelText="Size">
              <Range value={d.size} min={0.1} max={3} step={0.05} onChange={(v) => patchDecor(d.id, { size: v })} />
              <span style={{ fontSize: 11, color: "#777", width: 34 }}>{d.size.toFixed(2)}×</span>
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
            style={{ ...btn, color: data.logo.enabled ? "#4ade80" : "#888" }}
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
            <button onClick={() => setLogo({ dataUrl: undefined })} style={{ ...btn, color: "#f87171" }}>
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
          <img src={data.logo.dataUrl} alt="logo" style={{ width: 90, height: 90, objectFit: "contain", borderRadius: 6, background: "#141416", border: "1px solid #333" }} />
        )}
        <Row labelText="Width">
          <Num value={data.logo.width} onChange={(v) => setLogo({ width: v })} min={20} max={600} />
          <span style={{ fontSize: 11, color: "#777" }}>px</span>
        </Row>
        <Row labelText="Position X">
          <Range value={data.logo.x} min={0} max={100} step={1} onChange={(v) => setLogo({ x: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{data.logo.x}%</span>
        </Row>
        <Row labelText="Position Y">
          <Range value={data.logo.y} min={0} max={100} step={1} onChange={(v) => setLogo({ y: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{data.logo.y}%</span>
        </Row>
        <Row labelText="Opacity">
          <Range value={data.logo.opacity} min={0} max={1} onChange={(v) => setLogo({ opacity: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 34 }}>{Math.round(data.logo.opacity * 100)}%</span>
        </Row>
        <Row labelText="Blend">
          <BlendSel value={data.logo.blend} onChange={(v) => setLogo({ blend: v })} />
        </Row>
        <Row labelText="Rotate">
          <Range value={data.logo.rotate} min={-180} max={180} step={1} onChange={(v) => setLogo({ rotate: v })} />
          <span style={{ fontSize: 11, color: "#777", width: 40 }}>{data.logo.rotate}°</span>
        </Row>
        <Row labelText="Radius">
          <Num value={data.logo.radius} onChange={(v) => setLogo({ radius: v })} min={0} max={100} />
          <span style={{ fontSize: 11, color: "#777" }}>px</span>
        </Row>
        <Row labelText="Show on">
          <Seg
            value={data.logo.everySlide ? "every" : "last"}
            options={[{ v: "every", label: "Every slide" }, { v: "last", label: "Last slide" }]}
            onChange={(v) => setLogo({ everySlide: v === "every" })}
          />
        </Row>
      </Section>

      <button onClick={() => setTypo(defaultTypo())} style={{ ...btn, marginTop: 4 }}>
        Reset typography
      </button>
    </div>
  );
}