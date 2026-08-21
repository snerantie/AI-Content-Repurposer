"use client";

import { useState } from "react";
import { PLATFORMS, TONES, type PlatformId, type Tone } from "@/lib/platforms";

interface ResultItem {
  platform: PlatformId;
  text: string | null;
  error: string | null;
}

const SAMPLE = `We spent 6 months A/B testing our onboarding flow. The biggest win wasn't a new feature — it was removing steps. We cut signup from 7 fields to 2, and activation jumped 34%. The lesson: friction is the enemy of growth. Every field you add is a chance for someone to leave.`;

export default function Home() {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState<Tone>("casual");
  const [selected, setSelected] = useState<PlatformId[]>(
    PLATFORMS.map((p) => p.id)
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePlatform = (id: PlatformId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const canGenerate = content.trim().length > 0 && selected.length > 0 && !loading;

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selected, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResults(data.results);
      setUsingMock(Boolean(data.usingMock));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs font-medium text-black/60 dark:text-white/60">
          ⚡ Repurpose AI
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Turn one idea into a week of content
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-black/60 dark:text-white/60 sm:text-base">
          Paste a video transcript, blog post, or voice note. Get a tweet,
          thread, LinkedIn post, Instagram caption, and newsletter blurb —
          instantly.
        </p>
      </header>

      {/* Input card */}
      <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium">
            Your source content
          </label>
          <button
            type="button"
            onClick={() => setContent(SAMPLE)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            Try a sample
          </button>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="Paste your content here…"
          className="w-full resize-y rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/15 dark:bg-black/40"
        />
        <div className="mt-1 text-right text-xs text-black/40 dark:text-white/40">
          {content.length.toLocaleString()} / 12,000
        </div>

        {/* Tone */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  tone === t.id
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-black/15 hover:border-black/30 dark:border-white/20 dark:hover:border-white/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formats */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Formats</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  title={p.description}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    active
                      ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      : "border-black/15 text-black/50 hover:border-black/30 dark:border-white/20 dark:text-white/50"
                  }`}
                >
                  <span className="mr-1">{p.emoji}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Repurposing…" : "Repurpose content ✨"}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </section>

      {/* Results */}
      {(loading || results) && (
        <section className="mt-8 space-y-4">
          {usingMock && results && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Demo mode: no AI key configured, showing mock output. Set{" "}
              <code className="font-mono">AI_API_KEY</code> to enable real
              generation.
            </p>
          )}

          {loading &&
            selected.map((id) => (
              <div
                key={id}
                className="animate-pulse rounded-2xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className="mb-3 h-4 w-32 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-16 rounded bg-black/5 dark:bg-white/5" />
              </div>
            ))}

          {results?.map((r) => {
            const meta = PLATFORMS.find((p) => p.id === r.platform);
            return (
              <article
                key={r.platform}
                className="rounded-2xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span>{meta?.emoji}</span>
                    {meta?.label}
                  </h3>
                  {r.text && (
                    <button
                      type="button"
                      onClick={() => copy(r.text!, r.platform)}
                      className="rounded-lg border border-black/15 px-2.5 py-1 text-xs transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                    >
                      {copiedId === r.platform ? "Copied ✓" : "Copy"}
                    </button>
                  )}
                </div>
                {r.text ? (
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-black/80 dark:text-white/80">
                    {r.text}
                  </pre>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {r.error}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-black/40 dark:text-white/40">
        Built with Next.js · Ready to sell on Whop
      </footer>
    </main>
  );
}
