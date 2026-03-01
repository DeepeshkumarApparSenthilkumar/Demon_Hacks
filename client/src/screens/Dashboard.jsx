import { useState, useEffect } from "react";
import { fetchQuote, askClaude } from "../api";
import { CHICAGO_COMPANIES, MOCK_QUOTES, genSparkline } from "../mockData";
import { buildSystemPrompt, buildStockPrompt } from "../promptBuilder";
import { Card, Sparkline, PctChange, AiButton } from "../components/UI";

export default function Dashboard({ setScreen, setSelectedCompany }) {
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  const [aiTexts, setAiTexts] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    // Fetch live quotes (falls back to mock on API limit)
    CHICAGO_COMPANIES.forEach(async (co) => {
      const { data } = await fetchQuote(co.id);
      if (data) {
        setQuotes((prev) => ({ ...prev, [co.id]: { ...prev[co.id], ...data } }));
      }
    });
  }, []);

  const getAI = async (e, ticker) => {
    e.stopPropagation();
    setLoading((p) => ({ ...p, [ticker]: true }));
    const q = quotes[ticker] || MOCK_QUOTES[ticker];
    const co = CHICAGO_COMPANIES.find((c) => c.id === ticker);
    const text = await askClaude(
      [{ role: "user", content: buildStockPrompt(co, q, quotes) }],
      buildSystemPrompt()
    );
    setAiTexts((p) => ({ ...p, [ticker]: text }));
    setLoading((p) => ({ ...p, [ticker]: false }));
  };

  return (
    <div className="fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Chicago Markets</h1>
        <p className="text-zinc-500 mono text-sm mt-1">Trade Smarter. Chicago Faster.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {CHICAGO_COMPANIES.map((co) => {
          const q = quotes[co.id] || MOCK_QUOTES[co.id];
          const pos = (q?.pct ?? q?.change ?? 0) >= 0;
          const spark = genSparkline(q?.price || 100, 0.025);

          return (
            <Card
              key={co.id}
              className="p-4 cursor-pointer hover:border-white/15"
              onClick={() => { setSelectedCompany(co.id); setScreen("companies"); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-black text-sm">{co.id}</span>
                    <span className="mono text-zinc-600 text-xs border border-white/8 px-1.5 py-0.5 rounded">
                      {co.exchange}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-xs">{co.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white mono text-sm font-bold">${(q?.price || 0).toFixed(2)}</div>
                  <PctChange pct={q?.pct ?? 0} />
                </div>
              </div>

              <Sparkline data={spark} positive={pos} />

              {aiTexts[co.id] && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-zinc-400 leading-relaxed">
                  {aiTexts[co.id]}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="mono text-zinc-600 text-xs">Vol {q?.vol || q?.volume || "—"}</span>
                <AiButton
                  onClick={(e) => getAI(e, co.id)}
                  loading={loading[co.id]}
                  label="◎ AI"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
