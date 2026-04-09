import { db } from "./db";
import type { ExportData } from "@/types";

const EXPORT_VERSION = 1;

export async function exportAllData(): Promise<void> {
  const [profile, urges, sessionTemplates, chatSessions, messages, apiConfig, dailyStats, memories] =
    await Promise.all([
      db.profile.toArray(),
      db.urges.toArray(),
      db.sessionTemplates.toArray(),
      db.chatSessions.toArray(),
      db.messages.toArray(),
      db.apiConfig.toArray(),
      db.dailyStats.toArray(),
      db.memories.toArray(),
    ]);

  const safeApiConfig = apiConfig.map(({ encryptedApiKey, iv, plaintextKey, ...rest }) => ({
    ...rest,
    encryptedApiKey: undefined,
    iv: undefined,
    plaintextKey: undefined,
  }));

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    profile,
    urges,
    sessionTemplates,
    chatSessions,
    messages,
    apiConfig: safeApiConfig,
    dailyStats,
    memories,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split("T")[0];

  const a = document.createElement("a");
  a.href = url;
  a.download = `behaviour-export-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAllData(file: File): Promise<{ imported: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as ExportData;

  if (!data.version || !data.exportedAt) {
    throw new Error("Invalid export file format");
  }

  let count = 0;

  await db.transaction(
    "rw",
    [
      db.profile,
      db.urges,
      db.sessionTemplates,
      db.chatSessions,
      db.messages,
      db.dailyStats,
      db.memories,
    ],
    async () => {
      if (data.profile?.length) {
        await db.profile.bulkPut(data.profile);
        count += data.profile.length;
      }
      if (data.urges?.length) {
        await db.urges.bulkPut(data.urges);
        count += data.urges.length;
      }
      if (data.sessionTemplates?.length) {
        await db.sessionTemplates.bulkPut(data.sessionTemplates);
        count += data.sessionTemplates.length;
      }
      if (data.chatSessions?.length) {
        await db.chatSessions.bulkPut(data.chatSessions);
        count += data.chatSessions.length;
      }
      if (data.messages?.length) {
        for (const msg of data.messages) {
          const { id, ...rest } = msg;
          if (id) {
            await db.messages.put(msg);
          } else {
            await db.messages.add(rest);
          }
        }
        count += data.messages.length;
      }
      if (data.dailyStats?.length) {
        await db.dailyStats.bulkPut(data.dailyStats);
        count += data.dailyStats.length;
      }
      if (data.memories?.length) {
        await db.memories.bulkPut(data.memories);
        count += data.memories.length;
      }
    }
  );

  return { imported: count };
}

export async function clearAllData(): Promise<void> {
  const { clearCachedKey } = await import("@/lib/crypto");
  clearCachedKey();
  await Promise.all([
    db.profile.clear(),
    db.urges.clear(),
    db.sessionTemplates.clear(),
    db.chatSessions.clear(),
    db.messages.clear(),
    db.apiConfig.clear(),
    db.credentials.clear(),
    db.dailyStats.clear(),
    db.memories.clear(),
  ]);
}
