import OpenAI from "openai";
import { db } from "./db";

const EXTRACTION_PROMPT = `You are a memory compression system for a CBT urge-tracking app. After a user completes a session, you extract ONLY the most important, reusable insights.

Rules:
- Output 1-4 bullet points, MAXIMUM. Often 1-2 is enough. If nothing noteworthy happened, output "NONE".
- Each bullet must be a single short sentence (under 20 words).
- Only capture things that would help a FUTURE session be more effective:
  * Key triggers discovered (e.g., "stress from boss meetings triggers smoking urge")
  * Techniques that worked or didn't (e.g., "urge surfing helped, distraction didn't")
  * Cognitive distortions identified (e.g., "tends toward catastrophizing about failure")
  * Personal breakthroughs or realizations
  * Patterns the user mentioned (e.g., "urges strongest between 2-4pm")
  * Specific coping strategies the user responded well to
- Do NOT capture: greetings, small talk, generic advice given, the session outcome itself (that's tracked separately), or anything already in the user profile.
- Write from a third-person clinical perspective (e.g., "User discovered..." not "You discovered...")
- Be ruthlessly selective. Most sessions will only have 1-2 noteworthy items. Some will have none.

Output format: one bullet point per line, starting with "- ". Or just "NONE" if nothing is worth remembering.`;

export async function extractSessionMemories(sessionId: string): Promise<void> {
  const config = await db.apiConfig.get("default");
  if (!config?.isConfigured) return;

  const session = await db.chatSessions.get(sessionId);
  if (!session) return;

  const messages = await db.messages
    .where("sessionId")
    .equals(sessionId)
    .sortBy("createdAt");

  const conversationMessages = messages.filter((m) => m.role !== "system");
  if (conversationMessages.length < 2) return;

  let apiKey: string;
  try {
    const { getApiKey } = await import("@/lib/crypto");
    apiKey = await getApiKey();
  } catch {
    return;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true,
  });

  const transcript = conversationMessages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const contextLine = session.urgeId
    ? `Urge: ${session.title} | Outcome: ${session.outcome}`
    : `Session: ${session.title} | Outcome: ${session.outcome}`;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `${contextLine}\n\n--- Conversation ---\n${transcript}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result || result === "NONE") return;

    const bullets = result
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => l.slice(2).trim())
      .filter((l) => l.length > 0);

    if (bullets.length === 0) return;

    const content = bullets.join("\n");

    await db.memories.add({
      id: crypto.randomUUID(),
      sessionId,
      urgeId: session.urgeId,
      content,
      createdAt: Date.now(),
    });
  } catch {
    // Memory extraction is best-effort; don't block the user flow
  }
}

export async function gatherMemories(): Promise<string | null> {
  const memories = await db.memories.orderBy("createdAt").reverse().toArray();
  if (memories.length === 0) return null;

  const urges = await db.urges.toArray();
  const urgeMap = new Map(urges.map((u) => [u.id, u]));

  const grouped = new Map<string, string[]>();

  for (const m of memories) {
    const key = m.urgeId ?? "general";
    const prev = grouped.get(key) ?? [];
    for (const line of m.content.split("\n")) {
      if (line.trim()) prev.push(line.trim());
    }
    grouped.set(key, prev);
  }

  const sections: string[] = ["--- Accumulated memories from past sessions ---"];

  for (const [urgeId, items] of grouped) {
    const urge = urgeMap.get(urgeId);
    const label = urge ? `${urge.icon} ${urge.name}` : "General";

    const deduplicated = [...new Set(items)];
    const recent = deduplicated.slice(0, 10);

    sections.push(`\n${label}:`);
    for (const item of recent) {
      sections.push(`- ${item}`);
    }
  }

  sections.push(
    "\nUse these memories to personalize the session. Reference relevant insights naturally — don't list them back to the user."
  );

  return sections.join("\n");
}
