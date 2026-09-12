import {
  BarChart3,
  Grid2x2,
  Handshake,
  IdCard,
  LayoutList,
  Percent,
  Store,
  Users,
  Wallet,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  grid: Grid2x2,
  "id-card": IdCard,
  storefront: Store,
  layers: LayoutList,
  chart: BarChart3,
  users: Users,
  wallet: Wallet,
  percent: Percent,
  message: MessageCircle,
  handshake: Handshake,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Grid2x2;
  return <Icon className={className} strokeWidth={1.75} />;
}
