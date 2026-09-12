"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BRAND, DEFAULT_CREATOR, type BrandHandleKey, type CreatorHandleKey } from "@/lib/demo-data";

interface DemoPersonaState {
  creator: CreatorHandleKey;
  brand: BrandHandleKey;
  setCreator: (key: CreatorHandleKey) => void;
  setBrand: (key: BrandHandleKey) => void;
}

/**
 * Phase 1 has no real auth, so this stands in for "who am I logged in as."
 * Removed once Phase 2 wires real Supabase sessions and role-based routing.
 */
export const useDemoPersonaStore = create<DemoPersonaState>()(
  persist(
    (set) => ({
      creator: DEFAULT_CREATOR,
      brand: DEFAULT_BRAND,
      setCreator: (key) => set({ creator: key }),
      setBrand: (key) => set({ brand: key }),
    }),
    { name: "naano-demo-persona" },
  ),
);
