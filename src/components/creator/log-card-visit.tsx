"use client";

import * as React from "react";
import { logCardVisitAction } from "@/lib/actions/creator-card";

/** Fires once per page load to log a view against the real card row. Renders nothing. */
export function LogCardVisit({ cardId }: { cardId: string }) {
  React.useEffect(() => {
    logCardVisitAction(cardId);
  }, [cardId]);

  return null;
}
