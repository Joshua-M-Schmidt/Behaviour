"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { useCrypto } from "@/hooks/useCrypto";

export function ApiConfigSection() {
  const { apiConfig, updateApiConfig } = useSettings();
  const { encrypt, hasCredential, isAuthenticating } = useCrypto();
  const [provider, setProvider] = useState(apiConfig.provider);
  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [model, setModel] = useState(apiConfig.model);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveConfig = async () => {
    await updateApiConfig({ provider, baseUrl, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    const hasCred = await hasCredential();
    if (hasCred) {
      await encrypt(apiKey.trim());
    } else {
      const { db } = await import("@/lib/db");
      await db.apiConfig.update("default", {
        plaintextKey: apiKey.trim(),
        isConfigured: true,
      });
    }
    setApiKey("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        API Configuration
      </h2>

      <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--text-secondary)]">
            Provider
          </label>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="OpenAI"
            className="w-full bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--text-secondary)]">
            Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--text-secondary)]">
            Model
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o"
            className="w-full bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>

        <Button size="sm" onClick={handleSaveConfig} className="w-full">
          {saved ? "Saved ✓" : "Save Config"}
        </Button>
      </div>

      <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-[var(--text-secondary)]">
            API Key
          </label>
          <div className="flex items-center gap-2">
            {apiConfig.isConfigured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--success-light)] text-[var(--success)] font-medium">
                Configured
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={apiConfig.isConfigured ? "Enter new key to replace" : "sk-..."}
            className="w-full bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 font-mono text-xs"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showKey ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        <Button
          size="sm"
          onClick={handleSaveKey}
          disabled={!apiKey.trim() || isAuthenticating}
          className="w-full"
        >
          {isAuthenticating ? "Authenticating..." : "Save API Key"}
        </Button>
      </div>
    </section>
  );
}
