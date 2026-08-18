"use client";

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes } from "react";

// ---- shared dark-theme primitives for the pipeline UI ----

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#161618",
        border: "1px solid #2a2a2e",
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  style,
}: {
  label?: string;
  children: ReactNode;
  hint?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 12, color: "#9a9aa2", fontWeight: 600, letterSpacing: "0.02em" }}>
          {label}
        </label>
      )}
      {children}
      {hint && <div style={{ fontSize: 11, color: "#6b6b72", lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  background: "#0f0f11",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#eee",
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputBase, ...props.style }} />;
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputBase, resize: "vertical", minHeight: 72, lineHeight: 1.5, ...props.style }} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputBase, cursor: "pointer", ...props.style }} />;
}

export type BtnVariant = "primary" | "success" | "ghost" | "danger";

const btnStyles: Record<BtnVariant, React.CSSProperties> = {
  primary: { background: "#6366F1", color: "#fff", border: "none" },
  success: { background: "#22C55E", color: "#fff", border: "none" },
  ghost: { background: "transparent", color: "#d6d6dc", border: "1px solid #3a3a40" },
  danger: { background: "transparent", color: "#f87171", border: "1px solid #5b2222" },
};

export function Btn({
  variant = "primary",
  disabled,
  children,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className="tb-btn"
      style={{
        padding: "9px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
        ...btnStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function PanelTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#eee", textWrap: "balance" }}>
        {title}
      </h2>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#8a8a92", marginTop: 4, textWrap: "balance" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}