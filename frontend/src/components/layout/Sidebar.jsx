import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { cn } from "../../lib/ui/cn";
import { Logo } from "./Logo";
import { authStore } from "../../lib/state/authStore";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
  { to: "/app/recommendations", label: "Pathways", icon: "lucide:map" },
  { to: "/app/ats-checker", label: "ATS Scanner", icon: "lucide:file-check" },
  { to: "/app/chat", label: "AI Copilot", icon: "lucide:sparkles" },
  { to: "/app/skill-gap", label: "Skill Gap", icon: "lucide:target" },
  { to: "/app/resources", label: "Resources", icon: "lucide:book-open" },
  { to: "/app/jobs", label: "Jobs", icon: "lucide:briefcase" },
  { to: "/app/profile", label: "Profile", icon: "lucide:user" },
];

export function Sidebar() {
  const location = useLocation();
  const user = authStore.getUser();
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
      <div className="p-8 pb-6">
        <Logo className="scale-100" />
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
        <div className="px-4 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.3)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )
            }
          >
            <Icon icon={item.icon} className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <Icon icon={isDark ? "lucide:moon" : "lucide:sun"} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest">{isDark ? "Dark" : "Light"} Mode</span>
          </div>
          <div className={cn(
            "w-10 h-6 rounded-full p-1 transition-colors duration-300 border border-transparent",
            isDark ? "bg-indigo-600 border-indigo-400/20" : "bg-slate-200"
          )}>
            <div className={cn(
              "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
              isDark ? "translate-x-4" : "translate-x-0"
            )} />
          </div>
        </button>

        <div className="card p-5 bg-slate-950 dark:bg-slate-800 text-white border-none rounded-3xl overflow-hidden relative group transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg dark:bg-white/5">
                {(user?.name ?? "D")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{user?.name ?? "Demo User"}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pro Plan</div>
              </div>
            </div>
            <button 
              onClick={() => {
                authStore.clear();
                window.location.href = "/login";
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
            >
              Sign Out
              <Icon icon="lucide:log-out" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
