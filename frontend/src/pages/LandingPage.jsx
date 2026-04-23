import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Logo } from "../components/layout/Logo";
import { authStore } from "../lib/state/authStore";
import { AccordionItem } from "../components/ui/Accordion";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

function IconCheck() {
  return (
    <Icon icon="lucide:check-circle-2" className="h-5 w-5 text-indigo-500" />
  );
}

function Feature({ title, desc, icon }) {
  return (
    <div className="card p-6 group flex flex-col items-start gap-4 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] transition-all hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800">
      <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
        <Icon icon={icon || "lucide:zap"} className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight">{title}</div>
        <div className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</div>
      </div>
    </div>
  );
}

function FloatingIcon({ icon, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
      className={className}
    >
      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-indigo-100/10 dark:shadow-none flex items-center justify-center border border-indigo-50/50 dark:border-slate-800">
        <Icon icon={icon} className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
      </div>
    </motion.div>
  );
}
export function LandingPage() {
  const isAuthed = authStore.isAuthed();
  const [openFaq, setOpenFaq] = useState(0);

  const landingNav = [
    { href: "#features", label: "Intelligence" },
    { href: "#how-it-works", label: "Roadmap" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-[#fafbff] dark:bg-slate-950 transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="container-page h-20 flex items-center justify-between">
          <Logo className="scale-90" />
          <div className="hidden md:flex items-center gap-10">
            {landingNav.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="text-[13px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors italic"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="h-11 px-6 text-sm font-black uppercase italic rounded-full shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Adjusted Hero Section - Hybrid Style */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[10%] left-[15%] h-[500px] w-[500px] rounded-full bg-indigo-200/10 dark:bg-indigo-900/10 blur-[120px]"></div>
            <div className="absolute bottom-[10%] right-[15%] h-[500px] w-[500px] rounded-full bg-violet-200/10 dark:bg-violet-900/10 blur-[120px]"></div>
            
            {/* Animated Pipes/Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M-10 20 C 20 20, 30 80, 110 80"
                stroke="currentColor"
                strokeWidth="0.2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M-10 50 C 40 50, 60 10, 110 10"
                stroke="currentColor"
                strokeWidth="0.2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
              />
            </svg>
          </div>

          <div className="container-page relative z-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-50 dark:border-indigo-900/30 bg-white dark:bg-slate-900 px-4 py-2 text-[12px] font-bold text-indigo-600 dark:text-indigo-400 shadow-[0_4px_12px_rgba(79,70,229,0.05)] dark:shadow-none mb-8">
                  <Icon icon="lucide:sparkles" className="h-4 w-4" />
                  Now live with Gemini-3 Flash-Preview
                </div>
                
                <h1 className="text-6xl font-black tracking-tight text-slate-950 dark:text-white sm:text-7xl lg:text-[84px] leading-[0.85] mb-8 uppercase italic">
                  Own your <br/>
                  <span className="text-indigo-600 dark:text-indigo-400 not-italic">career</span> <br/>
                  trajectory.
                </h1>
                
                <p className="text-xl leading-relaxed text-slate-500 dark:text-slate-400 font-medium max-w-xl mb-12">
                  Stop guessing. Start engineering. We bridge the gap between where you are 
                  and where you want to be—with real-time AI and market data.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to={isAuthed ? "/app/dashboard" : "/register"}>
                    <Button size="lg" className="h-16 px-10 text-[17px] font-black uppercase italic shadow-2xl shadow-indigo-300/40 dark:shadow-indigo-500/20 rounded-full group">
                       {isAuthed ? "Go to Dashboard" : "Start your path"}
                       <Icon icon="lucide:arrow-right" className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login" className={isAuthed ? "hidden" : ""}>
                     <Button size="lg" variant="ghost" className="h-16 px-10 text-[17px] font-bold rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        View demo
                     </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                {/* Visual Artifacts */}
                <FloatingIcon icon="lucide:code-2" className="absolute -top-10 -left-10 z-20" delay={0.5} />
                <FloatingIcon icon="lucide:line-chart" className="absolute top-[40%] -right-10 z-20" delay={1} />
                <FloatingIcon icon="lucide:target" className="absolute -bottom-10 left-[20%] z-20" delay={0} />

                {/* Old Hero Component Revisit */}
                <div className="hero-shell p-3 sm:p-5 shadow-[0_40px_100px_rgba(79,70,229,0.08)] dark:shadow-none bg-white/40 dark:bg-slate-900/40 backdrop-blur border-white/40 dark:border-slate-800/40">
                  <div className="rounded-[24px] bg-white dark:bg-slate-900 p-6 shadow-inner border border-slate-100/50 dark:border-slate-800/50 overflow-hidden min-h-[400px]">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-5">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                              <Icon icon="lucide:user" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                           </div>
                           <div>
                              <div className="text-[13px] font-bold text-slate-900 dark:text-white">John Doe</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Software Engineer</div>
                           </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-50 dark:border-emerald-500/20 uppercase tracking-widest">Profile Ready</div>
                      </div>

                      <div className="grid gap-6">
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              <span>Skill Readiness</span>
                              <span className="text-indigo-600 dark:text-indigo-400">82%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: "82%" }} 
                                transition={{ duration: 1.5, delay: 1 }}
                                className="h-full bg-indigo-600"
                              />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="card bg-slate-50/30 dark:bg-slate-800/30 border-slate-50 dark:border-slate-800 p-4 shadow-none">
                              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">14</div>
                              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Gaps Found</div>
                           </div>
                           <div className="card bg-slate-50/30 dark:bg-slate-800/30 border-slate-50 dark:border-slate-800 p-4 shadow-none">
                              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">04</div>
                              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Top Pathways</div>
                           </div>
                        </div>

                        <div className="card border-indigo-50 dark:border-indigo-900/30 bg-indigo-50/10 dark:bg-indigo-500/5 p-5 relative overflow-hidden shadow-none">
                           <div className="flex items-center gap-4 relative z-10">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black italic">SA</div>
                              <div>
                                 <div className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">Solutions Architect</div>
                                 <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Recommended target path based on your background.</div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Capabilities Section */}
        <section id="features" className="container-page py-32">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-6 flex items-center justify-center gap-2">
              <Icon icon="lucide:zap" className="h-4 w-4" />
              Powering the future of recruitment
            </h2>
            <p className="text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-6xl mb-8">
              Intelligence in every step.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Feature 
              title="Resume Analysis" 
              desc="Deep-scan your resume for key signals, metrics, and technical keywords favored by AI recruiters."
              icon="lucide:file-text"
            />
            <Feature 
              title="Skill Normalization" 
              desc="We map your experimental projects to industry-standard roles and technical skill taxonomies."
              icon="lucide:layers"
            />
            <Feature 
              title="Market Pulse" 
              desc="Get real-time insights into salary ranges and popularity trends for your specific career path."
              icon="lucide:activity"
            />
            <Feature 
              title="Curated Learning" 
              desc="Skip the generic lists. We source learning resources that specifically bridge your skill gaps."
              icon="lucide:book-open"
            />
          </div>
        </section>

        {/* Stats Section with Divider */}
        <section className="bg-white dark:bg-slate-950 border-y border-slate-50 dark:border-slate-900 py-16">
          <div className="container-page flex flex-wrap justify-between items-center gap-12 lg:gap-24 opacity-60 dark:opacity-40">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6 grayscale dark:invert" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" alt="Slack" className="h-6 grayscale dark:invert" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-6 grayscale dark:invert" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-6 grayscale dark:invert" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg" alt="LinkedIn" className="h-6 grayscale dark:invert" />
          </div>
        </section>

        {/* FAQ Section - Refined */}
        <section id="faq" className="container-page py-32">
          <div className="max-w-4xl mx-auto">
             <div className="text-center mb-20">
                <h2 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl mb-8 uppercase italic">
                   Common <span className="text-indigo-600 dark:text-indigo-400 not-italic">Questions</span>
                </h2>
                <div className="h-1.5 w-24 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-full" />
             </div>
             <div className="space-y-4">
                {[
                  { q: "How does the AI analyze my resume?", a: "We use a multi-stage pipeline. First, we extract raw text using high-fidelity parsers. Then, we use Gemini to identify intent, impact metrics, and normalized technical skills, which are then compared against our proprietary career graph." },
                  { q: "Is my personal data safe?", a: "Absoluely. Your data is encrypted at rest and in transit. We do not use your personal resume to train general models, and you can delete your data at any time." },
                  { q: "Can I use this for multiple career paths?", a: "Yes. CareerPath allows you to track readiness for multiple roles simultaneously, helping you see which path has the shortest distance to role." },
                  { q: "Does this replace a career coach?", a: "It's built to supplement one. While a coach provides human empathy and networking tips, we provide the raw data, gap analysis, and ATS optimization that coaches often lack." }
                ].map((item, i) => (
                  <AccordionItem 
                    key={i} 
                    title={item.q}
                    isOpen={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.a}
                  </AccordionItem>
                ))}
             </div>
          </div>
        </section>

        {/* CTA Section - Final Update */}
        <section className="container-page py-32">
          <div className="relative rounded-[48px] bg-slate-950 px-8 py-24 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20"></div>
            
            {/* CTA Visual Pipes */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M110 20 C 80 20, 70 80, -10 80"
                stroke="#fff" strokeWidth="0.1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl font-black tracking-tight text-white mb-10 sm:text-7xl leading-[0.9] uppercase italic">
                Ready to <span className="text-indigo-400 not-italic">launch</span> <br/>
                your next jump?
              </h2>
              <div className="flex flex-col items-center justify-center gap-8">
                <Link to={isAuthed ? "/app/dashboard" : "/register"}>
                  <Button size="lg" className="h-20 px-14 text-xl font-black bg-white text-indigo-950 hover:bg-slate-100 rounded-full shadow-[0_20px_60px_rgba(255,255,255,0.1)] transition-all uppercase italic group">
                    {isAuthed ? "Access App" : "Get Started Free"}
                    <Icon icon="lucide:rocket" className="ml-4 h-8 w-8 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-6 p-2 rounded-full bg-white/5 border border-white/10 pr-6">
                  <div className="flex -space-x-4">
                    {[
                      "https://i.pravatar.cc/100?u=1",
                      "https://i.pravatar.cc/100?u=2",
                      "https://i.pravatar.cc/100?u=3",
                      "https://i.pravatar.cc/100?u=4"
                    ].map((url, i) => (
                      <img key={i} src={url} alt="User" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" />
                    ))}
                  </div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest leading-none">
                    Joined by 12,000+ <br/>
                    <span className="text-white">Forward Thinkers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 pt-32 pb-16">
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo className="mb-8" />
              <p className="text-[15px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed mb-10 max-w-xs">
                The AI-native career engineering platform. Precision data for high-stakes career decisions.
              </p>
              <div className="flex gap-4">
                {['twitter', 'github', 'linkedin'].map(soc => (
                  <div key={soc} className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all cursor-pointer group">
                    <Icon icon={`lucide:${soc}`} className="h-5 w-5 dark:text-slate-400 dark:group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
            {['Product', 'Company', 'Legal'].map((group, i) => (
              <div key={i}>
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-8">{group}</h4>
                <ul className="space-y-5 text-[14px] font-bold text-slate-500 dark:text-slate-400">
                  {i === 0 && ['Intelligence', 'Roadmap', 'Pricing', 'Changelog'].map(l => <li key={l}><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tight">{l}</a></li>)}
                  {i === 1 && ['About Us', 'Careers', 'Media Kit', 'Contact'].map(l => <li key={l}><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tight">{l}</a></li>)}
                  {i === 2 && ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(l => <li key={l}><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tight">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-32 pt-10 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-[11px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} CareerPath AI Group. All rights reserved.
            </div>
            <div className="flex items-center gap-10 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
               <span className="flex items-center gap-3">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                 System Normal
               </span>
               <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Infrastructure</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
