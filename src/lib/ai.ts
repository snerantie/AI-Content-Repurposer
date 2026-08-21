import { getPlatform, type PlatformId, type Tone } from "./platforms";

// ---------------------------------------------------------------------------
// Provider-agnostic AI layer.
//
// Works with any OpenAI-compatible Chat Completions endpoint (OpenAI, Groq,
// OpenRouter, Together, local Ollama, etc.). Configure with env vars:
//
//   AI_API_KEY   - your provider API key       (or OPENAI_API_KEY)
//   AI_BASE_URL  - base URL of the API          (default: OpenAI)
//   AI_MODEL     - model name                    (default: gpt-4o-mini)
//
// If no API key is set, it falls back to a deterministic MOCK generator so the
// app runs end-to-end out of the box for local dev and demos.
// ---------------------------------------------------------------------------

const API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export const usingMock = !API_KEY;

export interface RepurposeRequest {
  content: string;
  platform: PlatformId;
  tone: Tone;
}

function buildSystemPrompt(): string {
  return [
    "You are an expert social media ghostwriter and copywriter.",
    "You repurpose a piece of source content into a single, ready-to-post output for a specific platform.",
    "Rules:",
    "- Preserve the core message and any facts from the source.",
    "- Do NOT invent statistics, quotes, or claims that are not supported by the source.",
    "- Output ONLY the final post text. No preamble, no explanations, no markdown code fences.",
  ].join("\n");
}

function buildUserPrompt(req: RepurposeRequest): string {
  const platform = getPlatform(req.platform);
  const instruction = platform?.instruction ?? "Repurpose this content.";
  return [
    `Tone: ${req.tone}.`,
    `Format instructions: ${instruction}`,
    "",
    "Source content:",
    '"""',
    req.content.trim(),
    '"""',
  ].join("\n");
}

export async function generate(req: RepurposeRequest): Promise<string> {
  if (usingMock) {
    return mockGenerate(req);
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.8,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(req) },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `AI provider error (${res.status}): ${detail.slice(0, 300) || res.statusText}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI provider returned an empty response.");
  }
  return text;
}

// ---------------------------------------------------------------------------
// Mock generator — no network needed. Deterministic-ish, uses the real source
// content so the demo output is plausible.
// ---------------------------------------------------------------------------

function firstSentence(text: string): string {
  const match = text.trim().match(/[^.!?]+[.!?]?/);
  return (match?.[0] || text).trim();
}

function keyPoints(text: string, n: number): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, n);
}

function mockGenerate(req: RepurposeRequest): string {
  const { content, platform } = req;
  const hook = firstSentence(content).slice(0, 120);
  const points = keyPoints(content, 6);

  switch (platform) {
    case "tweet":
      return `${hook} ${points[0] ? "Here's why it matters 👇" : ""}`.slice(
        0,
        279
      );
    case "thread": {
      const posts = points.length ? points : [hook];
      const lines = [`1/ ${hook}`];
      posts.slice(0, 6).forEach((p, i) => lines.push(`${i + 2}/ ${p}.`));
      lines.push(`${lines.length + 1}/ That's the gist. Save & share ♻️`);
      return lines.join("\n\n");
    }
    case "linkedin":
      return [
        `${hook}`,
        "",
        "Here's what stood out to me:",
        ...points.slice(0, 3).map((p) => `→ ${p}.`),
        "",
        "The takeaway is simple, but most people miss it.",
        "",
        "What would you add?",
      ].join("\n");
    case "instagram":
      return [
        `${hook} ✨`,
        "",
        points[0] ? `${points[0]}.` : "Swipe to learn more.",
        "",
        "Save this for later 📌",
        "",
        "#growth #creators #contentcreation #tips #learn",
      ].join("\n");
    case "newsletter":
      return [
        `Subject: ${hook.slice(0, 60)}`,
        "",
        points[0] ? `${points[0]}.` : hook,
        points[1] ? `${points[1]}.` : "",
        "",
        "Want the full breakdown? Reply and let me know.",
      ]
        .filter(Boolean)
        .join("\n\n");
    default:
      return hook;
  }
}
