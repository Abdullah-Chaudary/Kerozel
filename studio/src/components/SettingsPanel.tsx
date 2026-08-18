"use client";

import { useState } from "react";
import type { AiSettings } from "../lib/ai";
import { PROVIDER_PRESETS, PROVIDER_IDS, saveSettings } from "../lib/ai";
import type { Lang } from "../lib/strings";
import { UI } from "../lib/strings";
import { Btn, Card, Field, PanelTitle, SelectInput, TextInput } from "./ui";

export default function SettingsPanel({
  lang,
  settings,
  onChange,
  onClose,
}: {
  lang: Lang;
  settings: AiSettings;
  onChange: (s: AiSettings) => void;
  onClose: () => void;
}) {
  const t = UI[lang];
  const [draft, setDraft] = useState<AiSettings>(settings);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const pickProvider = (provider: AiSettings["provider"]) => {
    const preset = PROVIDER_PRESETS[provider];
    setDraft({ provider, apiKey: draft.apiKey, baseUrl: preset.baseUrl, model: preset.model });
    setStatus(null);
  };

  const test = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, settings: draft }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "HTTP " + res.status);
      setStatus({ ok: true, msg: t.testOk + (data.sample ?? "") });
    } catch (err) {
      setStatus({ ok: false, msg: t.testErr + ": " + (err instanceof Error ? err.message : String(err)) });
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    saveSettings(draft);
    onChange(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const preset = PROVIDER_PRESETS[draft.provider];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px",
        zIndex: 100,
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 540 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <PanelTitle title={t.settingsTitle} subtitle={t.settingsSubtitle} />
            </div>
            <Btn variant="ghost" onClick={onClose} style={{ flexShrink: 0 }}>
              {t.btnClose}
            </Btn>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label={t.lblProvider}>
              <SelectInput
                value={draft.provider}
                onChange={(e) => pickProvider(e.target.value as AiSettings["provider"])}
              >
                {PROVIDER_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PROVIDER_PRESETS[id].label}
                  </option>
                ))}
              </SelectInput>
              <div style={{ fontSize: 11, color: "#6b6b72", lineHeight: 1.45 }}>{preset.hint}</div>
            </Field>

            <Field label={t.lblApiKey} hint={t.phApiKey}>
              <TextInput
                type="password"
                autoComplete="off"
                value={draft.apiKey}
                placeholder={t.phApiKey}
                onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              />
            </Field>

            <Field label={t.lblBaseUrl}>
              <TextInput
                value={draft.baseUrl}
                placeholder="https://…/v1"
                onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
              />
            </Field>

            <Field label={t.lblModel}>
              <TextInput
                value={draft.model}
                placeholder={draft.provider === "custom" ? "e.g. my-model" : preset.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              />
            </Field>

            {status && (
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: status.ok ? "#0c2316" : "#2a1212",
                  color: status.ok ? "#86efac" : "#fca5a5",
                  border: `1px solid ${status.ok ? "#14532d" : "#7f1d1d"}`,
                }}
              >
                {status.msg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn variant="ghost" onClick={test} disabled={testing}>
                {testing ? t.testing : t.btnTest}
              </Btn>
              <Btn onClick={save} disabled={savedFlash}>
                {savedFlash ? t.saved : t.btnSave}
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}