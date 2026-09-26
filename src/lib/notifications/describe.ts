import type { NotificationRow } from "@/types/database";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  href: string;
  unread: boolean;
  /** Short relative time ("5m ago"), computed on the server. */
  timeLabel: string;
}

const str = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Turns a raw notification row into display text and a destination for the viewer's role. */
export function describeNotification(row: NotificationRow, role: "creator" | "brand", now = Date.now()): NotificationItem {
  const p = row.payload ?? {};
  const collabs = `/dashboard/${role}/collaborations`;
  const campaign = str(p.campaign_title, "a collaboration");

  let title: string;
  let body: string | null = null;
  let href = collabs;

  switch (row.type) {
    case "application_received":
      title = `${str(p.creator_name, "A creator")} applied to your brief`;
      body = campaign;
      break;
    case "offer_received":
      title = `${str(p.brand_name, "A brand")} sent you an offer`;
      body = typeof p.price === "number" ? `$${p.price.toLocaleString("en-US")} · ${campaign}` : campaign;
      break;
    case "collaboration_accepted":
      title = role === "brand" ? `${str(p.creator_name, "The creator")} accepted your offer` : `${str(p.brand_name, "The brand")} accepted your application`;
      body = campaign;
      break;
    case "collaboration_declined":
      title = role === "brand" ? `${str(p.creator_name, "The creator")} declined your offer` : `${str(p.brand_name, "The brand")} declined your application`;
      body = campaign;
      break;
    case "collaboration_completed":
      title = `${str(p.creator_name, "The creator")} marked a post as published`;
      body = campaign;
      break;
    case "payment_required":
      title = "A deal is waiting for your payment";
      body = campaign;
      break;
    case "deal_funded":
      title = `${str(p.brand_name, "The brand")} funded your deal`;
      body = typeof p.price === "number" ? `You can start work · $${p.price.toLocaleString("en-US")} · ${campaign}` : `You can start work · ${campaign}`;
      break;
    case "new_message":
      title = `New message from ${str(p.sender_name, "someone")}`;
      body = str(p.preview, "") || null;
      href = `/dashboard/${role}/messages${typeof p.conversation_id === "string" ? `?conversation=${p.conversation_id}` : ""}`;
      break;
    default:
      title = "New activity";
  }

  return { id: row.id, title, body, href, unread: row.read_at === null, timeLabel: timeAgo(row.created_at, now) };
}
