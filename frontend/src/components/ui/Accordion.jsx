import { useId } from "react";
import { cn } from "../../lib/ui/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export function AccordionItem({ title, subtitle, children, isOpen, onClick }) {
  const id = useId();

  return (
    <div className={cn(
      "rounded-[24px] transition-all duration-300 overflow-hidden",
      isOpen 
        ? "bg-white dark:bg-slate-900 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)] dark:shadow-none border border-indigo-100/50 dark:border-slate-800" 
        : "bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
    )}>
      <button
        type="button"
        className={cn(
          "w-full px-8 py-6 text-left focus-ring transition-colors",
          isOpen ? "bg-white dark:bg-slate-900" : "hover:bg-white/50 dark:hover:bg-slate-800/50"
        )}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className={cn(
              "text-base font-bold transition-colors",
              isOpen ? "text-indigo-900 dark:text-white" : "text-slate-900 dark:text-slate-200"
            )}>{title}</div>
            {subtitle ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</div> : null}
          </div>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
              isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            )}
            aria-hidden="true"
          >
            <Icon icon="lucide:chevron-down" className="h-5 w-5" />
          </div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden border-t border-slate-50 dark:border-slate-800"
          >
            <div className="px-8 py-6 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

