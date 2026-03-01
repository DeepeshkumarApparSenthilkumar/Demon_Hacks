import { useState, useRef, useEffect } from "react";
import { askClaude } from "../api";

const SUGGESTED = [
  "Why is Boeing down today?",
  "What's the market risk in Chicago right now?",
  "How do CME futures affect local companies?",
  "Summarize today's market for me.",
  "What should I watch in Chicago markets this week?",
];

const SYSTEM_PROMPT = `You are ChiTrade AI — a Chicago-focused financial intelligence assistant.
You have deep expertise in: Chicago-headquartered companies (Boeing, CME Group, Cboe, McDonald's, AbbVie, United Airlines, Mondelez, ADM), CME futures markets, CBOE volatility products, Chicago economic indicators, and local market dynamics.
Rules: Be sharp and concise (≤5 sentences). Reference Chicago companies and local context when relevant. Never give direct financial advice. Always note when data may be delayed.`;

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello. I'm ChiTrade AI — your Chicago market intelligence layer. I can help you understand company movements, index impacts, futures dynamics, and local economic signals. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setInput("");

    const newMsgs = [...messages, { role: "user", content: q }];
    setMessages(newMsgs);
    setLoading(true);

    const reply = await askClaude(
      newMsgs.map((m) => ({ role: m.role, content: m.content })),
      SYSTEM_PROMPT
    );

    setMessages((p) => [...p, { role: "assistant", content: reply }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col fade-up" style={{ height: "calc(100vh - 116px)" }}>
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-3xl font-black text-white">AI Assistant</h1>
        <p className="text-zinc-500 mono text-sm mt-1">Chicago market intelligence · Powered by Claude</p>
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="mono text-xs px-3 py-1.5 rounded-full border border-white/10 text-zinc-500 hover:text-white hover:border-white/25 transition-all disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
              style={
                m.role === "user"
                  ? { background: "#c8e000", color: "#000", fontWeight: 500 }
                  : { background: "rgba(16,16,16,0.95)", border: "1px solid rgba(255,255,255,0.07)", color: "#d4d4d4" }
              }
            >
              {m.role === "assistant" && (
                <span className="mono text-lime-400 text-xs block mb-1.5">◎ ChiTrade AI</span>
              )}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm"
              style={{ background: "rgba(16,16,16,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="mono text-lime-400 text-xs block mb-1.5">◎ ChiTrade AI</span>
              <div className="flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((d, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about Chicago markets…"
          aria-label="Chat message input"
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none mono border border-white/8 focus:border-lime-400/30 transition-colors"
          style={{ background: "rgba(12,12,12,0.9)" }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="px-5 py-3 rounded-xl mono text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "#c8e000", color: "#000" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
