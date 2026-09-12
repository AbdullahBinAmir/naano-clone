"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BookPostButton({ creatorName }: { creatorName: string }) {
  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={() => toast(`Booking ${creatorName} isn't wired up yet — this becomes real once the brand booking flow ships.`)}
    >
      Book a post
    </Button>
  );
}
