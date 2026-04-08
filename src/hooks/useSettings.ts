"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ApiConfig } from "@/types";

const DEFAULT_CONFIG: ApiConfig = {
  id: "default",
  provider: "OpenAI",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
  encryptedApiKey: null,
  iv: null,
  plaintextKey: null,
  isConfigured: false,
};

export function useSettings() {
  const apiConfig = useLiveQuery(() => db.apiConfig.get("default"));

  const updateApiConfig = async (
    updates: Partial<Omit<ApiConfig, "id" | "encryptedApiKey" | "iv" | "plaintextKey">>
  ) => {
    await db.apiConfig.update("default", updates);
  };

  return {
    apiConfig: apiConfig ?? DEFAULT_CONFIG,
    updateApiConfig,
    isLoading: apiConfig === undefined,
  };
}
