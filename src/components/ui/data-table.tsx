import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: React.ReactNode;
}) {
  if (rows.length === 0 && emptyState) {
    return <div className="glass-surface rounded-lg px-6 py-16 text-center">{emptyState}</div>;
  }

  return (
    <div className="glass-surface overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-foreground-subtle uppercase tracking-wide">
              {columns.map((col) => (
                <th key={col.header} className={cn("px-4 py-3 font-medium", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border/60 last:border-0 hover:bg-white/[0.025]">
                {columns.map((col) => (
                  <td key={col.header} className={cn("px-4 py-3 align-middle", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
