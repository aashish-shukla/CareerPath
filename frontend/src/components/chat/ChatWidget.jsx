import { useEffect, useRef, useState } from "react";
import { http } from "../../lib/http";
import { authStore } from "../../lib/state/authStore";
import { env } from "../../lib/env";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/ui/cn";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const QUICK_QUESTIONS = [
  "What skills am I missing?",
  "How can I reach senior level?",
  "What is the market demand?",
  "Analyze my career summary",
];

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[24px] px-5 py-3.5 shadow-sm transition-all duration-300",
          isUser
            ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100 dark:shadow-none font-medium"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-bl-none hover:shadow-md"
        )}
      >
        {isUser ? (
          <div className="text-xs">{text}</div>
        ) : (
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none 
              prose-p:leading-relaxed prose-p:my-1.5 
              prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black
              prose-ul:my-2 prose-li:my-1 prose-ul:list-disc prose-ul:pl-4
              text-[11px] md:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I’m your AI Career Copilot. I have access to your profile context—ask me anything about your roadmap!",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [profileSummary, setProfileSummary] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      // Load Profile Summary
      const { data: pData } = await http.get("/api/profile/me").catch(() => ({ data: { profile: null } }));
      setProfileSummary(pData?.profile?.profileSummary ?? null);

      // Load Chat History
      try {
        const { data: cData } = await http.get("/api/chat");
        if (cData.messages?.length > 0) {
          setMessages(cData.messages);
        }
      } catch (err) {
        console.error("Failed to load chat history");
      }
    })();
  }, [open]);

  async function clearHistory() {
    if (!confirm("Clear your chat history?")) return;
    try {
      await http.delete("/api/chat");
      setMessages([{
        role: "assistant",
        text: "Hi, I’m your AI Career Copilot. I have access to your profile context—ask me anything about your roadmap!",
      }]);
    } catch (err) {
      alert("Failed to clear history");
    }
  }

  async function send(overrideText) {
    const text = (overrideText || input).trim();
    if (!text || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    try {
      const response = await fetch(`${env.API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.getToken()}`
        },
        body: JSON.stringify({
          message: text,
          context: {
            profileSummary: profileSummary?.summary ?? "",
            highlights: profileSummary?.highlights ?? [],
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to AI');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

      // Add placeholder for AI response
      setMessages((prev) => [...prev, { role: "assistant", text: "..." }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                aiResponseText += parsed.text;
                // Update the last message in the list
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: "assistant", 
                    text: aiResponseText 
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err?.message ?? "Local AI is taking a bit longer to respond. Please ensure Ollama is running and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="pointer-events-none fixed top-4 right-10 z-[100] flex flex-col items-end">
      <div className="pointer-events-auto flex flex-col items-end">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-12 items-center gap-3 rounded-full border px-5 text-xs font-black uppercase italic tracking-widest transition-all duration-300 shadow-xl",
            open 
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" 
              : "bg-indigo-600 border-indigo-500 text-white shadow-indigo-300 dark:shadow-none"
          )}
        >
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500",
            open ? "bg-indigo-600 text-white rotate-180" : "bg-white text-indigo-600"
          )}>
            <Icon icon={open ? "lucide:x" : "lucide:sparkles"} className="h-4 w-4" />
          </div>
          <span>{open ? "Close Copilot" : "Career Copilot"}</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95, transformOrigin: "top right" }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mt-4 w-[380px] rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">Active Session</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Intelligence Engine</div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate("/app/chat")}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                    title="Open Full Screen"
                  >
                    <Icon icon="lucide:maximize-2" className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={clearHistory}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Clear History"
                  >
                    <Icon icon="lucide:trash-2" className="h-4 w-4" />
                  </button>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              
              <div 
                ref={scrollRef} 
                className="h-[400px] space-y-4 overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth"
              >
                {messages.map((m, idx) => (
                  <MessageBubble key={idx} role={m.role} text={m.text} />
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-full px-4 py-2 flex gap-1 items-center">
                       <div className="w-1.5 h-1.5 bg-slate-300 animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-slate-300 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {messages.length < 3 && !sending && (
                <div className="px-6 pb-4 pt-2">
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Prompts</div>
                   <div className="flex flex-wrap gap-2">
                      {QUICK_QUESTIONS.map(q => (
                        <button 
                          key={q}
                          onClick={() => send(q)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all text-left"
                        >
                          {q}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="border-t border-slate-50 dark:border-slate-800 px-6 py-6 bg-white dark:bg-slate-900">
                <div className="relative group">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Enter career query..."
                    className="h-12 pl-6 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all text-xs font-bold"
                  />
                  <button 
                    onClick={() => send()}
                    disabled={sending || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


