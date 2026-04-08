"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { exportAllData, importAllData, clearAllData } from "@/lib/data-transfer";
import { ensureDefaults } from "@/lib/db";

export function DataSection() {
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      await exportAllData();
      setStatus("Export downloaded");
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus(
        `Export failed: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const result = await importAllData(file);
        await ensureDefaults();
        setStatus(`Imported ${result.imported} records`);
        setTimeout(() => setStatus(null), 3000);
      } catch (err) {
        setStatus(
          `Import failed: ${err instanceof Error ? err.message : "Invalid file"}`
        );
      }
    };
    input.click();
  };

  const handleClear = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all data? This cannot be undone."
      )
    )
      return;
    if (!confirm("Really? All sessions, urges, and settings will be lost."))
      return;
    await clearAllData();
    await ensureDefaults();
    setStatus("All data cleared");
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Data
      </h2>

      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
        <p className="text-xs text-[var(--text-secondary)]">
          Export your data as a JSON file to transfer to another device.
          API keys are excluded for security.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleExport} className="flex-1">
            Export Data
          </Button>
          <Button size="sm" variant="secondary" onClick={handleImport} className="flex-1">
            Import Data
          </Button>
        </div>
        <Button size="sm" variant="danger" onClick={handleClear} className="w-full">
          Clear All Data
        </Button>

        {status && (
          <p className="text-xs text-center text-[var(--text-secondary)] animate-fade-in-up">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
