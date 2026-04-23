import { cn } from "../../lib/ui/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "input-field h-11 w-full px-3 text-sm focus-ring",
        className
      )}
      {...props}
    />
  );
}

