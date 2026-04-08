"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { ApiConfigSection } from "@/components/settings/ApiConfigSection";
import { WebAuthnSection } from "@/components/settings/WebAuthnSection";
import { TemplateEditor } from "@/components/settings/TemplateEditor";
import { DataSection } from "@/components/settings/DataSection";
import { useDarkMode } from "@/hooks/useDarkMode";
import Link from "next/link";

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        <ApiConfigSection />
        <WebAuthnSection />
        <TemplateEditor />
        <DataSection />

        {/* Appearance */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Appearance
          </h2>
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Auto-activates for sleep sessions
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  isDark ? "bg-[var(--accent)]" : "bg-[var(--bg-tertiary)]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    isDark ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Profile link */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Profile
          </h2>
          <Link
            href="/profile"
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-card transition-all"
          >
            <div>
              <div className="text-sm font-medium">Edit profile</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Name and personal context for AI sessions
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
