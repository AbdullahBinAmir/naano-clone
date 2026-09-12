import * as React from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-medium text-foreground-muted">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-foreground-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
