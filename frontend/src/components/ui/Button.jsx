import { cn } from "../../lib/ui/cn";

export function Button({ variant = "primary", size = "md", className, as: Component = "button", ...props }) {
  const variants = {
    primary: "btn-base btn-primary",
    secondary: "btn-base btn-secondary",
    ghost: "btn-base btn-ghost",
    subtle: "btn-base btn-subtle",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-ring disabled:opacity-60 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

