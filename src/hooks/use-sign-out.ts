"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function signOut() {
    setPending(true);
    await signOutAction();
    router.push("/");
    router.refresh();
  }

  return { signOut, pending };
}
