"use client";

import { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import type { Urge } from "@/types";

const EMOJI_OPTIONS = [
  "🚬", "🍺", "🍫", "📱", "🎮", "💊", "🛒", "💬",
  "😤", "😰", "🤬", "💸", "🍔", "☕", "🎰", "💅",
  "🧊", "🍷", "🌿", "🎯", "⚡", "🔥", "💭", "🫠",
];

const COLOR_OPTIONS = [
  "#e87461", "#f5a623", "#fcd89d", "#7cb99b", "#5bb3c9",
  "#6b8fd4", "#b8a9c9", "#d4729c", "#8b6f5a", "#a0a0a0",
];

interface UrgeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Urge, "id" | "sortOrder" | "createdAt">) => void;
  initial?: Urge;
}

export function UrgeForm({ open, onClose, onSave, initial }: UrgeFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🔥");
  const [color, setColor] = useState("#e87461");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    if (open && initial) {
      setName(initial.name);
      setIcon(initial.icon);
      setColor(initial.color);
      setDescription(initial.description);
      setSystemPrompt(initial.systemPrompt);
    } else if (open) {
      setName("");
      setIcon("🔥");
      setColor("#e87461");
      setDescription("");
      setSystemPrompt("");
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, description, systemPrompt });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edit Urge" : "New Urge"}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Smoking, Drinking, Doomscrolling"
            className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  icon === e
                    ? "bg-[var(--accent)]/20 ring-2 ring-[var(--accent)] scale-110"
                    : "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Description{" "}
            <span className="text-[var(--text-muted)] font-normal">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this urge"
            className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Custom system prompt{" "}
            <span className="text-[var(--text-muted)] font-normal">
              (optional)
            </span>
          </label>
          <p className="text-xs text-[var(--text-secondary)]">
            Extra instructions appended to the CBT prompt for this urge.
          </p>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g., Focus on urge surfing techniques. Remind me of my reasons for quitting."
            rows={4}
            className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
          />
        </div>

        <Button onClick={handleSave} disabled={!name.trim()} className="w-full">
          {initial ? "Update Urge" : "Add Urge"}
        </Button>
      </div>
    </Sheet>
  );
}
