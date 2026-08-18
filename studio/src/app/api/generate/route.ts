import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { buildModel } from "../../../lib/ai";
import type { AiSettings } from "../../../lib/ai";
import { buildSystemPrompt, buildUserPrompt } from "../../../lib/prompts";
import type { GenerateInput } from "../../../lib/prompts";
import { extractJson, normalizeSlides } from "../../../lib/normalize";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const settings = body.settings as AiSettings | undefined;
  if (!settings || typeof settings !== "object") {
    return NextResponse.json(
      { error: "Missing AI settings. Open Settings (⚙) and pick a provider + model." },
      { status: 400 }
    );
  }

  try {
    // lightweight connectivity check used by the Settings panel
    if (body.test === true) {
      const model = buildModel(settings);
      const res = await generateText({
        model,
        system: "You are a connection tester. Reply with exactly: OK",
        prompt: "Reply with OK",
      });
      return NextResponse.json({ ok: true, sample: (res.text || "").slice(0, 80) });
    }

    const input: GenerateInput = {
      topic: String(body.topic ?? "").trim(),
      notes: String(body.notes ?? "").trim(),
      sources: Array.isArray(body.sources) ? body.sources.map((s) => String(s)) : [],
      slideCount: Math.max(3, Math.min(15, Number(body.slideCount) || 8)),
      goal: String(body.goal ?? ""),
      handle: String(body.handle ?? "").trim(),
      mustInclude: Array.isArray(body.mustInclude) ? body.mustInclude.map((s) => String(s)) : [],
      lang: String(body.lang ?? "en"),
    };

    if (!input.topic) {
      return NextResponse.json({ error: "A topic is required." }, { status: 400 });
    }

    const model = buildModel(settings);
    const result = await generateText({
      model,
      system: buildSystemPrompt(),
      prompt: buildUserPrompt(input),
      temperature: 0.7,
    });

    const raw = extractJson(result.text);
    const slides = normalizeSlides(raw, { handle: input.handle });
    return NextResponse.json({ slides });
  } catch (err) {
    console.error("[api/generate]", err);
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}