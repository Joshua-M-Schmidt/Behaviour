"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Urge } from "@/types";

export function useUrges() {
  const urges = useLiveQuery(() => db.urges.orderBy("sortOrder").toArray());

  const addUrge = async (
    urge: Omit<Urge, "id" | "sortOrder" | "createdAt">
  ) => {
    const maxOrder = await db.urges.orderBy("sortOrder").last();
    const sortOrder = (maxOrder?.sortOrder ?? -1) + 1;
    const id = crypto.randomUUID();
    await db.urges.add({ ...urge, id, sortOrder, createdAt: Date.now() });
    return id;
  };

  const updateUrge = async (id: string, updates: Partial<Omit<Urge, "id">>) => {
    await db.urges.update(id, updates);
  };

  const deleteUrge = async (id: string) => {
    await db.urges.delete(id);
  };

  const reorderUrges = async (orderedIds: string[]) => {
    await db.transaction("rw", db.urges, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.urges.update(orderedIds[i], { sortOrder: i });
      }
    });
  };

  return {
    urges: urges ?? [],
    addUrge,
    updateUrge,
    deleteUrge,
    reorderUrges,
    isLoading: urges === undefined,
  };
}
