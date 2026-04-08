"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { UrgeCard } from "@/components/urges/UrgeCard";
import { UrgeForm } from "@/components/urges/UrgeForm";
import { useUrges } from "@/hooks/useUrges";
import type { Urge } from "@/types";

export default function UrgesPage() {
  const { urges, addUrge, updateUrge, deleteUrge } = useUrges();
  const [showForm, setShowForm] = useState(false);
  const [editingUrge, setEditingUrge] = useState<Urge | undefined>();

  const handleEdit = (urge: Urge) => {
    setEditingUrge(urge);
    setShowForm(true);
  };

  const handleSave = async (
    data: Omit<Urge, "id" | "sortOrder" | "createdAt">
  ) => {
    if (editingUrge) {
      await updateUrge(editingUrge.id, data);
    } else {
      await addUrge(data);
    }
    setEditingUrge(undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this urge? This won't delete past sessions.")) {
      await deleteUrge(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Urges"
        rightAction={
          <Button
            size="sm"
            onClick={() => {
              setEditingUrge(undefined);
              setShowForm(true);
            }}
          >
            + Add
          </Button>
        }
      />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {urges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-sm text-[var(--text-secondary)]">
              No urges yet. Add your first urge to get started.
            </p>
          </div>
        )}
        {urges.map((urge) => (
          <UrgeCard
            key={urge.id}
            urge={urge}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <UrgeForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUrge(undefined);
        }}
        onSave={handleSave}
        initial={editingUrge}
      />
    </div>
  );
}
