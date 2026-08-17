"use client";

import { useState } from "react";

// ============================================================
// Gradient editor — visual stops + angle with an optional code mode.
// value is a full CSS background string (e.g. linear-gradient(...)).
// ============================================================

export interface GradientStop {
  color: string;
  pos: number; // 0..100
}

const DEFAULT_GRADIENT = "linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)";

export function parseLinearGradient(css: string): { angle: number; stops: GradientStop[] } | null {
  const m = css.trim().match(/^linear-gradient\(\s*([0-9]+(?:\.\d+)?)deg\s*,\s*(.+)\)$/i);
  if (!m) return null;
  const angle = parseFloat(m[1]);
  const inner = m[2];
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of inner) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);

  const stops: GradientStop[] = parts.map((p) => {
    const sp = p.trim();
    const posm = sp.match(/^(.+?)\s+([0-9.]+)%$/);
    if (posm) return { color: posm[1].trim(), pos: parseFloat(posm[2]) };
    return { color: sp, pos: -1 };
  });

  const hasAnyPos = stops.some((s) => s.pos >= 0);
  if (!hasAnyPos) {
    stops.forEach((s, i) => {
      s.pos = (i / Math.max(1, stops.length - 1)) * 100;
    });
  } else {
    let last = 0;
    stops.forEach((s) => {
      if (s.pos < 0) s.pos = last;
      last = s.pos;
    });
  }
  return { angle, stops };
}

export function buildGradient(angle: number, stops: GradientStop[]): string {
  return `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.pos}%`).join(", ")})`;
}

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

function isHex(v: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(v);
}

function toHexInput(v: string): string {
  return isHex(v) ? v : "#000000";
}

export function ColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="color"
        value={toHexInput(value)}
        onChange={(e) => onChange(e.target.value)}
        title="Pick a color"
        style={{
          width: 34,
          height: 30,
          padding: 0,
          border: "1px solid #333",
          borderRadius: 6,
          background: "none",
          cursor: "pointer",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{ ...inp, width: 112, fontFamily: "ui-monospace, monospace", fontSize: 11 }}
      />
    </div>
  );
}

function R({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#9a9aa3", minWidth: 96, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

export function Slider({
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
      style={{ width: 132, flexShrink: 0, accentColor: "#6366F1" }}
    />
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

export default function GradientEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange: (css: string) => void;
}) {
  const effective = value ?? DEFAULT_GRADIENT;
  const parsed = parseLinearGradient(effective) ?? { angle: 135, stops: [{ color: "#6366F1", pos: 0 }, { color: "#F59E0B", pos: 100 }] };
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [angle, setAngle] = useState(parsed.angle);
  const [stops, setStops] = useState<GradientStop[]>(parsed.stops);
  const [code, setCode] = useState(effective);

  const push = (a: number, s: GradientStop[]) => {
    setAngle(a);
    setStops(s);
    onChange(buildGradient(a, s));
  };

  const patchStop = (i: number, patch: Partial<GradientStop>) => {
    const next = stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    push(angle, next);
  };

  const removeStop = (i: number) => {
    if (stops.length <= 2) return;
    const next = stops.filter((_, idx) => idx !== i);
    push(angle, next);
  };

  const addStop = () => {
    const next = [...stops];
    const last = stops[stops.length - 1];
    next.push({ color: last?.color ?? "#FACC15", pos: Math.min(100, (last?.pos ?? 50) + 10) });
    push(angle, next);
  };

  const goCode = () => {
    setCode(buildGradient(angle, stops));
    setMode("code");
  };

  const goVisual = () => {
    const p = parseLinearGradient(value ?? "");
    if (p) {
      setAngle(p.angle);
      setStops(p.stops);
    }
    setMode("visual");
  };

  const preview = value ?? buildGradient(angle, stops);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div
        style={{
          height: 34,
          borderRadius: 8,
          background: preview,
          border: "1px solid #333",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <button
          onClick={() => (mode === "visual" ? goCode() : goVisual())}
          style={{
            ...btn,
            padding: "4px 10px",
            fontSize: 11,
            color: mode === "code" ? "#A78BFA" : "#8a8a92",
          }}
        >
          {mode === "visual" ? "⤓ Code mode" : "◉ Visual mode"}
        </button>
      </div>

      {mode === "code" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={3}
            style={{
              ...inp,
              width: "100%",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              lineHeight: 1.5,
              resize: "vertical",
            }}
          />
          <button
            onClick={() => onChange(code)}
            style={{ ...btn, alignSelf: "flex-start", background: "#6366F1", color: "#fff" }}
          >
            Apply code
          </button>
        </div>
      ) : (
        <>
          <R label="Angle">
            <Slider value={angle} min={0} max={360} step={5} onChange={(v) => push(v, stops)} />
            <Value width={40}>{angle}°</Value>
          </R>
          {stops.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#6a6a72", width: 26, flexShrink: 0 }}>{i + 1}</span>
              <ColorField value={s.color} onChange={(c) => patchStop(i, { color: c })} />
              <Slider
                value={s.pos}
                min={0}
                max={100}
                step={1}
                onChange={(v) => patchStop(i, { pos: v })}
              />
              <button
                onClick={() => removeStop(i)}
                disabled={stops.length <= 2}
                title="Remove stop (minimum 2)"
                style={{
                  ...btn,
                  padding: "4px 7px",
                  fontSize: 11,
                  color: "#f87171",
                  opacity: stops.length <= 2 ? 0.3 : 1,
                  cursor: stops.length <= 2 ? "not-allowed" : "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={addStop} style={{ ...btn, alignSelf: "flex-start" }}>
            + Add stop
          </button>
        </>
      )}
    </div>
  );
}