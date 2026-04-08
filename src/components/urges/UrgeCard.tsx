"use client";

import type { Urge } from "@/types";

interface UrgeCardProps {
  urge: Urge;
  onEdit: (urge: Urge) => void;
  onDelete: (id: string) => void;
}

export function UrgeCard({ urge, onEdit, onDelete }: UrgeCardProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-fade-in-up"
      style={{ borderLeft: `3px solid ${urge.color}` }}
    >
      <span className="text-2xl">{urge.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{urge.name}</div>
        {urge.description && (
          <div className="text-xs text-[var(--text-secondary)] truncate">
            {urge.description}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(urge)}
          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(urge.id)}
          className="p-2 rounded-lg hover:bg-[var(--error)]/10 transition-colors text-[var(--text-secondary)] hover:text-[var(--error)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
