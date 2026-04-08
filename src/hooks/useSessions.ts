"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { assembleSystemPrompt, gatherRecentActivity } from "@/lib/prompts";
import { extractSessionMemories, gatherMemories } from "@/lib/memory";
import type { ChatSession, SessionOutcome } from "@/types";

export function useSessions(limit?: number) {
  const sessions = useLiveQuery(async () => {
    const query = db.chatSessions.orderBy("startedAt").reverse();
    if (limit) return query.limit(limit).toArray();
    return query.toArray();
  }, [limit]);

  const createSession = async (
    templateId: string,
    urgeId: string | null
  ): Promise<string> => {
    const template = await db.sessionTemplates.get(templateId);
    if (!template) throw new Error("Template not found");

    const profile = await db.profile.get("me");
    const urge = urgeId ? await db.urges.get(urgeId) : undefined;
    const recentActivity = await gatherRecentActivity();
    const memoriesBlock = await gatherMemories();

    const systemPrompt = assembleSystemPrompt(template, profile, urge, recentActivity, memoriesBlock);
    const id = crypto.randomUUID();

    const session: ChatSession = {
      id,
      templateId,
      urgeId,
      title: urge ? `${urge.icon} ${urge.name}` : `${template.icon} ${template.name}`,
      systemPromptSnapshot: systemPrompt,
      startedAt: Date.now(),
      endedAt: null,
      outcome: "unknown",
      messageCount: 0,
    };

    await db.chatSessions.add(session);

    await db.messages.add({
      sessionId: id,
      role: "system",
      content: systemPrompt,
      createdAt: Date.now(),
    });

    const dateKey = new Date().toISOString().split("T")[0];
    const statId = urgeId ? `${urgeId}:${dateKey}` : `general:${dateKey}`;

    const existing = await db.dailyStats.get(statId);
    if (existing) {
      await db.dailyStats.update(statId, {
        sessionsStarted: existing.sessionsStarted + 1,
      });
    } else {
      await db.dailyStats.add({
        id: statId,
        urgeId: urgeId ?? "general",
        date: dateKey,
        sessionsStarted: 1,
        sessionsCurbed: 0,
        sessionsGaveIn: 0,
      });
    }

    return id;
  };

  const endSession = async (sessionId: string, outcome: SessionOutcome) => {
    const session = await db.chatSessions.get(sessionId);
    if (!session) return;

    await db.chatSessions.update(sessionId, {
      endedAt: Date.now(),
      outcome,
    });

    if (outcome === "curbed" || outcome === "gave_in") {
      const dateKey = new Date(session.startedAt).toISOString().split("T")[0];
      const statId = session.urgeId
        ? `${session.urgeId}:${dateKey}`
        : `general:${dateKey}`;

      const stat = await db.dailyStats.get(statId);
      if (stat) {
        const update =
          outcome === "curbed"
            ? { sessionsCurbed: stat.sessionsCurbed + 1 }
            : { sessionsGaveIn: stat.sessionsGaveIn + 1 };
        await db.dailyStats.update(statId, update);
      }
    }

    // Fire-and-forget: extract memories in the background
    extractSessionMemories(sessionId).catch(() => {});
  };

  const deleteSession = async (sessionId: string) => {
    await db.transaction("rw", [db.chatSessions, db.messages], async () => {
      await db.messages.where("sessionId").equals(sessionId).delete();
      await db.chatSessions.delete(sessionId);
    });
  };

  return {
    sessions: sessions ?? [],
    createSession,
    endSession,
    deleteSession,
    isLoading: sessions === undefined,
  };
}
