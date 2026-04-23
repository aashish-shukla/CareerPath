import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";
import { cn } from "../../lib/ui/cn";

export default function AtsCheckerPage() {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  const fetchScore = async (refresh = false) => {
    try {
      setLoading(true);
      const { data: res } = await http.get(`/api/recommendations/me${refresh ? "?refresh=1" : ""}`);
      setData(res);
    } catch (err) {
      setError("Failed to load ATS analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setChecking(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("resume", selectedFile);
      // First upload resume to populate extractedText
      await http.post("/api/recommendations/resume?enrich=1", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Then fetch fresh analysis
      await fetchScore(true);
    } catch (err) {
      setError("Resume analysis failed. Please try a different format.");
    } finally {
      setChecking(false);
    }
  };

  const atsScore = data?.atsScore || null;
  const score = atsScore?.score ?? 0;

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:file-check" className="h-3.5 w-3.5" />
            Resume Intelligence
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            ATS Scanner
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed max-w-xl">
             Validate your resume against <span className="text-slate-900 dark:text-white font-bold">Industry Standard</span> algorithms to optimize your callback rate.
          </p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.txt,.md"
            onChange={handleFileUpload}
            disabled={checking}
          />
          <Button 
            as="label"
            htmlFor="resume-upload"
            className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase italic tracking-wider shadow-xl shadow-indigo-100 dark:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
          >
            {checking ? (
              <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
            ) : (
              <Icon icon="lucide:upload-cloud" className="h-5 w-5" />
            )}
            {checking ? "Analyzing..." : "Upload New Resume"}
          </Button>
        </div>
      </div>

      {loading && !checking ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-[600px] rounded-[40px]" />
          <div className="space-y-8">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] items-start">
          <div className="space-y-10">
            {/* Score Overview */}
            <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
               <div className="bg-slate-950 p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Icon icon="lucide:shield-check" className="h-40 w-40" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                     <div className="relative">
                        <svg className="w-48 h-48 transform -rotate-90">
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-white/10"
                          />
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={553}
                            strokeDashoffset={553 - (553 * score) / 100}
                            className="text-indigo-500 transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-6xl font-black italic tracking-tighter">{score}</span>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Score</span>
                        </div>
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <Badge tone="indigo" className="mb-4 px-4 py-1.5 rounded-lg font-black uppercase tracking-[0.2em] text-[10px]">
                          {score > 80 ? "Optimized" : score > 60 ? "Competitive" : "Action Required"}
                        </Badge>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-4 uppercase">
                          ATS Compatibility Index
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed italic pr-4">
                           Your resume was analyzed against target roles for <span className="text-white font-bold">{data?.top?.career_title || "Market Standards"}</span>. Detailed breakdown of signal strength below.
                        </p>
                     </div>
                  </div>
               </div>

               <CardContent className="p-12">
                  <div className="grid gap-12 md:grid-cols-2">
                     <div className="space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Signal Strengths
                        </h3>
                        <div className="space-y-4">
                           {atsScore?.strengths?.length > 0 ? (
                             atsScore.strengths.map((s, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 group hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                                   <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 dark:shadow-none">
                                      <Icon icon="lucide:check-circle" className="h-4 w-4" />
                                   </div>
                                   <span className="text-sm font-black text-slate-800 dark:text-slate-200 italic">{s}</span>
                                </div>
                             ))
                           ) : (
                             <p className="text-xs text-slate-400 italic">No significant strengths detected yet.</p>
                           )}
                        </div>
                     </div>

                     <div className="space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                           Growth Vectors
                        </h3>
                        <div className="space-y-4">
                           {atsScore?.improvements?.length > 0 ? (
                             atsScore.improvements.map((s, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 group hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                                   <div className="h-8 w-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-200 dark:shadow-none">
                                      <Icon icon="lucide:alert-circle" className="h-4 w-4" />
                                   </div>
                                   <span className="text-sm font-black text-slate-800 dark:text-slate-200 italic">{s}</span>
                                </div>
                             ))
                           ) : (
                             <p className="text-xs text-slate-400 italic">No critical improvements recommended.</p>
                           )}
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Keyword Gaps */}
            <Card className="rounded-[40px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
               <CardHeader className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black italic tracking-tighter uppercase leading-none text-slate-950 dark:text-white">Semantic Matrix</h3>
                    <p className="mt-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Industry Keyword Density</p>
                  </div>
                  <Icon icon="lucide:layers" className="h-6 w-6 text-slate-200 dark:text-slate-700" />
               </CardHeader>
               <CardContent className="p-10">
                  <div className="flex flex-wrap gap-4">
                     {atsScore?.keywordGaps?.length > 0 ? (
                       atsScore.keywordGaps.map((tag, i) => (
                          <div key={i} className="px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all cursor-default flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                             {tag}
                          </div>
                       ))
                     ) : (
                       <p className="text-xs text-slate-400 dark:text-slate-500 italic">No missing keywords identified for this career path.</p>
                     )}
                  </div>
               </CardContent>
            </Card>

            {/* Resume Text Extraction Preview */}
            <Card className="rounded-[40px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden border-dashed border-2">
               <CardHeader className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black italic tracking-tighter uppercase leading-none text-slate-950 dark:text-white">Raw Extraction Content</h3>
                    <p className="mt-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verification of neural parsing integrity</p>
                  </div>
                  <Icon icon="lucide:file-text" className="h-6 w-6 text-slate-200 dark:text-slate-700" />
               </CardHeader>
               <CardContent className="p-0">
                  <div className="max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-10 font-mono text-[10px] text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                    {data?.extractedText || "No resume text extracted. Please upload a PDF or TXT resume to see the analysis break down."}
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
             <Card className="rounded-[32px] overflow-hidden bg-slate-950 text-white border-none p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Score Matrix</h3>
                <div className="space-y-10">
                   {[
                      { label: "Keyword Match", val: atsScore?.breakdown?.keywordMatch ?? 0, icon: "lucide:cpu" },
                      { label: "Impact Score", val: atsScore?.breakdown?.impact ?? 0, icon: "lucide:zap" },
                      { label: "Format Integrity", val: atsScore?.breakdown?.formatting ?? 0, icon: "lucide:layout" },
                      { label: "Signal Density", val: atsScore?.breakdown?.brevity ?? 0, icon: "lucide:align-left" },
                      { label: "Completeness", val: atsScore?.breakdown?.sectionCompleteness ?? 0, icon: "lucide:check-square" },
                   ].map((item, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2 text-slate-400">
                               <Icon icon={item.icon} className="h-3 w-3" />
                               {item.label}
                            </div>
                            <span className="text-white italic">{item.val}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                               style={{ width: `${item.val}%` }}
                             />
                         </div>
                      </div>
                   ))}
                </div>
             </Card>

             <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8 text-center group cursor-default">
                <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                   <Icon icon="lucide:lightbulb" className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Pro Tip</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
                   "Resumes between <span className="text-indigo-600 dark:text-indigo-400">800-1500 words</span> typically see 40% higher parsing accuracy from neural scanners."
                </p>
             </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
