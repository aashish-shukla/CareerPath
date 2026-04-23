import { cn } from "../../lib/ui/cn";

export function Card({ className, ...props }) {
  return <div className={cn("card", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

