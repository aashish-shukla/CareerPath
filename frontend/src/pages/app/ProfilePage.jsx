import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AppShell } from "../../components/layout/AppShell";
import { http } from "../../lib/http";
import { cn } from "../../lib/ui/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../../components/ui/Skeleton";
import { Progress } from "../../components/ui/Progress";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // info, resume
  const [formKey, setFormKey] = useState(0); // forces form re-mount on profile refresh
  
  // Upload UI states
  const [uploadStage, setUploadStage] = useState("idle"); // idle, uploading, analyzing, complete
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data } = await http.get("/api/profile/me");
      setProfile(data.profile);
      setUserEmail(data.email);
      setUserName(data.name);
      setFormKey((k) => k + 1); // force form inputs to re-mount with new values
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(updatedData) {
    setSaving(true);
    try {
      const { data } = await http.put("/api/profile/me?enrich=1", updatedData);
      setProfile(data.profile);
      alert("Profile updated successfully.");
    } catch (err) {
      alert("Save failed: " + (err?.response?.data?.error?.message || "Internal error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(file) {
    if (!file) return;
    setSaving(true);
    setUploadStage("uploading");
    setUploadProgress(20);
    
    try {
      const fd = new FormData();
      fd.append("resume", file);
      
      const { data } = await http.post("/api/recommendations/resume?enrich=1", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(90, 20 + (progress * 0.7))); // Keep space for analysis
        }
      });
      
      setUploadProgress(90);
      setUploadStage("analyzing");
      
      // Artificial delay for "analyzing" feel
      await new Promise(r => setTimeout(r, 1500));
      
      setUploadProgress(100);
      setAnalysisResult(data.parsed);
      setUploadStage("complete");
      fetchProfile();
    } catch (err) {
      alert("Upload failed. Ensure the file is a PDF/DOCX under 2MB.");
      setUploadStage("idle");
    } finally {
      setSaving(false);
    }
  }

  function resetUpload() {
    setUploadStage("idle");
    setAnalysisResult(null);
    setUploadProgress(0);
  }

  const generatedUsername = profile?.fullName || (userEmail ? userEmail.split("@")[0] : "");

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
            <Icon icon="lucide:user" className="h-3.5 w-3.5" />
            Profile Management
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
            My Profile
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
            Manage your personal details and professional data to keep your <span className="text-slate-900 dark:text-white font-bold">career roadmap</span> accurate.
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          {["info", "resume"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "resume") resetUpload();
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              {tab === "info" ? "General Info" : "Resume"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
          <div className="space-y-10">
            <Skeleton className="h-[500px] rounded-[40px]" />
          </div>
          <div className="space-y-10">
            <Skeleton className="h-[600px] rounded-[40px]" />
          </div>
        </div>
      ) : null}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 items-start">
          {/* Left Column - Core Info */}
          <div className="space-y-10">
            <Card className="rounded-[40px] overflow-hidden border-none bg-slate-950 text-white relative transition-all group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative z-10">
                <div className="mx-auto h-28 w-28 rounded-[36px] bg-indigo-600 flex items-center justify-center text-5xl text-white shadow-2xl shadow-indigo-500/40 mb-8 italic font-black transition-transform group-hover:scale-105 duration-500">
                  {generatedUsername[0]?.toUpperCase() || "?"}
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight truncate">{generatedUsername}</h2>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{profile?.currentRole || "Professional"}</span>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/5 space-y-5">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience</span>
                     <span className="text-xs font-black italic">{profile?.experience?.years || 0} YEARS</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Path</span>
                     <span className="text-xs font-black italic text-indigo-300">{profile?.targetRole || "Not set"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                     <Badge tone="emerald" className="px-3 py-0.5 font-black uppercase text-[9px] tracking-widest">Active</Badge>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group hover:shadow-xl transition-all overflow-hidden border">
               <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:settings" className="h-4 w-4 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Details</span>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                       <Icon icon="lucide:calendar" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-widest">Member Since</div>
                      <div className="text-xs font-bold text-slate-500 mt-1">{new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                       <Icon icon="lucide:star" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-widest">Plan</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1 uppercase">Pro Plan</div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-[40px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden border">
                    <CardHeader className="px-10 py-8 border-b border-slate-50 dark:border-slate-800">
                      <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tight">Edit Profile</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update your basic professional information</p>
                    </CardHeader>
                    <CardContent className="p-10" key={formKey}>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleUpdate({
                          fullName: formData.get("fullName") || generatedUsername,
                          currentRole: formData.get("currentRole"),
                          targetRole: formData.get("targetRole"),
                          experience: {
                            years: Number(formData.get("experience")),
                            summary: profile?.experience?.summary || ""
                          },
                          skills: formData.get("skills").split(",").map(s => s.trim()).filter(Boolean),
                        });
                      }} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</label>
                             <Input name="fullName" defaultValue={profile?.fullName || generatedUsername} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-600/5 font-bold" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Experience (Years)</label>
                             <Input name="experience" type="number" defaultValue={profile?.experience?.years ?? ""} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-600/5 font-bold" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Job Title</label>
                             <Input name="currentRole" defaultValue={profile?.currentRole ?? ""} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-600/5 font-bold" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Role</label>
                             <Input name="targetRole" defaultValue={profile?.targetRole ?? ""} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-600/5 font-bold" />
                          </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Skills</label>
                           <textarea 
                             name="skills" 
                             defaultValue={profile?.skills?.join(", ") ?? ""} 
                             placeholder="e.g. React, Node.js, Python"
                             className="w-full h-40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all font-mono leading-relaxed"
                           />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Comma-separated skills for AI analysis</p>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button 
                            disabled={saving} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 rounded-2xl px-12 h-16 text-xs font-black uppercase tracking-[0.2em] italic transition-all shadow-2xl shadow-indigo-600/20 hover:-translate-y-1"
                          >
                            {saving ? (
                               <div className="flex items-center gap-2">
                                  <Icon icon="lucide:loader-2" className="animate-spin h-4 w-4" />
                                  Saving...
                               </div>
                            ) : (
                               <div className="flex items-center gap-2">
                                  Save Changes
                                  <Icon icon="lucide:check" className="h-4 w-4" />
                               </div>
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "resume" && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-[40px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 md:p-12 border overflow-hidden">
                    {uploadStage === "idle" && (
                      <div className="flex flex-col items-center text-center py-10 px-4">
                         <div className="h-24 w-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-8 text-indigo-600 group transition-all">
                            <Icon icon="lucide:file-up" className="h-12 w-12" />
                         </div>
                         <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tight mb-3">Upload New Resume</h3>
                         <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-12 leading-relaxed font-medium">
                           Our AI will analyze your resume to update your skills, experience, and career insights.
                         </p>
                         <Input 
                           type="file" 
                           className="hidden" 
                           id="resume-upload" 
                           accept=".pdf,.docx,.doc,text/plain"
                           onChange={(e) => handleResumeUpload(e.target.files?.[0])}
                         />
                         <label htmlFor="resume-upload" className="cursor-pointer bg-slate-950 dark:bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 inline-flex items-center gap-2">
                           Select Resume
                           <Icon icon="lucide:plus" className="h-4 w-4" />
                         </label>
                         <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">Maximum file size: 2MB (PDF or Word)</p>
                      </div>
                    )}

                    {(uploadStage === "uploading" || uploadStage === "analyzing") && (
                      <div className="py-20 flex flex-col items-center text-center">
                         <div className="relative mb-12">
                            <div className="h-24 w-24 rounded-full border-4 border-indigo-100 dark:border-slate-800 flex items-center justify-center">
                               <Icon icon={uploadStage === "uploading" ? "lucide:cloud-upload" : "lucide:cpu"} className="h-10 w-10 text-indigo-600 animate-bounce" />
                            </div>
                            <div className="absolute inset-0 h-24 w-24 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                         </div>
                         
                         <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tight mb-2">
                            {uploadStage === "uploading" ? "Uploading Source..." : "Analyzing Signals..."}
                         </h3>
                         <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 font-bold uppercase tracking-widest opacity-60">
                            Powered by Gemini AI Engine
                         </p>
                         
                         <div className="w-full max-w-sm space-y-4">
                            <div className="flex justify-between items-center px-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{uploadStage}</span>
                               <span className="text-[10px] font-black text-slate-400">{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${uploadProgress}%` }}
                                 transition={{ duration: 0.5 }}
                               />
                            </div>
                         </div>
                         
                         <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-sm">
                            {[
                               { label: "Parse", active: true },
                               { label: "Extract", active: uploadStage === "analyzing" },
                               { label: "Enrich", active: false }
                            ].map((step, i) => (
                               <div key={i} className="flex flex-col items-center gap-2">
                                  <div className={cn(
                                     "h-2 w-full rounded-full transition-all duration-500",
                                     step.active ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800"
                                  )} />
                                  <span className={cn(
                                     "text-[8px] font-black uppercase tracking-widest",
                                     step.active ? "text-indigo-600" : "text-slate-300"
                                  )}>{step.label}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}

                    {uploadStage === "complete" && analysisResult && (
                      <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                  <Icon icon="lucide:check-circle" className="h-6 w-6" />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tight leading-none">Analysis Complete</h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Data synchronized successfully</p>
                               </div>
                            </div>
                            <Button onClick={resetUpload} variant="ghost" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">
                               Upload Another
                            </Button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="rounded-[32px] bg-slate-50/50 dark:bg-slate-800/30 border-none p-8">
                               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">Extracted Profile</div>
                               <div className="space-y-6">
                                  <div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name</div>
                                     <div className="text-lg font-black text-slate-950 dark:text-white italic">{analysisResult.name || "N/A"}</div>
                                  </div>
                                  <div>
                                     <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Executive Summary</div>
                                     <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-indigo-200 pl-4 py-1">
                                        "{analysisResult.summary ? analysisResult.summary.slice(0, 200) + '...' : 'No summary extracted.'}"
                                     </p>
                                  </div>
                               </div>
                            </Card>

                            <Card className="rounded-[32px] bg-slate-50/50 dark:bg-slate-800/30 border-none p-8">
                               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">Skill Intelligence</div>
                               <div className="flex flex-wrap gap-2 mb-8">
                                  {analysisResult.skills?.slice(0, 8).map((skill, i) => (
                                     <Badge key={i} tone="neutral" className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 border-none shadow-sm">
                                        {skill}
                                     </Badge>
                                  ))}
                                  {analysisResult.skills?.length > 8 && (
                                     <Badge tone="indigo" className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
                                        +{analysisResult.skills.length - 8} MORE
                                     </Badge>
                                  )}
                               </div>
                               <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">Experience Decomposition</div>
                                  <div className="space-y-4">
                                     {analysisResult.experience?.slice(0, 2).map((exp, i) => (
                                        <div key={i} className="flex gap-4">
                                           <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center shrink-0">
                                              <Icon icon="lucide:briefcase" className="h-4 w-4" />
                                           </div>
                                           <div>
                                              <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{exp.role || exp.title}</div>
                                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exp.company}</div>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </Card>
                         </div>
                         
                         <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                            <Button onClick={() => navigate("/app/dashboard")} className="bg-slate-950 dark:bg-indigo-600 text-white px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all shadow-xl hover:-translate-y-1">
                               Go to Dashboard
                               <Icon icon="lucide:arrow-right" className="ml-3 h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AppShell>
  );
}
