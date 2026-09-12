import * as React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber, formatCurrency, initials } from "@/lib/utils";
import type { CreatorCard, CreatorProfile } from "@/types/domain";

export function CreatorCardPreview({
  profile,
  card,
  reach,
  footer,
}: {
  profile: CreatorProfile;
  card: CreatorCard;
  reach?: number | null;
  footer?: React.ReactNode;
}) {
  return (
    <div className="glass-surface-strong overflow-hidden rounded-xl">
      <div className="relative h-28 w-full bg-gradient-to-br from-accent/25 via-surface-2 to-surface-1">
        <Image
          src={card.bannerUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 480px"
          className="object-cover opacity-70"
        />
      </div>
      <div className="px-6 pb-6">
        <div className="-mt-10 flex items-end justify-between">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName}
            fallback={initials(profile.displayName)}
            size="lg"
            className="border-4 border-surface-1"
          />
        </div>

        <h3 className="mt-4 text-xl font-semibold">{profile.displayName}</h3>
        <p className="text-sm text-foreground-muted">{profile.headline}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-foreground-subtle">
          <MapPin className="h-3 w-3" strokeWidth={1.75} />
          {profile.location}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.categoryTags.map((tag) => (
            <Badge key={tag} variant="accent">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="mt-4 text-sm text-foreground-muted">{profile.bio}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
          <div>
            <p className="text-lg font-semibold">{formatCompactNumber(profile.followerCount)}</p>
            <p className="text-xs text-foreground-subtle">Followers</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{reach ? formatCompactNumber(reach) : "—"}</p>
            <p className="text-xs text-foreground-subtle">Est. impressions</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-accent">{formatCurrency(card.pricePerPost)}</p>
            <p className="text-xs text-foreground-subtle">Per post</p>
          </div>
        </div>

        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  );
}
