import { useState, useEffect, useRef } from "react";
import { http } from "../../lib/http";
import { authStore } from "../../lib/state/authStore";
import { env } from "../../lib/env";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/ui/cn";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "../../components/layout/AppShell";

const QUICK_QUESTIONS = [
  "What skills am I missing?",
  "How can I reach senior level?",
  "Analyze my career summary",
  "Suggested learning resources",
];

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-[28px] px-6 py-4 shadow-sm transition-all duration-300",
          isUser
            ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100 dark:shadow-none font-medium"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-bl-none hover:shadow-md"
        )}
      >
        {isUser ? (
          <div className="text-sm">{text}</div>
        ) : (
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none 
              prose-p:leading-relaxed prose-p:my-1.5 
              prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black
              prose-ul:my-2 prose-li:my-1 prose-ul:list-disc prose-ul:pl-4
              text-xs md:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to your full-screen Career Intelligence Center. I have access to your full profile—how can I help you today?",
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
  }, [messages]);

  useEffect(() => {
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
  }, []);

  async function clearHistory() {
    if (!confirm("Clear your chat history?")) return;
    try {
      await http.delete("/api/chat");
      setMessages([{
        role: "assistant",
        text: "History cleared. How can I help you explore your career today?",
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
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to AI');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

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
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: "assistant", 
                    text: aiResponseText 
                  };
                  return newMessages;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Local AI is taking a bit longer to respond. Please ensure Ollama is running and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
              <Icon icon="lucide:message-square" className="h-3.5 w-3.5" />
              Intelligence Center
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white leading-none uppercase italic">
              Career Copilot
            </h1>
          </div>
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-slate-100 dark:border-slate-800"
          >
            <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            Clear Chat History
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 md:p-12 space-y-2 custom-scrollbar"
          >
            {messages.map((m, idx) => (
              <MessageBubble key={idx} role={m.role} text={m.text} />
            ))}
            {sending && messages[messages.length-1].text === "..." && (
              <div className="flex justify-start mb-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-full px-6 py-3 flex gap-2 items-center">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length < 5 && !sending && (
            <div className="px-12 pb-6 flex flex-wrap gap-3">
              {QUICK_QUESTIONS.map(q => (
                <button 
                  key={q}
                  onClick={() => send(q)}
                  className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-8 border-t border-slate-50 dark:border-slate-800">
            <div className="relative max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask me about your career, skills, or roadmap..."
                className="w-full h-16 pl-8 pr-20 py-5 rounded-[32px] bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white dark:focus:bg-slate-700 transition-all text-sm font-bold resize-none custom-scrollbar"
              />
              <button 
                onClick={() => send()}
                disabled={sending || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-slate-950 transition-all disabled:opacity-20 shadow-lg shadow-indigo-600/20"
              >
                <Icon icon="lucide:arrow-up" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
