"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** The current site origin (e.g. https://app.example.com); empty string during SSR. */
export function useOrigin() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}
