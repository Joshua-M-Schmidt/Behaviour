import type { ChatSession, Profile, SessionTemplate, Urge } from "@/types";
import { db } from "./db";

export const CBT_SYSTEM_PROMPT = `You are a compassionate and skilled cognitive behavioral therapy (CBT) guide. Your role is to help the user work through urges and cravings in real-time using evidence-based CBT techniques.

Your approach:
- Start by acknowledging the user's feelings without judgment
- Help identify automatic thoughts and cognitive distortions (catastrophizing, all-or-nothing thinking, emotional reasoning, etc.)
- Use Socratic questioning to gently challenge unhelpful thoughts
- Suggest concrete behavioral alternatives and coping strategies
- Encourage the user to rate their urge intensity (1-10) at the start and periodically throughout
- Celebrate small victories and progress
- Keep responses concise and conversational — this is a real-time moment of need, not a lecture

Remember: You are not a replacement for professional therapy. You are a supportive tool to help in the moment. If the user expresses serious distress or danger, encourage them to reach out to a professional or crisis line.

Use markdown formatting for clarity: **bold** for key concepts, bullet points for lists of techniques, and headers when walking through multi-step exercises.`;

export const CALM_DOWN_SYSTEM_PROMPT = `You are a calm, soothing presence helping the user through a moment of anxiety or distress. Your tone is warm, unhurried, and reassuring.

Your approach:
- Speak in short, gentle sentences
- Guide through breathing exercises (like 4-7-8: breathe in for 4 counts, hold for 7, exhale for 8)
- Lead grounding exercises (5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste)
- Offer simple affirmations and gentle reassurance
- Match the user's pace — don't rush
- Use spacing and line breaks generously for a peaceful reading experience

Keep responses short and calming. Avoid complex language or long paragraphs. This is about presence, not analysis.`;

export const SLEEP_SYSTEM_PROMPT = `You are a gentle sleep guide helping the user wind down and fall asleep. Your tone is quiet, slow-paced, and deeply relaxing.

Your approach:
- Use short, soft sentences with lots of ellipses and gentle pauses...
- Guide through progressive muscle relaxation (start from toes, work up)
- Lead slow body scan meditations
- Offer sleep hygiene reminders when appropriate (dim lights, put away screens after this chat, cool room)
- Count slowly, describe peaceful imagery (waves, clouds, starlight)
- Gradually make your responses shorter and quieter as the conversation progresses
- Never use **bold** or CAPS — keep everything lowercase and gentle

The goal is to bore the user to sleep in the best possible way. Be monotonous on purpose. Repeat calming phrases. Let silence do the work.`;

export async function gatherRecentActivity(): Promise<string | null> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const recentSessions = await db.chatSessions
    .where("startedAt")
    .above(sevenDaysAgo)
    .reverse()
    .sortBy("startedAt");

  if (recentSessions.length === 0) return null;

  const urges = await db.urges.toArray();
  const urgeMap = new Map(urges.map((u) => [u.id, u]));

  const lines: string[] = [];
  const urgeCounts = new Map<string, { total: number; curbed: number; gaveIn: number }>();

  for (const s of recentSessions) {
    const key = s.urgeId ?? "general";
    const prev = urgeCounts.get(key) ?? { total: 0, curbed: 0, gaveIn: 0 };
    prev.total++;
    if (s.outcome === "curbed") prev.curbed++;
    if (s.outcome === "gave_in") prev.gaveIn++;
    urgeCounts.set(key, prev);
  }

  for (const [urgeId, counts] of urgeCounts) {
    const urge = urgeMap.get(urgeId);
    const name = urge ? `${urge.icon} ${urge.name}` : "General";
    const parts = [`${name}: ${counts.total} session${counts.total !== 1 ? "s" : ""}`];
    if (counts.curbed > 0) parts.push(`${counts.curbed} curbed`);
    if (counts.gaveIn > 0) parts.push(`${counts.gaveIn} gave in`);
    lines.push(`- ${parts.join(", ")}`);
  }

  const last5 = recentSessions.slice(0, 5);
  const logLines = last5.map((s) => {
    const urge = s.urgeId ? urgeMap.get(s.urgeId) : null;
    const label = urge ? `${urge.icon} ${urge.name}` : s.title;
    const time = formatRelativeTime(s.startedAt);
    const outcome =
      s.outcome === "curbed" ? "curbed ✓"
      : s.outcome === "gave_in" ? "gave in"
      : s.endedAt ? "completed" : "ongoing";
    return `- ${time}: ${label} → ${outcome}`;
  });

  const totalCurbed = [...urgeCounts.values()].reduce((a, c) => a + c.curbed, 0);
  const totalGaveIn = [...urgeCounts.values()].reduce((a, c) => a + c.gaveIn, 0);
  const resolved = totalCurbed + totalGaveIn;
  const curbRate = resolved > 0 ? Math.round((totalCurbed / resolved) * 100) : null;

  const parts: string[] = [
    `--- Recent activity (last 7 days) ---`,
    `Total sessions: ${recentSessions.length}${curbRate !== null ? ` | Overall curb rate: ${curbRate}%` : ""}`,
    "",
    "By urge:",
    ...lines,
    "",
    "Recent sessions:",
    ...logLines,
  ];

  if (curbRate !== null && curbRate >= 70) {
    parts.push("", "The user has been doing well recently — acknowledge their progress when appropriate.");
  } else if (curbRate !== null && curbRate < 30 && resolved >= 3) {
    parts.push("", "The user has been struggling recently — be extra compassionate and avoid anything that feels judgmental.");
  }

  return parts.join("\n");
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function assembleSystemPrompt(
  template: SessionTemplate,
  profile: Profile | undefined,
  urge?: Urge,
  recentActivity?: string | null,
  memories?: string | null
): string {
  const layers: string[] = [template.systemPrompt];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  layers.push(`Current date and time: ${dateStr}, ${timeStr}`);

  if (profile?.context?.trim()) {
    layers.push(
      `--- About the user ---\nThe user has shared the following about themselves. Use this context to personalize your responses:\n\n${profile.context.trim()}`
    );
  }

  if (profile?.name?.trim()) {
    layers.push(
      `The user's name is ${profile.name.trim()}. Address them by name occasionally to keep the conversation personal.`
    );
  }

  if (recentActivity) {
    layers.push(recentActivity);
  }

  if (memories) {
    layers.push(memories);
  }

  if (urge) {
    const urgeBlock = [
      `--- Current urge: ${urge.name} ---`,
      urge.description &&
        `Description: ${urge.description}`,
      urge.systemPrompt?.trim() &&
        `Additional instructions for this urge:\n${urge.systemPrompt.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    layers.push(urgeBlock);
  }

  return layers.join("\n\n");
}

export const BUILT_IN_TEMPLATES: Omit<SessionTemplate, "createdAt">[] = [
  {
    id: "cbt-default",
    name: "CBT Session",
    description: "Active cognitive behavioral therapy dialogue to work through urges",
    icon: "🧠",
    systemPrompt: CBT_SYSTEM_PROMPT,
    category: "cbt",
    urgeId: null,
    isBuiltIn: true,
  },
  {
    id: "calm-default",
    name: "Calm Down",
    description: "Guided breathing and grounding exercises for anxiety relief",
    icon: "🌊",
    systemPrompt: CALM_DOWN_SYSTEM_PROMPT,
    category: "calm",
    urgeId: null,
    isBuiltIn: true,
  },
  {
    id: "sleep-default",
    name: "Fall Asleep",
    description: "Progressive relaxation and body scan for peaceful sleep",
    icon: "🌙",
    systemPrompt: SLEEP_SYSTEM_PROMPT,
    category: "sleep",
    urgeId: null,
    isBuiltIn: true,
  },
];
