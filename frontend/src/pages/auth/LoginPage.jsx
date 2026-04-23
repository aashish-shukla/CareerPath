import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "../../components/layout/AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { http } from "../../lib/http";
import { authStore } from "../../lib/state/authStore";
import { Icon } from "@iconify/react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("demo@careerpath.dev");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authStore.isAuthed()) navigate("/app/dashboard", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await http.post("/api/auth/login", { email, password });
      authStore.setSession({ token: data.token, user: data.user });
      const to = location.state?.from ?? "/app/dashboard";
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Access Portal"
      subtitle="Input credentials to initialize session."
      footer={
        <div>
          No credentials found?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Register Protocol
          </Link>
        </div>
      }
    >
      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Identity (Email)</label>
          <Input 
            className="h-14 px-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="name@domain.com"
            required 
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Keyphrase (Password)</label>
          <Input
            className="h-14 px-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        
        {error ? (
          <div className="rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950 p-4 flex gap-3 text-rose-700 dark:text-rose-400 items-center">
            <Icon icon="lucide:shield-alert" className="h-5 w-5 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-tight">{error}</span>
          </div>
        ) : null}

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black uppercase italic tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100" disabled={loading}>
            {loading ? "Authorizing..." : "Initialize Session"}
          </Button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm">
           <Icon icon="lucide:info" className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
           <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
             Demo credentials prefilled for evaluation.
           </p>
        </div>
      </form>
    </AuthShell>
  );
}

