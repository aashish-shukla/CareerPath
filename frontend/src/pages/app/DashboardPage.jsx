import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";
import { cn } from "../../lib/ui/cn";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { authStore } from "../../lib/state/authStore";

import { Skeleton } from "../../components/ui/Skeleton";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [rec, setRec] = useState(null);
  const [market, setMarket] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [r1, r2, r3] = await Promise.all([
        http.get("/api/recommendations/me").catch(() => ({ data: null })),
        http.get("/api/market-insights").catch(() => ({ data: null })),
        http.get("/api/profile/me").catch(() => ({ data: { profile: null } })),
      ]);
      setRec(r1.data);
      setMarket(r2.data?.marketInsights ?? null);
      setProfile(r3.data?.profile ?? null);
      
      // Debug log for ATS score
      console.log("[Dashboard] ATS Score received:", r1.data?.atsScore);
      
      setLoading(false);
    })();
  }, []);

  const top = rec?.top ?? null;
  const topMeta = rec?.recommendations?.[0]?.meta ?? null;
  const summary = profile?.profileSummary?.summary ?? "";
  const profileName =
    profile?.fullName ||
    profile?.resume?.parsed?.name ||
    profile?.resume?.details?.name ||
    profile?.userId?.name ||
    authStore.getUser()?.name ||
    "User";
  const skillCount = profile?.skills?.length ?? 0;
  const expYears = profile?.experience?.years ?? 0;

  const demandLine = useMemo(() => market?.demandIndex ?? [], [market]);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:zap" className="h-3.5 w-3.5" />
            Performance Overview
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            Welcome back, {profileName.split(" ")[0]}
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed max-w-xl">
            Your career progress is currently tracking at <span className="text-slate-900 dark:text-slate-200 font-bold">84% speed</span> relative to goals.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/app/recommendations">
            <Button className="h-12 px-6 rounded-xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-tight group transition-all hover:-translate-y-0.5">
              Update Goals
              <Icon icon="lucide:arrow-right" className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-32 rounded-[32px]" />
            <Skeleton className="h-32 rounded-[32px]" />
            <Skeleton className="h-32 rounded-[32px]" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
             <div className="space-y-8">
               <Skeleton className="h-[400px] rounded-[40px]" />
               <Skeleton className="h-[400px] rounded-[40px]" />
             </div>
             <div className="space-y-8">
               <Skeleton className="h-64 rounded-[40px]" />
               <Skeleton className="h-64 rounded-[40px]" />
               <Skeleton className="h-64 rounded-[40px]" />
             </div>
          </div>
        </div>
      ) : null}

      {!loading && !rec ? (
        <div className="card p-20 text-center bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-500/10">
          <div className="h-24 w-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400">
            <Icon icon="lucide:sparkles" className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic">Profile Ready</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium text-lg leading-relaxed">
            We need your resume to create your personalized career roadmap.
          </p>
          <div className="mt-12">
            <Link to="/profile/wizard">
              <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase italic bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && rec ? (
        <>
          {/* Main Grid: Info Density prioritized */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              {/* Profile Intelligence Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { l: "Target Job", v: top?.career_title ?? topMeta?.title ?? "—", icon: "lucide:target", color: "indigo" },
                  { l: "Industry Demand", v: "High Demand", icon: "lucide:activity", color: "emerald" },
                  { l: "Current Level", v: expYears > 5 ? "Senior" : expYears > 2 ? "Mid-Level" : "Junior", icon: "lucide:award", color: "amber" },
                ].map((stat, i) => (
                  <div key={i} className="card p-6 bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:shadow-indigo-500/10 rounded-3xl group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        stat.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : 
                        stat.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        <Icon icon={stat.icon} className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{stat.l}</span>
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">{stat.v}</div>
                  </div>
                ))}
              </div>

              {/* Summary Section - More dense and professional */}
              <Card className="rounded-[32px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tight">AI Executive Summary</h3>
                      <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Natural Language Processing Output</p>
                    </div>
                    <Badge tone="indigo" className="font-bold px-3 py-1 rounded-full text-[9px] tracking-widest">READY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-8 py-8">
                  <div className="relative">
                    <Icon icon="lucide:quote" className="absolute -top-4 -left-4 h-10 w-10 text-slate-50 dark:text-slate-800 -z-0" />
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic relative z-10 pr-10">
                      {summary || "Your career summary is being processed by Gemini..."}
                    </p>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-10">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Verified Skills</span>
                       <div className="flex items-center gap-2.5">
                          <div className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{skillCount}</div>
                          <div className="h-1.5 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                             <div className="h-full bg-indigo-600 w-3/4" />
                          </div>
                       </div>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Experience Delta</span>
                       <div className="flex items-center gap-2.5">
                          <div className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{expYears}y</div>
                          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">+2.4x Velocity</div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Dynamics Chart */}
              <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                  <div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tight">Market Demand Dynamics</h3>
                    <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real-time signal index for {top?.career_title ?? "Industry"}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                  </div>
                </CardHeader>
                <CardContent className="px-10 py-10 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={demandLine}>
                        <CartesianGrid strokeDasharray="10 10" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="currentColor"
                          className="text-slate-400 dark:text-slate-600"
                          fontSize={10}
                          fontFamily="Space Grotesk, sans-serif"
                          fontWeight={700}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={12}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "20px",
                            backgroundColor: "var(--cp-surface-elevated)",
                            border: "1px solid var(--cp-border)",
                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "12px 16px",
                            color: "var(--cp-text)"
                          }}
                          itemStyle={{ color: "var(--cp-text)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#4f46e5"
                          strokeWidth={6}
                          dot={{ stroke: "#4f46e5", strokeWidth: 3, r: 5, fill: "#fff" }}
                          activeDot={{ r: 8, strokeWidth: 0, fill: "#4f46e5" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats column */}
            <div className="space-y-8">
              {[
                {
                  l: "Job Readiness",
                  v: `${Math.round(rec.skillGap?.readiness_score ?? 0)}%`,
                  h: "How ready you are for your target role",
                  icon: "lucide:zap",
                  tone: "indigo",
                },
                {
                  l: "Resume Match",
                  v: rec.atsScore?.score ? `${Math.round(rec.atsScore.score)}%` : "N/A",
                  h: "How well your resume matches the job",
                  icon: "lucide:file-search",
                  tone: "emerald",
                },
                {
                  l: "Role Match",
                  v: `${Math.round(rec.careerMatchScore ?? 0)}%`,
                  h: "How well you fit this career",
                  icon: "lucide:activity",
                  tone: "indigo",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="card p-8 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all rounded-[32px] overflow-hidden group border-b-4 border-b-slate-50 dark:border-b-slate-800"
                >
                  <div className="flex flex-col relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                        s.tone === "indigo" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/50" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-500/50"
                      )}>
                        <Icon icon={s.icon} className="h-6 w-6" />
                      </div>
                      <Icon icon="lucide:arrow-up-right" className="h-5 w-5 text-slate-100 dark:text-slate-800 group-hover:text-slate-300 transition-colors" />
                    </div>
                    
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
                      {s.l}
                    </span>
                    <div className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter mb-4">
                      {s.v}
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                        className={cn("h-full transition-all duration-1000", s.tone === "indigo" ? "bg-indigo-600" : "bg-emerald-500")} 
                        style={{ width: s.v.includes('%') ? s.v : '10%' }}
                       />
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase tracking-wider">{s.h}</p>
                  </div>
                </div>
              ))}

              <Card className="rounded-[40px] border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:shadow-indigo-500/10 bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-8 py-8 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase italic tracking-tight leading-none">Critical Skills</h3>
                    <p className="mt-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Priority Delta</p>
                  </div>
                </CardHeader>
                <CardContent className="px-8 py-8">
                  <div className="space-y-4">
                    {(rec.skillGap?.missing ?? []).slice(0, 3).map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all group cursor-default"
                      >
                        <div className="flex flex-col">
                          <div className="text-sm font-black text-slate-950 dark:text-white tracking-tight leading-none">
                            {m.skill}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
                             Delta: {m.difficulty}
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                          m.priority === "High" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                          {m.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10">
                    <Link to="/app/skill-gap">
                      <Button className="w-full h-14 rounded-2xl bg-slate-950 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black uppercase italic tracking-wider text-xs shadow-xl shadow-slate-200 dark:shadow-none">
                        View Mastery Map
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}