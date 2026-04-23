import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Progress } from "../../components/ui/Progress";
import { Skeleton } from "../../components/ui/Skeleton";
import { http } from "../../lib/http";
import { Icon } from "@iconify/react";
import { cn } from "../../lib/ui/cn";

const steps = [
  { key: "education", title: "Education", subtitle: "Define your academic foundation.", icon: "lucide:graduation-cap" },
  { key: "skills", title: "Skills", subtitle: "Map your core technical capabilities.", icon: "lucide:cpu" },
  { key: "experience", title: "Experience", subtitle: "Quantify your professional impact.", icon: "lucide:briefcase" },
  { key: "resume", title: "Resume", subtitle: "Provide high-fidelity career signal.", icon: "lucide:file-up" },
];

function StepPill({ active, done, label, icon }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
        active ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100/50 dark:shadow-indigo-500/30" : 
        done ? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : 
        "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
      )}
    >
      <Icon icon={icon} className={cn("h-4 w-4", active ? "text-white" : "text-current")} />
      {label}
    </div>
  );
}

export function ProfileWizardPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];
  const pct = useMemo(() => Math.round(((stepIdx + 1) / steps.length) * 100), [stepIdx]);

  const [education, setEducation] = useState({
    level: "B.Tech",
    field: "Computer Science",
    institution: "Your University",
    graduationYear: 2026,
  });
  const [skills, setSkills] = useState("React, Node.js, MongoDB, Python");
  const [experience, setExperience] = useState({ years: 0, summary: "Internship / Projects focused." });
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      try {
        const { data } = await http.get("/api/profile/me").catch(() => ({ data: { profile: null } }));
        if (data?.profile) {
          setEducation(data.profile.education ?? education);
          setExperience(data.profile.experience ?? experience);
          setSkills((data.profile.skills ?? []).join(", "));
        }
      } finally {
        setInitialLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile({ enrich = false } = {}) {
    const normalizedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await http.put(`/api/profile/me?enrich=${enrich ? "1" : "0"}`, { education, experience, skills: normalizedSkills });
  }

  async function uploadResume({ enrich = false } = {}) {
    if (!resumeFile) return;
    const fd = new FormData();
    fd.append("resume", resumeFile);
    const { data } = await http.post(`/api/recommendations/resume?enrich=${enrich ? "1" : "0"}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (data?.warning) setNotice(data.warning);
  }

  async function onNext() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const isFinal = stepIdx === steps.length - 1;
      await saveProfile({ enrich: isFinal });
      if (step.key === "resume") await uploadResume({ enrich: isFinal });

      if (isFinal) {
        navigate("/app/dashboard", { replace: true });
      } else {
        setStepIdx((v) => v + 1);
      }
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? "Could not save. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function onBack() {
    setError("");
    setStepIdx((v) => Math.max(0, v - 1));
  }

  return (
    <AppShell>
      <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:settings" className="h-3 w-3" />
            Profile Setup
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            Setup Profile
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
            Provide your details so we can <span className="text-slate-900 dark:text-white font-bold">create</span> your personalized career path.
          </p>
        </div>
        <div className="text-right">
           <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-3">Setup Progress</div>
           <div className="text-5xl font-black text-slate-950 dark:text-white leading-none italic tracking-tighter">{pct}<span className="text-xl ml-1 text-slate-300 dark:text-slate-700">%</span></div>
        </div>
      </div>

      {initialLoading ? (
        <div className="space-y-10">
          <Skeleton className="h-20 w-full rounded-[32px]" />
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <Skeleton className="h-[500px] w-full rounded-[32px]" />
            <Skeleton className="h-[350px] w-full rounded-[32px]" />
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.5)]" 
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {steps.map((s, idx) => (
                <StepPill key={s.key} active={idx === stepIdx} done={idx < stepIdx} label={s.title} icon={s.icon} />
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_400px] items-start">
            <div className="lg:col-span-1">
              <Card className="rounded-[32px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 border-none py-2">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-6 mb-4">
                     <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <Icon icon={step.icon} className="h-7 w-7" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">{step.title}</h2>
                        <p className="mt-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">{step.subtitle}</p>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                  <div className="space-y-10">
                    {step.key === "education" ? (
                      <div className="grid gap-8 sm:grid-cols-2">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Degree</label>
                          <Input className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300 dark:text-white" value={education.level} onChange={(e) => setEducation({ ...education, level: e.target.value })} />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Field of Study</label>
                          <Input className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300 dark:text-white" value={education.field} onChange={(e) => setEducation({ ...education, field: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2 space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">University / College</label>
                          <Input className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300 dark:text-white"
                            value={education.institution}
                            onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Graduation Year</label>
                          <Input className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300 dark:text-white"
                            type="number"
                            value={education.graduationYear}
                            onChange={(e) =>
                              setEducation({ ...education, graduationYear: Number(e.target.value || 0) })
                            }
                          />
                        </div>
                      </div>
                    ) : null}

                    {step.key === "skills" ? (
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Your Skills</label>
                        <textarea 
                          className="w-full min-h-[200px] p-6 rounded-[24px] bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 dark:text-white resize-none text-base leading-relaxed placeholder:text-slate-300"
                          value={skills} 
                          onChange={(e) => setSkills(e.target.value)} 
                          placeholder="React, Python, AWS, Microservices..."
                        />
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-bold italic pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 py-1.5">
                          <Icon icon="lucide:zap" className="h-3.5 w-3.5 text-indigo-500" />
                          Gemini will process your skills automatically.
                        </div>
                      </div>
                    ) : null}

                    {step.key === "experience" ? (
                      <div className="grid gap-10 sm:grid-cols-2">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Years of Experience</label>
                          <Input className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold dark:text-white"
                            type="number"
                            value={experience.years}
                            onChange={(e) => setExperience({ ...experience, years: Number(e.target.value || 0) })}
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-2.5">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Professional Summary</label>
                          <textarea 
                            className="w-full min-h-[160px] p-6 rounded-[24px] bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 dark:text-white resize-none text-base leading-relaxed placeholder:text-slate-300"
                            value={experience.summary}
                            onChange={(e) => setExperience({ ...experience, summary: e.target.value })}
                            placeholder="Describe your career path and impact..."
                          />
                        </div>
                      </div>
                    ) : null}

                    {step.key === "resume" ? (
                      <div className="space-y-6">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Upload Resume</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept=".txt,.md,.pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                          />
                          <div className="h-64 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center p-12 group-hover:bg-indigo-50/20 dark:group-hover:bg-indigo-500/10 group-hover:border-indigo-200 transition-all bg-white dark:bg-slate-900 relative overflow-hidden">
                             <div className="h-16 w-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                               <Icon icon="lucide:cloud-lightning" className="h-8 w-8" />
                             </div>
                             <div className="text-lg font-black text-slate-950 dark:text-white tracking-tight text-center">
                                {resumeFile ? resumeFile.name : "Select Resume File"}
                             </div>
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-[0.3em]">Supports: PDF | Markdown | Text</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {error ? (
                      <div className="rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-500/10 p-5 flex gap-4 text-rose-700 dark:text-rose-400 items-center">
                        <Icon icon="lucide:radio-tower" className="h-5 w-5 shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-tight">{error}</span>
                      </div>
                    ) : null}

                    <div className="mt-12 flex items-center justify-between gap-4">
                      <Button 
                        variant="ghost" 
                        className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 min-w-[160px]" 
                        onClick={onBack} 
                        disabled={stepIdx === 0 || loading}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          className="rounded-2xl h-14 px-8 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-slate-300 border border-transparent min-w-[160px]" 
                          onClick={() => navigate("/app/dashboard")} 
                          disabled={loading}
                        >
                          Skip Sync
                        </Button>
                        <Button 
                          className="rounded-2xl h-14 px-10 font-black uppercase italic text-xs tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 min-w-[160px]" 
                          onClick={onNext} 
                          disabled={loading}
                        >
                          {loading ? "Saving..." : stepIdx === steps.length - 1 ? "Finish" : "Next"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-10">
              <Card className="rounded-[32px] overflow-hidden bg-slate-950 text-white border-none py-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-50" />
                <CardHeader className="px-8 pb-6 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Logistics</h3>
                  </div>
                  <h4 className="text-xl font-black italic tracking-tighter text-white">System Protocol</h4>
                </CardHeader>
                <CardContent className="px-8 pt-4 space-y-10 relative z-10">
                  {[
                    { t: "Role Fit Integration", d: "Education datasets provide the baseline for domain alignment scoring.", icon: "lucide:radar" },
                    { t: "Signal Normalization", d: "Inputs are mapped against high-frequency market benchmarks.", icon: "lucide:cpu" },
                    { t: "Deep Extraction", d: "Resumes enable multi-factor career trajectory forecasting.", icon: "lucide:file-json" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group cursor-default">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                        <Icon icon={item.icon} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black tracking-widest uppercase text-white mb-2">{item.t}</div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-4">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
