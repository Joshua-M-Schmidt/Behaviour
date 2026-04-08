"use client";

import { useEffect } from "react";
import { ensureDefaults } from "@/lib/db";

export function DbInitializer() {
  useEffect(() => {
    ensureDefaults();
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }
  }, []);
  return null;
}
