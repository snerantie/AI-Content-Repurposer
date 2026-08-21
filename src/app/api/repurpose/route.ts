import { NextResponse } from "next/server";
import { generate, usingMock } from "@/lib/ai";
import { checkAccess } from "@/lib/whop";
import {
  PLATFORM_IDS,
  TONES,
  type PlatformId,
  type Tone,
} from "@/lib/platforms";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CONTENT_LENGTH = 12000;

interface Body {
  content?: string;
  platforms?: string[];
  tone?: string;
}

export async function POST(request: Request) {
  // Whop paid-access gate (open mode unless WHOP_ACCESS_ENABLED=true).
  const access = await checkAccess(request);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "Please provide some content to repurpose." },
      { status: 400 }
    );
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      {
        error: `Content is too long (${content.length} chars). Max is ${MAX_CONTENT_LENGTH}.`,
      },
      { status: 400 }
    );
  }

  // Validate requested platforms; default to all.
  const requested = Array.isArray(body.platforms) && body.platforms.length
    ? body.platforms
    : [...PLATFORM_IDS];
  const platforms = requested.filter((p): p is PlatformId =>
    (PLATFORM_IDS as string[]).includes(p)
  );
  if (!platforms.length) {
    return NextResponse.json(
      { error: "No valid platforms requested." },
      { status: 400 }
    );
  }

  const tone: Tone = TONES.some((t) => t.id === body.tone)
    ? (body.tone as Tone)
    : "casual";

  // Generate all requested formats in parallel.
  const settled = await Promise.allSettled(
    platforms.map((platform) => generate({ content, platform, tone }))
  );

  const results = platforms.map((platform, i) => {
    const outcome = settled[i];
    if (outcome.status === "fulfilled") {
      return { platform, text: outcome.value, error: null };
    }
    return {
      platform,
      text: null,
      error:
        outcome.reason instanceof Error
          ? outcome.reason.message
          : "Generation failed.",
    };
  });

  return NextResponse.json({ results, tone, usingMock });
}
