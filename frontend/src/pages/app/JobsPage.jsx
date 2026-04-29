import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AppShell } from "../../components/layout/AppShell";
import { http } from "../../lib/http";
import { cn } from "../../lib/ui/cn";
import { Skeleton } from "../../components/ui/Skeleton";

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ personalized: false, totalResults: 0, hint: null, error: null });
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [query, page, remoteOnly]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("page", String(page));
      if (remoteOnly) params.set("remote_only", "1");

      const { data } = await http.get(`/api/jobs?${params}`);
      setJobs(data.jobs ?? []);
      setMeta({
        personalized: data.personalized ?? false,
        totalResults: data.totalResults ?? 0,
        hint: data.hint ?? null,
        error: data.error ?? null,
      });
    } catch (err) {
      setMeta((m) => ({ ...m, error: "Failed to fetch jobs." }));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  }

  function getMatchColor(score) {
    if (score >= 80) return "emerald";
    if (score >= 50) return "amber";
    return "rose";
  }

  function getMatchLabel(score) {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  }

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:briefcase" className="h-3.5 w-3.5" />
            Live Job Listings
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            Job Board
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-base max-w-xl">
            {meta.personalized ? (
              <>Real job postings with <span className="text-indigo-600 dark:text-indigo-400 font-bold">skill match scores</span> based on your profile.</>
            ) : (
              "Search real job postings from top platforms."
            )}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-10 flex gap-4 flex-wrap items-stretch">
        <div className="flex-1 min-w-[200px]">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search jobs... (e.g. React Developer, Data Analyst)"
            className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={cn(
            "h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center gap-2",
            remoteOnly
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20"
              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          )}
        >
          <Icon icon="lucide:wifi" className="h-4 w-4" />
          Remote
        </button>
        <Button
          type="submit"
          className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-indigo-500/20"
        >
          <Icon icon="lucide:search" className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {/* Hint / Error */}
      {meta.hint && (
        <Card className="mb-10 rounded-3xl border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
          <CardContent className="p-8 flex items-start gap-4">
            <Icon icon="lucide:info" className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{meta.hint}</p>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Get a free API key at{" "}
                <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch" target="_blank" rel="noopener" className="underline font-bold">
                  RapidAPI JSearch
                </a>
                {" "}(200 free requests/month), then add <code className="bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded font-mono text-[10px]">JSEARCH_API_KEY=your_key</code> to your backend <code className="bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded font-mono text-[10px]">.env</code> file.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {meta.error && (
        <Card className="mb-10 rounded-3xl border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5">
          <CardContent className="p-8 flex items-center gap-4">
            <Icon icon="lucide:alert-circle" className="h-6 w-6 text-rose-600" />
            <p className="text-sm font-bold text-rose-900 dark:text-rose-200">{meta.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-[32px]" />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && jobs.length > 0 && (
        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {meta.totalResults} jobs found
          </span>
          {meta.personalized && (
            <Badge tone="indigo" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
              Skill Match Active
            </Badge>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && !meta.hint && !meta.error && (
        <div className="text-center py-20">
          <div className="h-20 w-20 rounded-[28px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <Icon icon="lucide:search-x" className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">No Jobs Found</h3>
          <p className="mt-2 text-sm text-slate-500 font-medium">Try a different search term or broaden your filters.</p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && (
        <div className="space-y-5">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={cn(
                "rounded-[28px] border overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-indigo-500/10 cursor-pointer group",
                expandedJob === job.id
                  ? "border-indigo-200 dark:border-indigo-500/30 shadow-lg"
                  : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              )}
              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            >
              <CardContent className="p-7">
                <div className="flex items-start gap-5">
                  {/* Company logo */}
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt="" className="h-10 w-10 object-contain" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <div className={cn("h-full w-full items-center justify-center text-xl font-black text-indigo-600", job.companyLogo ? "hidden" : "flex")}>
                      {(job.company ?? "?")[0]}
                    </div>
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{job.company}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Icon icon={job.isRemote ? "lucide:wifi" : "lucide:map-pin"} className="h-3 w-3" />
                            {job.location}
                          </span>
                          {job.postedAt && (
                            <>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-xs font-bold text-slate-400">{timeAgo(job.postedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Match score */}
                      {job.matchScore !== null && (
                        <div className={cn(
                          "flex flex-col items-center px-4 py-2.5 rounded-2xl shrink-0",
                          getMatchColor(job.matchScore) === "emerald" ? "bg-emerald-50 dark:bg-emerald-500/10" :
                          getMatchColor(job.matchScore) === "amber" ? "bg-amber-50 dark:bg-amber-500/10" :
                          "bg-rose-50 dark:bg-rose-500/10"
                        )}>
                          <span className={cn(
                            "text-2xl font-black tracking-tighter",
                            getMatchColor(job.matchScore) === "emerald" ? "text-emerald-600" :
                            getMatchColor(job.matchScore) === "amber" ? "text-amber-600" :
                            "text-rose-600"
                          )}>
                            {job.matchScore}%
                          </span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            getMatchColor(job.matchScore) === "emerald" ? "text-emerald-500" :
                            getMatchColor(job.matchScore) === "amber" ? "text-amber-500" :
                            "text-rose-500"
                          )}>
                            {getMatchLabel(job.matchScore)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags row */}
                    <div className="flex items-center gap-2.5 mt-4 flex-wrap">
                      <Badge tone="neutral" className="rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 border-none">
                        {job.type}
                      </Badge>
                      {job.isRemote && (
                        <Badge tone="indigo" className="rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">
                          Remote
                        </Badge>
                      )}
                      {job.salary && (
                        <Badge tone="emerald" className="rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">
                          {job.salary}
                        </Badge>
                      )}
                      {job.publisher && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          via {job.publisher}
                        </span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedJob === job.id && (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                          {job.description}{job.description?.length >= 500 ? "..." : ""}
                        </p>

                        {/* Skill matching */}
                        {(job.matchedSkills?.length > 0 || job.missingSkills?.length > 0) && (
                          <div className="space-y-3 mb-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Skill Analysis</span>
                            <div className="flex flex-wrap gap-2">
                              {job.matchedSkills?.map((s, i) => (
                                <span key={`m-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                  <Icon icon="lucide:check" className="h-3 w-3" />
                                  {s}
                                </span>
                              ))}
                              {job.missingSkills?.map((s, i) => (
                                <span key={`x-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                                  <Icon icon="lucide:x" className="h-3 w-3" />
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20 hover:-translate-y-0.5"
                          >
                            Apply Now
                            <Icon icon="lucide:external-link" className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs disabled:opacity-30"
          >
            <Icon icon="lucide:chevron-left" className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {page}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={jobs.length < 10}
            className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs disabled:opacity-30"
          >
            Next
            <Icon icon="lucide:chevron-right" className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </AppShell>
  );
}
