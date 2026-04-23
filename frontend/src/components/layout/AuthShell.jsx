import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "@iconify/react";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-950 dark:text-white antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        <header className="flex items-center justify-between">
          <Link to="/" className="group transition-transform hover:scale-105 active:scale-95">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
             <div className="flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               System Online
             </div>
             <span className="opacity-30">|</span>
             <span>AES-256 Encryption</span>
          </div>
        </header>

        <main className="mt-20 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="p-4">
              <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-6">Market-Linked Intelligence</div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-[0.9] italic uppercase">
                Predict your <br />
                <span className="text-indigo-600 dark:text-indigo-400">trajectory.</span>
              </h1>
              <p className="mt-8 text-xl font-medium leading-relaxed text-slate-500 dark:text-slate-400 max-w-md italic">
                A high-fidelity dashboard transforming profile signals into prioritized <span className="text-slate-900 dark:text-white font-bold">career strategies</span>.
              </p>
              
              <div className="mt-12 grid grid-cols-2 gap-6">
                {[
                  { label: "Neural Drift", val: "Match Accuracy", icon: "lucide:radar" },
                  { label: "Signal Density", val: "Deep Extraction", icon: "lucide:cpu" },
                  { label: "Market Load", val: "Real-time Demand", icon: "lucide:globe" },
                  { label: "Growth Vector", val: "Path Forecasting", icon: "lucide:trending-up" }
                ].map((stat, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-none">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Icon icon={stat.icon} className="h-4 w-4" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">{stat.label}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{stat.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:ml-auto">
            <div className="rounded-[32px] bg-white dark:bg-slate-900 p-10 shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-50 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <Icon icon="lucide:fingerprint" className="h-10 w-10 text-slate-50 dark:text-slate-800 opacity-10" />
              </div>
              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic leading-none">{title}</h2>
                <p className="mt-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
              <div className="space-y-6">
                {children}
              </div>
            </div>
            {footer ? (
              <div className="mt-8 text-center px-6">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                  {footer}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

