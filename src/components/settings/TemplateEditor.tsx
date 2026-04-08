"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import type { SessionTemplate } from "@/types";

export function TemplateEditor() {
  const templates = useLiveQuery(() => db.sessionTemplates.toArray());
  const [editing, setEditing] = useState<SessionTemplate | null>(null);
  const [editPrompt, setEditPrompt] = useState("");

  const handleEdit = (t: SessionTemplate) => {
    setEditing(t);
    setEditPrompt(t.systemPrompt);
  };

  const handleSave = async () => {
    if (!editing) return;
    await db.sessionTemplates.update(editing.id, {
      systemPrompt: editPrompt,
    });
    setEditing(null);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Session Templates
      </h2>

      <div className="space-y-2">
        {(templates ?? []).map((t) => (
          <button
            key={t.id}
            onClick={() => handleEdit(t)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left hover:shadow-card transition-all"
          >
            <span className="text-xl">{t.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {t.description}
              </div>
            </div>
            {t.isBuiltIn && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                Built-in
              </span>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit: ${editing?.name ?? ""}`}
      >
        {editing && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              {editing.isBuiltIn
                ? "This is a built-in template. Your edits will persist and apply to all new sessions of this type."
                : "Edit the system prompt for this custom template."}
            </p>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full h-72 bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none font-mono leading-relaxed"
            />
            <Button
              onClick={handleSave}
              disabled={editPrompt === editing.systemPrompt}
              className="w-full"
            >
              Save Template
            </Button>
          </div>
        )}
      </Sheet>
    </section>
  );
}
