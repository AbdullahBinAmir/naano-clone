import type { AppRole } from "@/types/database";

/** Where each role lands after signing in. */
export function homePathFor(role: AppRole): string {
  if (role === "admin") return "/dashboard/admin";
  return role === "brand" ? "/dashboard/brand/overview" : "/dashboard/creator/overview";
}
