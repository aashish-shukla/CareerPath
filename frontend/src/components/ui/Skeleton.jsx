import { cn } from "../../lib/ui/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50", className)}
      {...props}
    />
  );
}
