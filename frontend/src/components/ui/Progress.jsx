import { cn } from "../../lib/ui/cn";

export function Progress({ value = 0, className }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-100", className)}>
      <div
        className="h-2 rounded-full bg-brand-accent transition-all"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

