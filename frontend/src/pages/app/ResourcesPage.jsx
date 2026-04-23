import { useEffect, useMemo, useState, useCallback } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";

/* ── Helpers ─────────────────────────────────── */

function toneForLevel(level) {
  if (level === "Beginner") return "emerald";
  if (level === "Intermediate") return "indigo";
  return "amber";
}

function toneForPriority(priority) {
  if (priority === "High") return "rose";
  if (priority === "Medium") return "amber";
  return "emerald";
}

function iconForType(type) {
  switch (type) {
    case "Course":        return "lucide:graduation-cap";
    case "Tutorial":      return "lucide:play-circle";
    case "Documentation": return "lucide:file-text";
    case "Practice":      return "lucide:code-2";
    case "Guide":         return "lucide:book-open";
    default:              return "lucide:scroll-text";
  }
}

const TABS = [
  { key: "for-you", label: "For You", icon: "lucide:sparkles" },
  { key: "all", label: "All Resources", icon: "lucide:library" },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

/* ── Component ───────────────────────────────── */

export function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [tab, setTab] = useState("for-you");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [personalized, setPersonalized] = useState(false);
  const [targetCareer, setTargetCareer] = useState("");
  const [hint, setHint] = useState("");

  const fetchResources = useCallback(async (forceRefresh = false) => {
    const isRefresh = forceRefresh && !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await http.get("/api/resources", {
        params: {
          q: query || undefined,
          level: level === "All" ? undefined : level,
          refresh: forceRefresh ? "1" : undefined,
        },
      });
      setItems(data.resources ?? []);
      setPersonalized(data.personalized ?? false);
      setTargetCareer(data.targetCareer ?? "");
      setHint(data.hint ?? "");
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? "Could not load resources");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, level]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get("/api/resources", {
          params: {
            q: query || undefined,
            level: level === "All" ? undefined : level,
          },
        });
        if (!cancelled) {
          setItems(data.resources ?? []);
          setPersonalized(data.personalized ?? false);
          setTargetCareer(data.targetCareer ?? "");
          setHint(data.hint ?? "");
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error?.message ?? "Could not load resources");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [query, level]);

  /* ── Grouping ─────────────────────────────── */

  const grouped = useMemo(() => {
    if (tab === "all" || !personalized) return null;

    const groups = { High: [], Medium: [], Low: [] };
    for (const r of items) {
      const p = r.priority || "Medium";
      (groups[p] ?? groups.Medium).push(r);
    }
    return groups;
  }, [items, tab, personalized]);

  const flatItems = useMemo(() => {
    if (tab === "for-you" && personalized) return null; // use grouped view
    return [...items].sort((a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
    );
  }, [items, tab, personalized]);

  /* ── Render ────────────────────────────────── */

  return (
    <AppShell>
      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:library" className="h-3 w-3" />
            Learning Center
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            {personalized ? "Your Resources" : "Top Resources"}
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
            {personalized ? (
              <>
                Personalized learning path to <span className="text-slate-900 dark:text-white font-bold">bridge your skill gaps</span>
                {targetCareer ? <> for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{targetCareer}</span></> : null}.
              </>
            ) : (
              <>Curated list of courses and materials to <span className="text-slate-900 dark:text-white font-bold">bridge your skills</span> and grow your career.</>
            )}
          </p>
          {hint && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <Icon icon="lucide:info" className="h-3.5 w-3.5" />
              {hint}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative group min-w-[280px]">
            <Icon icon="lucide:search" className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <Input
              className="pl-14 h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm dark:shadow-none focus:shadow-xl dark:focus:shadow-indigo-500/10 focus:shadow-indigo-50/50 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
            />
          </div>

          {/* Level filter */}
          <div className="relative">
            <select
              className="h-12 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white shadow-sm dark:shadow-none focus:shadow-xl dark:focus:shadow-indigo-500/10 focus:ring-0 appearance-none min-w-[160px] cursor-pointer"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="All">All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh */}
          {personalized && (
            <Button
              className="h-12 px-6 rounded-xl bg-slate-950 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-indigo-200 dark:hover:shadow-indigo-500/20 transition-all group/btn disabled:opacity-50"
              onClick={() => fetchResources(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Icon icon="lucide:loader-2" className="mr-2.5 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon icon="lucide:sparkles" className="mr-2.5 h-3.5 w-3.5" />
                  Refresh
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      {personalized && (
        <div className="flex gap-2 mb-10 px-4 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                tab === t.key
                  ? "bg-slate-950 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200/50 dark:shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-200 dark:hover:border-slate-700"
              }`}
            >
              <Icon icon={t.icon} className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div>
          {personalized && (
            <div className="flex items-center gap-3 mb-8 px-4 md:px-0">
              <Icon icon="lucide:sparkles" className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                Generating personalized resources...
              </span>
            </div>
          )}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-[32px]" />
            ))}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="card p-16 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="h-20 w-20 rounded-[24px] bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-8 text-rose-600 dark:text-rose-400">
            <Icon icon="lucide:database-zap" className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Loading Error</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium text-base">{error}</p>
        </div>
      )}

      {/* ── Grouped View (For You tab) ── */}
      {!loading && grouped && tab === "for-you" && (
        <div className="space-y-14">
          {["High", "Medium", "Low"].map((p) => {
            const group = grouped[p] ?? [];
            if (group.length === 0) return null;
            return (
              <div key={p}>
                <div className="flex items-center gap-6 mb-8 px-4 md:px-0">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      p === "High"
                        ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                        : p === "Medium"
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    }`}
                  />
                  <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic leading-none">
                    {p} Priority
                  </h2>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black text-slate-950 dark:text-white">{group.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resources</span>
                  </div>
                </div>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((r) => (
                    <ResourceCard key={r.id} resource={r} showReason />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Flat Grid View (All tab or not personalized) ── */}
      {!loading && flatItems && (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {flatItems.map((r) => (
            <ResourceCard key={r.id} resource={r} showReason={personalized} />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && items.length === 0 && !error && (
        <div className="card p-24 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
          <Icon icon="lucide:search-x" className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
          <p className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">No results found</p>
        </div>
      )}

      {/* ── Refreshing overlay ── */}
      {refreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 shadow-2xl flex flex-col items-center gap-6 border border-slate-100 dark:border-slate-800">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Icon icon="lucide:sparkles" className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Regenerating Resources</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">AI is curating fresh recommendations...</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/* ── Resource Card Component ─────────────────── */

function ResourceCard({ resource: r, showReason = false }) {
  return (
    <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 group bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
      <CardHeader className="p-8 pb-0 border-none relative overflow-hidden">
        {/* Priority + Level badges */}
        <div className="absolute top-0 right-0 p-6 flex gap-2">
          {r.priority && r.priority !== "Medium" && (
            <Badge tone={toneForPriority(r.priority)} className="font-black px-2.5 py-1 rounded-lg text-[7px] tracking-[0.15em] uppercase border-none">
              {r.priority}
            </Badge>
          )}
          <Badge tone={toneForLevel(r.level)} className="font-black px-3 py-1 rounded-lg text-[8px] tracking-[0.15em] uppercase border-none">
            {r.level}
          </Badge>
        </div>

        {/* Type icon */}
        <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-8">
          <Icon icon={iconForType(r.type)} className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Skill + Type tag */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{r.skill}</span>
            {r.type && (
              <>
                <div className="h-3 w-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-[8px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest">{r.type}</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-4">
            {r.title}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-3 mb-4">
            "{r.description}"
          </p>

          {/* Why this resource */}
          {showReason && r.reason && (
            <div className="flex items-start gap-2.5 mb-6 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
              <Icon icon="lucide:lightbulb" className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
              <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 leading-relaxed">{r.reason}</span>
            </div>
          )}
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Provider</span>
            <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">{r.provider}</span>
          </div>
          <Button
            className="rounded-xl px-5 h-10 uppercase font-black text-[9px] tracking-widest bg-slate-950 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white shadow-xl shadow-slate-200 dark:shadow-none hover:shadow-indigo-200 dark:hover:shadow-indigo-500/20 transition-all group/btn"
            onClick={() => {
              if (r.url) window.open(r.url, "_blank", "noreferrer");
            }}
          >
            View Resource
            <Icon icon="lucide:arrow-right" className="ml-2.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
