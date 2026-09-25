import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg border border-border", {
  variants: {
    tone: {
      default: "bg-card",
      raised: "bg-card-raised",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-7",
    },
  },
  defaultVariants: { tone: "default", padding: "md" },
});

export interface CardProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof cardVariants> {}

export function Card({ className, tone, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ tone, padding }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mb-4 flex items-center justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("text-lg font-medium text-foreground", className)} {...props} />;
}
