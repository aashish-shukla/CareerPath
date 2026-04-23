import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/Progress";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";
import { cn } from "../../lib/ui/cn";
import { Link } from "react-router-dom";

function DifficultyBadge({ difficulty }) {
  const tone =
    difficulty === "Hard" ? "amber" : difficulty === "Medium" ? "neutral" : "emerald";
  return <Badge tone={tone} className="font-bold px-3 py-0.5 rounded-lg text-[10px]">{difficulty}</Badge>;
}

import { Skeleton } from "../../components/ui/Skeleton";

export function SkillGapPage() {
  const [loading, setLoading] = useState(true);
  const [rec, setRec] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get("/api/recommendations/me");
        setRec(data);
      } catch (err) {
        setError(err?.response?.data?.error?.message ?? "Could not load skill gap");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const missing = rec?.skillGap?.missing ?? [];
    const byPriority = { High: [], Medium: [], Low: [] };
    for (const m of missing) (byPriority[m.priority] ?? byPriority.Medium).push(m);
    return byPriority;
  }, [rec]);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:target" className="h-3 w-3" />
            Skills Analysis
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            Skill Growth
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
            A plan to learn the skills you need for your <span className="text-slate-900 dark:text-white font-bold">target role</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/resources">
            <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase italic shadow-xl shadow-indigo-100 dark:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 group">
              Learn Skills
              <Icon icon="lucide:arrow-right" className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
          <div className="space-y-10">
            <Skeleton className="h-96 rounded-[32px]" />
            <Skeleton className="h-64 rounded-[32px]" />
          </div>
          <div className="space-y-10">
            <Skeleton className="h-20 rounded-[24px] w-1/3" />
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-64 rounded-[32px]" />
              <Skeleton className="h-64 rounded-[32px]" />
            </div>
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="card p-16 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-500/10">
          <div className="h-20 w-20 rounded-[24px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400">
            <Icon icon="lucide:zap-off" className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Calibration Error</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium text-base leading-relaxed">
            {error}. Engine synchronization failed.
          </p>
          <div className="mt-10">
            <Link to="/profile/wizard">
              <Button size="lg" className="rounded-xl px-10 h-14 font-black uppercase italic text-xs bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none">Reset Signal Engine</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && rec ? (
        <div className="grid gap-10 lg:grid-cols-[400px_1fr] items-start">
          <div className="space-y-10">
            <Card className="rounded-[32px] overflow-hidden bg-slate-950 text-white border-none py-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
              <CardHeader className="px-8 flex flex-col items-center justify-center text-center relative z-10">
                <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Readiness Index
                </div>
                <div className="text-7xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                  {Math.round(rec.skillGap?.readiness_score ?? 0)}<span className="text-xl ml-1 text-slate-600">%</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-4 pt-8 relative z-10">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                  <div 
                    className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-1000" 
                    style={{ width: `${rec.skillGap?.readiness_score ?? 0}%` }}
                  />
                </div>
                <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Analysis Target</span>
                  <span className="text-lg font-black italic tracking-tight text-white">{rec.top?.career_title ?? "—"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 group hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Icon icon="lucide:network" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase italic tracking-tight leading-none">Market Context</h3>
                    <p className="mt-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Strategic Intelligence</p>
                  </div>
                </div>
                <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic border-l-2 border-indigo-100/50 dark:border-indigo-900/50 pl-6 py-1">
                  "{rec.profileSummary?.summary || "Your roadmap is calculated based on high-frequency market fluctuations."}"
                </p>
                <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <Link to="/app/recommendations">
                    <Button variant="ghost" className="w-full rounded-xl h-12 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                      Review Alternatives
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-12 pt-4">
            {["High", "Medium", "Low"].map((p) => (
              <div key={p}>
                <div className="flex items-center gap-6 mb-8">
                   <div className={cn(
                     "h-2.5 w-2.5 rounded-full",
                     p === 'High' ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]' : 
                     p === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                   )} />
                   <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic leading-none">
                     {p} Priority Skills
                   </h2>
                   <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                      <span className="text-[10px] font-black text-slate-950 dark:text-white">{(groups[p] ?? []).length}</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Modules</span>
                   </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {(groups[p] ?? []).map((m) => (
                    <Card key={m.skill} className="rounded-[32px] border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all hover:shadow-2xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 group bg-white dark:bg-slate-900 overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                             <Icon icon="lucide:cpu" className="h-5 w-5" />
                          </div>
                          <DifficultyBadge difficulty={m.difficulty} />
                        </div>
                        <h4 className="text-xl font-black text-slate-950 dark:text-white tracking-tighter mb-4 leading-none">{m.skill}</h4>
                        <div className="flex items-center gap-6 mb-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Timeline</span>
                              <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{m.estimated_weeks} WEEKS</span>
                           </div>
                           <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />
                           <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Impact</span>
                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{p} SCALE</span>
                           </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          Recommended strategy: Prioritize intensive project cycles and industry-standard certifications to master this skill.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {(groups[p] ?? []).length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center sm:col-span-2">
                      <Icon icon="lucide:check-circle-2" className="h-8 w-8 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Operational Readiness in this Band</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

