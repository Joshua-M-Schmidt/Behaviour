"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { profile, updateProfile, isLoading } = useProfile();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setName(profile.name);
      setContext(profile.context);
    }
  }, [isLoading, profile.name, profile.context]);

  const handleSave = async () => {
    await updateProfile({ name, context });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = name !== profile.name || context !== profile.context;

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should the AI call you?"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-shadow"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Tell the AI about yourself
          </label>
          <p className="text-xs text-[var(--text-secondary)]">
            Share your situation, triggers, goals, or anything that helps the AI
            understand you better. This context is included in every session.
          </p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., I'm trying to quit smoking. My main triggers are stress at work and social situations. I've been smoke-free for 2 weeks..."
            rows={8}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none transition-shadow leading-relaxed"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full"
        >
          {saved ? "Saved ✓" : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
