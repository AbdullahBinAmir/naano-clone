import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { describeNotification, type NotificationItem } from "@/lib/notifications/describe";

export interface NotificationsSummary {
  items: NotificationItem[];
  unreadCount: number;
}

/**
 * The viewer's latest notifications plus their total unread count. Best-effort:
 * if the notifications migration hasn't been applied (or the read fails) the
 * bell simply shows nothing rather than breaking the whole dashboard shell.
 */
export async function getNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "creator" | "brand",
): Promise<NotificationsSummary> {
  const [{ data, error }, { count }] = await Promise.all([
    supabase.from("notifications").select("*").eq("profile_id", userId).order("created_at", { ascending: false }).limit(12),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("profile_id", userId).is("read_at", null),
  ]);
  if (error) return { items: [], unreadCount: 0 };

  const now = Date.now();
  return { items: (data ?? []).map((row) => describeNotification(row, role, now)), unreadCount: count ?? 0 };
}
