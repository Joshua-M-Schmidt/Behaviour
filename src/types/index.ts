export type SessionOutcome = "curbed" | "gave_in" | "unknown";
export type TemplateCategory = "cbt" | "calm" | "sleep" | "custom";
export type MessageRole = "system" | "user" | "assistant";
export type Theme = "light" | "dark";

export interface Profile {
  id: string;
  name: string;
  context: string;
  updatedAt: number;
}

export interface Urge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  sortOrder: number;
  createdAt: number;
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  category: TemplateCategory;
  urgeId: string | null;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  templateId: string;
  urgeId: string | null;
  title: string;
  systemPromptSnapshot: string;
  startedAt: number;
  endedAt: number | null;
  outcome: SessionOutcome;
  messageCount: number;
}

export interface Message {
  id?: number;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface ApiConfig {
  id: string;
  provider: string;
  baseUrl: string;
  model: string;
  encryptedApiKey: ArrayBuffer | null;
  iv: ArrayBuffer | null;
  plaintextKey: string | null;
  isConfigured: boolean;
}

export interface WebAuthnCredential {
  id: string;
  credentialId: ArrayBuffer;
  prfEnabled: boolean;
  createdAt: number;
}

export interface DailyStat {
  id: string;
  urgeId: string;
  date: string;
  sessionsStarted: number;
  sessionsCurbed: number;
  sessionsGaveIn: number;
}

export interface Memory {
  id: string;
  sessionId: string;
  urgeId: string | null;
  content: string;
  createdAt: number;
}

export interface ExportData {
  version: number;
  exportedAt: number;
  profile: Profile[];
  urges: Urge[];
  sessionTemplates: SessionTemplate[];
  chatSessions: ChatSession[];
  messages: Message[];
  apiConfig: Omit<ApiConfig, "encryptedApiKey" | "iv" | "plaintextKey">[];
  dailyStats: DailyStat[];
  memories?: Memory[];
}
