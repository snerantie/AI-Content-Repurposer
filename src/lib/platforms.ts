// Central definition of the output formats the repurposer supports.
// Add or tweak formats here and the whole app (API + UI) picks them up.

export type PlatformId =
  | "tweet"
  | "thread"
  | "linkedin"
  | "instagram"
  | "newsletter";

export interface Platform {
  id: PlatformId;
  label: string;
  emoji: string;
  /** Short description shown in the UI. */
  description: string;
  /** Instruction injected into the AI prompt for this format. */
  instruction: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "tweet",
    label: "Tweet",
    emoji: "🐦",
    description: "A single punchy tweet (max 280 chars).",
    instruction:
      "Write ONE standalone tweet under 280 characters. Make it punchy and scroll-stopping. No hashtags unless they add real value (max 2).",
  },
  {
    id: "thread",
    label: "X Thread",
    emoji: "🧵",
    description: "A 5–8 post thread with a strong hook.",
    instruction:
      "Write an X/Twitter thread of 5 to 8 posts. Start with a strong hook post that creates curiosity. Number each post like '1/'. Keep each post under 280 characters. End with a takeaway or call to action.",
  },
  {
    id: "linkedin",
    label: "LinkedIn Post",
    emoji: "💼",
    description: "A professional, story-driven post.",
    instruction:
      "Write a LinkedIn post. Open with a 1-line hook, use short single-sentence paragraphs with line breaks, keep a professional but human tone, and end with a question to drive comments. Around 120–200 words.",
  },
  {
    id: "instagram",
    label: "Instagram Caption",
    emoji: "📸",
    description: "An engaging caption with hashtags.",
    instruction:
      "Write an Instagram caption. Start with an attention-grabbing first line, keep it casual and engaging, use tasteful line breaks and 1–3 relevant emojis, and finish with 5–10 relevant hashtags on their own line.",
  },
  {
    id: "newsletter",
    label: "Newsletter Blurb",
    emoji: "📧",
    description: "A short email section with subject line.",
    instruction:
      "Write a short newsletter section. Include a compelling subject line prefixed with 'Subject: ', then 2–3 short paragraphs summarizing the key idea in a warm, direct voice, ending with one clear call to action.",
  },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export type Tone = "professional" | "casual" | "witty" | "bold" | "friendly";

export const TONES: { id: Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "witty", label: "Witty" },
  { id: "bold", label: "Bold" },
  { id: "friendly", label: "Friendly" },
];
