import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { AccordionItem } from "../../components/ui/Accordion";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/ui/cn";
import { Skeleton } from "../../components/ui/Skeleton";

function SkillChip({ text, tone = "neutral" }) {
  return (
    <Badge tone={tone} className="rounded-lg px-3 py-0.5 font-bold uppercase text-[10px] tracking-wider">
      {text}
    </Badge>
  );
}

export function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [rec, setRec] = useState(null);
  const [error, setError] = useState("");
  const [openIdx, setOpenIdx] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get("/api/recommendations/me");
        console.log("[Recommendations] ATS Score received:", data?.atsScore);
        setRec(data);
      } catch (err) {
        setError(err?.response?.data?.error?.message ?? "Could not load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:map" className="h-3.5 w-3.5" />
            Career Pathways
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            Career Analysis
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
            AI-generated career paths based on <span className="text-slate-900 dark:text-white font-bold">real-time market demand</span> and your unique professional background.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/profile">
            <Button className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Update Profile
              <Icon icon="lucide:refresh-ccw" className="ml-2.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <Skeleton className="h-72 rounded-[40px]" />
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-56 rounded-[32px]" />
              <Skeleton className="h-56 rounded-[32px]" />
            </div>
            <Skeleton className="h-96 rounded-[40px]" />
          </div>
          <div className="space-y-10">
            <Skeleton className="h-[400px] rounded-[40px]" />
            <Skeleton className="h-[300px] rounded-[40px]" />
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="card p-20 text-center bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-500/10">
          <div className="h-24 w-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400">
            <Icon icon="lucide:clipboard-list" className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Intelligence Gap</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium text-lg">
            {error}. We need more career signals to engineer your optimal path.
          </p>
          <div className="mt-12">
            <Link to="/profile/wizard">
              <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase italic bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-500/20 hover:bg-indigo-700">Initialize Wizard</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && rec ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <Card className="rounded-[32px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-none">
                      <Icon icon="lucide:compass" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tight">Top Career Paths</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">Match Accuracy: {Math.round(rec.careerMatchScore ?? 0)}% Match</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 py-8">
                <div className="space-y-6">
                  {(rec.recommendations ?? []).map((r, idx) => {
                    const title = r.meta?.title ?? r.career_title ?? r.career_id;
                    const desc = r.meta?.description ?? "Role details available.";
                    const confidence = Math.round((r.confidence ?? 0) * 100);
                    const required = r.meta?.topSkills ?? [];
                    const missing = new Set((rec.skillGap?.missing ?? []).map((m) => m.skill));

                    return (
                      <AccordionItem
                        key={r.career_id}
                        isOpen={openIdx === idx}
                        onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                        title={
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{title}</span>
                            <div className="h-1px flex-1 bg-slate-50 dark:bg-slate-800" />
                            <Badge tone="indigo" className="font-black px-2.5 py-1 rounded-full text-[9px] shadow-sm dark:shadow-none border-indigo-100/50 dark:border-indigo-500/50 tracking-widest uppercase">
                              {confidence}% Match
                            </Badge>
                          </div>
                        }
                      >
                         <div className="pt-6 space-y-8">
                            <div className="relative pl-8">
                               <Icon icon="lucide:info" className="absolute left-0 top-0 h-5 w-5 text-indigo-100 dark:text-slate-700" />
                               <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                 "{desc}"
                               </p>
                            </div>
                            
                            <div className="grid gap-6 sm:grid-cols-2">
                              <div className="rounded-[24px] bg-slate-50/50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">
                                <div className="flex items-center gap-2.5 mb-5">
                                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                     <Icon icon="lucide:cpu" className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Technical Delta</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {required.length ? (
                                    required.map((s) => (
                                      <SkillChip key={s} text={s} tone={missing.has(s) ? "amber" : "emerald"} />
                                    ))
                                  ) : (
                                    <div className="text-xs text-slate-600 dark:text-slate-400">No signals detected.</div>
                                  )}
                                </div>
                                <div className="mt-6 flex items-center gap-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                                   <div className="flex items-center gap-1.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mastered</span>
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-amber-600">Skill Gap</span>
                                   </div>
                                </div>
                              </div>

                              <div className="rounded-[24px] bg-slate-950 p-6 border border-slate-800 shadow-2xl shadow-indigo-100/10 dark:shadow-none">
                                <div className="flex items-center gap-2.5 mb-5">
                                  <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                     <Icon icon="lucide:trending-up" className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Market Potential</span>
                                </div>
                                <div className="space-y-5">
                                   <div>
                                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Salary Ceiling (Est)</div>
                                      <div className="text-2xl font-black text-white tracking-tighter">
                                        {r.meta?.salaryRange?.min ?? "—"}–{r.meta?.salaryRange?.max ?? "—"} <span className="text-xs font-bold text-slate-500">{r.meta?.salaryRange?.unit ?? ""}</span>
                                      </div>
                                   </div>
                                   <div className="pt-3 border-t border-slate-800">
                                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Demand Rating</div>
                                      <div className="flex items-center gap-2">
                                        <Badge tone="emerald" className="font-black px-2.5 py-1 rounded-full text-[9px] tracking-widest">CRITICAL DEMAND</Badge>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end pt-2">
                              <Link to="/app/skill-gap">
                                <Button className="rounded-xl h-12 px-8 font-black uppercase italic text-[10px] tracking-wider group bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-500/20 transition-all hover:scale-105">
                                  Engineer Pathway
                                  <Icon icon="lucide:arrow-right" className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                            </div>
                         </div>
                      </AccordionItem>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
               <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <Icon icon="lucide:layers" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tight">Signal Decomposition</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">Neural Network Output Analysis</div>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="px-8 py-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-slate-50/50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
                        <Icon icon="lucide:file-text" className="h-3.5 w-3.5" />
                        Extracted Intent
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium">
                         "{rec.resumeDetails?.summary || "Insufficient resume signals detected. Please upload a structured resume."}"
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-slate-50/50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
                        <Icon icon="lucide:tag" className="h-3.5 w-3.5" />
                        Strategic Keywords
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(rec.resumeDetails?.skills ?? []).slice(0, 15).map((s) => (
                          <Badge key={s} tone="neutral" className="px-3 py-1 font-bold uppercase text-[9px] rounded-lg tracking-widest bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <Card className="rounded-[32px] overflow-hidden bg-slate-950 text-white border-none relative group transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:shadow-none">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-50" />
               <CardHeader className="px-8 py-8 relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2.5 mb-5">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-indigo-400">ATS Readiness Delta</span>
                  </div>
                  <div className="text-6xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                    {rec.atsScore?.score ? `${Math.round(rec.atsScore.score)}%` : "N/A"}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-[0.3em] leading-relaxed max-w-[180px] mx-auto">
                    Global Resume Signal Optimization Index
                  </p>
               </CardHeader>
               <CardContent className="px-8 pb-10 relative z-10">
                  <div className="space-y-4">
                     {(rec.atsScore?.strengths ?? []).slice(0, 3).map((s, i) => (
                       <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200 leading-snug">
                          <Icon icon="lucide:check-circle" className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{s}</span>
                       </div>
                     ))}
                     {(rec.atsScore?.improvements ?? []).slice(0, 3).map((s, i) => (
                       <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-bold text-slate-400 leading-snug opacity-70">
                          <Icon icon="lucide:alert-circle" className="h-4 w-4 text-indigo-700 shrink-0" />
                          <span>{s}</span>
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[32px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
               <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                  <h3 className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tight leading-none">Skill Deficiency</h3>
                  <p className="mt-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Critical Growth Targets</p>
               </CardHeader>
               <CardContent className="px-8 py-8">
                  <div className="space-y-4">
                    {(rec.skillGap?.missing ?? []).slice(0, 10).map((m) => (
                      <div key={m.skill} className="flex items-center justify-between group cursor-default p-3.5 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-950 dark:text-white tracking-tight">{m.skill}</span>
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-widest mt-1",
                             m.priority === "High" ? "text-rose-600" : "text-amber-600"
                           )}>{m.priority} Priority</span>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                           <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                    <div className="pt-6">
                      <Link to="/app/resources">
                        <Button className="w-full rounded-xl h-14 uppercase font-black italic text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-100 dark:shadow-none bg-indigo-600 text-white hover:bg-indigo-700 transition-all hover:-translate-y-1">
                          Find Learning Resources
                        </Button>
                      </Link>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
