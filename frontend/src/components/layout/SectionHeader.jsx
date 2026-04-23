export function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</div> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

