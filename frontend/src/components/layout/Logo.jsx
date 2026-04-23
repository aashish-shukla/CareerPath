import { cn } from "../../lib/ui/cn";
import { Icon } from "@iconify/react";

export function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
        <Icon icon="lucide:sparkles" className="h-5 w-5 text-white" />
      </div>
      <div className="leading-tight">
        <div className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-white uppercase">CareerPath</div>
        <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">Intelligence</div>
      </div>
    </div>
  );
}

