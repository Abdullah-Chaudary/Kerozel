"use client";

import { useRef, useState } from "react";
import type { AiSettings } from "../lib/ai";
import { PROVIDER_PRESETS } from "../lib/ai";
import type { SlideData } from "../lib/types";
import type { GoalId, UIStrings } from "../lib/strings";
import { GOALS, UI } from "../lib/strings";
import { Area, Btn, Card, Field, PanelTitle, TextInput } from "./ui";

const GOAL_VALUE: Record<GoalId, string> = {
  auto: "",
  listicle: "listicle",
  framework: "framework",
  beforeAfter: "before / after",
  data: "data storytelling",
  case: "mini case study",
};

const GOAL_LABEL: Record<GoalId, keyof UIStrings> = {
  auto: "goalAuto",
  listicle: "goalListicle",
  framework: "goalFramework",
  beforeAfter: "goalBeforeAfter",
  data: "goalData",
  case: "goalCase",
};

export default function CreatePanel({
  settings,
  onLogo,
  onGenerated,
}: {
  settings: AiSettings;
  onLogo: (dataUrl: string) => void;
  onGenerated: (slides: SlideData[]) => void;
}) {
  const t = UI;
  const fileRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [sources, setSources] = useState("");
  const [count, setCount] = useState(8);
  const [goal, setGoal] = useState<GoalId>("auto");
  const [handle, setHandle] = useState("");
  const [must, setMust] = useState("");
  const [logoName, setLogoName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      onLogo(url);
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!topic.trim()) {
      setError(t.genEmpty);
      setDone(false);
      return;
    }
    setBusy(true);
    setError("");
    setDone(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          notes,
          sources: sources.split("\n"),
          slideCount: count,
          goal: GOAL_VALUE[goal],
          handle,
          mustInclude: must.split("\n"),
          lang: "English",
          settings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      onGenerated(data.slides as SlideData[]);
      setDone(true);
    } catch (err) {
      setError((err instanceof Error ? err.message : String(err)) + " — check Settings (⚙).");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PanelTitle title={t.createTitle} subtitle={t.createSubtitle} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16, alignItems: "start" }}>
        {/* main form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Field label={t.lblTopic}>
              <Area value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t.phTopic} rows={4} />
            </Field>
          </Card>

          <Card>
            <Field label={t.lblNotes}>
              <Area value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.phNotes} rows={4} />
            </Field>
          </Card>

          <Card>
            <Field label={t.lblSources} hint={t.phSources}>
              <Area value={sources} onChange={(e) => setSources(e.target.value)} rows={4} />
            </Field>
          </Card>

          <Card>
            <Field label={t.lblMust} hint={t.phMust}>
              <Area value={must} onChange={(e) => setMust(e.target.value)} rows={3} />
            </Field>
          </Card>

          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label={t.lblCtaHandle}>
                <TextInput value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={t.phHandle} />
              </Field>
              <Field label={t.lblLogo}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => pickLogo(e.target.files?.[0])}
                />
                <Btn variant="ghost" onClick={() => fileRef.current?.click()} style={{ width: "100%" }}>
                  {logoName ? "✓ " + logoName : t.phLogo}
                </Btn>
                {logoName && (
                  <div style={{ fontSize: 11, color: "#6b6b72", lineHeight: 1.45 }}>{t.logoSet}</div>
                )}
              </Field>
            </div>
          </Card>

          {error && (
            <div
              style={{
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#2a1212",
                color: "#fca5a5",
                border: "1px solid #7f1d1d",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
          {done && (
            <div
              style={{
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#0c2316",
                color: "#86efac",
                border: "1px solid #14532d",
              }}
            >
              {t.genDone}
            </div>
          )}
        </div>

        {/* sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={t.lblCount}>
                <TextInput
                  type="number"
                  min={3}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Math.max(3, Math.min(15, Number(e.target.value) || 8)))}
                />
              </Field>
              <Field label={t.lblGoal}>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as GoalId)}
                  style={{
                    background: "#0f0f11",
                    border: "1px solid #333",
                    borderRadius: 8,
                    color: "#eee",
                    padding: "9px 12px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {t[GOAL_LABEL[g]]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card style={{ fontSize: 12, color: "#8a8a92", lineHeight: 1.5 }}>
            {t.hintSettings
              .replace("{provider}", PROVIDER_PRESETS[settings.provider].label)
              .replace("{model}", settings.model || "—")}
          </Card>

          <Btn onClick={generate} disabled={busy} style={{ fontSize: 14, padding: "12px 16px" }}>
            {busy ? t.generating : t.btnGenerate}
          </Btn>
        </div>
      </div>
    </div>
  );
}