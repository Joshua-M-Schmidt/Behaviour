import Dexie, { type Table } from "dexie";
import type {
  Profile,
  Urge,
  SessionTemplate,
  ChatSession,
  Message,
  ApiConfig,
  WebAuthnCredential,
  DailyStat,
  Memory,
} from "@/types";
import { BUILT_IN_TEMPLATES } from "./prompts";

export class BehaviourDB extends Dexie {
  profile!: Table<Profile>;
  urges!: Table<Urge>;
  sessionTemplates!: Table<SessionTemplate>;
  chatSessions!: Table<ChatSession>;
  messages!: Table<Message>;
  apiConfig!: Table<ApiConfig>;
  credentials!: Table<WebAuthnCredential>;
  dailyStats!: Table<DailyStat>;
  memories!: Table<Memory>;

  constructor() {
    super("BehaviourDB");
    this.version(1).stores({
      profile: "id",
      urges: "id, sortOrder",
      sessionTemplates: "id, category, urgeId",
      chatSessions: "id, templateId, urgeId, startedAt",
      messages: "++id, sessionId, createdAt",
      apiConfig: "id",
      credentials: "id",
      dailyStats: "id, urgeId, date",
    });
    this.version(2).stores({
      memories: "id, sessionId, urgeId, createdAt",
    });
  }
}

export const db = new BehaviourDB();

export async function ensureDefaults() {
  const profile = await db.profile.get("me");
  if (!profile) {
    await db.profile.put({
      id: "me",
      name: "",
      context: "",
      updatedAt: Date.now(),
    });
  }

  const apiConfig = await db.apiConfig.get("default");
  if (!apiConfig) {
    await db.apiConfig.put({
      id: "default",
      provider: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o",
      encryptedApiKey: null,
      iv: null,
      plaintextKey: null,
      isConfigured: false,
    });
  }

  for (const template of BUILT_IN_TEMPLATES) {
    const existing = await db.sessionTemplates.get(template.id);
    if (!existing) {
      await db.sessionTemplates.put({
        ...template,
        createdAt: Date.now(),
      });
    }
  }
}
