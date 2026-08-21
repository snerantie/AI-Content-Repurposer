# ⚡ Repurpose AI — Content Repurposer

Turn **one idea into a week of content**. Paste a video transcript, blog post, or
voice note and instantly get a **tweet, X thread, LinkedIn post, Instagram
caption, and newsletter blurb** — each rewritten for its platform.

Built as a sellable MVP for the **[Whop App Store](https://whop.com/blog/whop-app-store/)**:
developers build the app, creators pay to use it.

---

## ✨ Features

- **5 output formats** in one click: Tweet 🐦, X Thread 🧵, LinkedIn 💼, Instagram 📸, Newsletter 📧
- **5 tones**: Professional, Casual, Witty, Bold, Friendly
- **Copy-to-clipboard** on every result
- **Provider-agnostic AI** — works with OpenAI, Groq, OpenRouter, Together, Ollama, etc.
- **Runs out of the box** — no API key needed for a demo (mock mode)
- **Whop paid-access gating** built in, ready to switch on

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local   # optional — app runs in demo mode without it
npm run dev                  # http://localhost:3000
```

Open the app, paste content (or click **Try a sample**), pick your formats and
tone, and hit **Repurpose content**.

> Without an `AI_API_KEY`, the app runs in **demo/mock mode** and returns
> plausible sample output built from your text — so you can see the full flow
> before adding a key.

---

## 🔑 Enable real AI generation

Set these in `.env.local`:

```bash
AI_API_KEY=sk-...                     # required to leave demo mode
# AI_BASE_URL=https://api.openai.com/v1  # any OpenAI-compatible endpoint
# AI_MODEL=gpt-4o-mini
```

Examples of other providers:

| Provider   | `AI_BASE_URL`                              | Example `AI_MODEL`      |
|------------|--------------------------------------------|-------------------------|
| OpenAI     | `https://api.openai.com/v1` (default)      | `gpt-4o-mini`           |
| Groq       | `https://api.groq.com/openai/v1`           | `llama-3.3-70b-versatile` |
| OpenRouter | `https://openrouter.ai/api/v1`             | `anthropic/claude-3.5-sonnet` |
| Ollama     | `http://localhost:11434/v1`                | `llama3.1`              |

---

## 💰 Selling it on Whop

The app ships with a **fully wired** access gate in [`src/lib/whop.ts`](src/lib/whop.ts)
using the official `@whop/api` SDK (`verifyUserToken` +
`access.checkIfUserHasAccessToExperience`, per the
[Whop auth docs](https://docs.whop.com/developer/guides/authentication)). It runs
**open** by default so you can develop and demo freely — no credentials needed.

To require a paid Whop membership, just set env vars (no code changes):

1. **Create an app** in your [Whop dashboard](https://dash.whop.com) → copy your
   `WHOP_API_KEY`, `WHOP_APP_ID`, and create an **Experience** to get its
   `WHOP_EXPERIENCE_ID`.
2. Set env vars:
   ```bash
   WHOP_ACCESS_ENABLED=true
   WHOP_API_KEY=...
   WHOP_APP_ID=app_...
   NEXT_PUBLIC_WHOP_APP_ID=app_...
   WHOP_EXPERIENCE_ID=exp_...   # the experience that embeds your app
   ```
3. In the Whop dashboard, set your app's **iframe URL** to your deployed app and
   attach the experience to a **paid product**
   ([create a product](https://docs.whop.com/manage-your-business/products/create-product)).

That's it — when the app is opened inside Whop, the `x-whop-user-token` header is
forwarded on same-origin API calls, verified server-side, and the user's
membership is checked before any AI generation runs.

**How gating behaves**

| `WHOP_ACCESS_ENABLED` | Behavior |
|-----------------------|----------|
| `false` / unset       | Open mode — anyone can use it (dev/demo/standalone) |
| `true`                | Requires a valid `x-whop-user-token` and active access. **Fails closed** until the SDK block is uncommented. |

> Whop embeds your app in an iframe and passes a short-lived JWT in the
> `x-whop-user-token` header on every request. You verify it server-side to get
> the user, then confirm they have access.

---

## 🧱 Project structure

```
src/
├─ app/
│  ├─ api/repurpose/route.ts   # POST endpoint: validates input, runs all formats in parallel
│  ├─ layout.tsx               # metadata
│  ├─ page.tsx                 # the whole UI (input, tone/format pickers, results)
│  └─ globals.css
└─ lib/
   ├─ platforms.ts             # format + tone definitions (edit here to add formats)
   ├─ ai.ts                    # provider-agnostic AI call + mock fallback
   └─ whop.ts                  # Whop access gate (scaffold)
```

**Add a new output format** by adding an entry to `PLATFORMS` in
`src/lib/platforms.ts` — the API and UI pick it up automatically.

---

## 📦 Deploy

Any Node host works (Vercel, Render, Fly, Railway, a VPS…). For example on
Vercel: push to GitHub, import the repo, add your env vars, deploy. Then point
your Whop app's iframe URL at the deployed domain.

```bash
npm run build && npm run start   # production build locally
```

---

## 🧠 Notes & ideas for v2

- Usage limits / credits per user (tie to Whop plan tiers)
- More formats: YouTube description, TikTok script, cold email, ad copy
- Bulk mode (paste 10 ideas → get 50 posts)
- "Brand voice" memory so outputs match the user's style
- Direct scheduling/export integrations

---

Built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.
