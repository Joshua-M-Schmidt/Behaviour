"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Profile } from "@/types";

export function useProfile() {
  const profile = useLiveQuery(() => db.profile.get("me"));

  const updateProfile = async (updates: Partial<Omit<Profile, "id">>) => {
    await db.profile.update("me", { ...updates, updatedAt: Date.now() });
  };

  return {
    profile: profile ?? { id: "me", name: "", context: "", updatedAt: 0 },
    updateProfile,
    isLoading: profile === undefined,
  };
}
