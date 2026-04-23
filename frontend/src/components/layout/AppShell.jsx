import { ChatWidget } from "../chat/ChatWidget";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#fafbff] dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 py-10">
          <div className="container-page max-w-full px-10 pb-20">
            {children}
          </div>
        </main>

        <footer className="py-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-colors duration-300">
          <div className="container-page max-w-full px-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-[11px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} CareerPath AI Group.
            </div>
            <div className="flex items-center gap-10 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
               <span className="flex items-center gap-3">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                 System Normal
               </span>
               <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Documentation</a>
            </div>
          </div>
        </footer>
      </div>

      <ChatWidget />
    </div>
  );
}
