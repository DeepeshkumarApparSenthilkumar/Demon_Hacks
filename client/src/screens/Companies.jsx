import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchQuote, fetchChart, askClaude } from "../api";
import { CHICAGO_COMPANIES, MOCK_QUOTES, genSparkline } from "../mockData";
import { buildSystemPrompt, buildStockPrompt } from "../promptBuilder";
import { Card, PctChange, AiButton } from "../components/UI";

const RANGES = ["1D", "1W", "1M", "1Y"];

export default function Companies({ selectedCompany, setSelectedCompany }) {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("1D");
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  const [chartData, setChartData] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const active = selectedCompany || "BA";
  const q = quotes[active] || MOCK_QUOTES[active];
  const co = CHICAGO_COMPANIES.find((c) => c.id === active);
  const pos = (q?.pct ?? 0) >= 0;

  const filtered = CHICAGO_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const loadQuote = async () => {
      const { data } = await fetchQuote(active);
      if (data) setQuotes((p) => ({ ...p, [active]: { ...p[active], ...data } }));
    };
    loadQuote();
    setAiSummary("");
  }, [active]);

  useEffect(() => {
    const loadChart = async () => {
      const { data } = await fetchChart(active);
      if (data && data.length > 0) {
        setChartData(data);
      } else {
        setChartData(genSparkline(q?.price || 100, 0.025, 78));
      }
    };
    loadChart();
  }, [active, range]);

  const getAISummary = async () => {
    setLoadingAI(true);
    const text = await askClaude(
      [{ role: "user", content: buildStockPrompt(co, q, quotes) }],
      buildSystemPrompt()
    );
    setAiSummary(text);
    setLoadingAI(false);
  };

  const chartMin = chartData.length ? Math.min(...chartData.map((d) => d.v)) * 0.998 : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map((d) => d.v)) * 1.002 : 100;
  const chartColor = pos ? "#c8e000" : "#ff4444";

  return (
    <div className="flex gap-4 h-full fade-up">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies…"
          aria-label="Search companies"
          className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 mb-3 outline-none mono focus:border-lime-400/40 border border-white/8"
          style={{ background: "rgba(14,14,14,0.9)" }}
        />
        <div className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filtered.map((c) => {
            const cq = quotes[c.id] || MOCK_QUOTES[c.id];
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedCompany(c.id); setAiSummary(""); }}
                aria-label={`View ${c.name}`}
                aria-current={isActive ? "true" : undefined}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-between focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400"
                style={
                  isActive
                    ? { background: "rgba(200,224,0,0.07)", border: "1px solid rgba(200,224,0,0.2)" }
                    : { border: "1px solid transparent" }
                }
              >
                <div>
                  <div className={`text-xs font-black ${isActive ? "text-white" : "text-zinc-500"}`}>{c.id}</div>
                  <div className="text-zinc-700 text-xs">{c.name.slice(0, 14)}</div>
                </div>
                <PctChange pct={cq?.pct ?? 0} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header + chart */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white">{co?.name}</h2>
                <span className="text-zinc-500 mono text-sm">{active}</span>
                <span className="mono text-zinc-600 text-xs border border-white/8 px-2 py-0.5 rounded">{co?.sector}</span>
              </div>
              <div className="text-zinc-600 mono text-xs mt-1">{co?.exchange}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black mono text-white">${(q?.price || 0).toFixed(2)}</div>
              <div className="flex items-center gap-2 justify-end mt-1">
                <span className={`mono text-sm ${pos ? "text-lime-400" : "text-red-400"}`}>
                  {pos ? "+" : ""}{(q?.change || 0).toFixed(2)}
                </span>
                <PctChange pct={q?.pct ?? 0} />
              </div>
            </div>
          </div>

          {/* Range selector */}
          <div className="flex gap-2 mb-4">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1 rounded mono text-xs transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-lime-400"
                style={
                  range === r
                    ? { background: "#c8e000", color: "#000", fontWeight: 700 }
                    : { color: "#555", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {r}
              </button>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: "#444", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[chartMin, chartMax]} tick={{ fill: "#444", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={52} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" }}
                labelStyle={{ color: "#666" }}
                formatter={(v) => [`$${v.toFixed(2)}`, active]}
              />
              <Area type="monotone" dataKey="v" stroke={chartColor} strokeWidth={2} fill="url(#chartGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Fundamentals */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Market Cap", value: q?.cap || "—"               },
            { label: "P/E Ratio",  value: q?.pe ? q.pe.toFixed(1) : "—" },
            { label: "Volume",     value: q?.vol || q?.volume || "—"   },
            { label: "Exchange",   value: co?.exchange || "—"          },
          ].map((m) => (
            <Card key={m.label} className="p-3">
              <div className="mono text-zinc-600 text-xs mb-1">{m.label}</div>
              <div className="text-white font-black text-lg">{m.value}</div>
            </Card>
          ))}
        </div>

        {/* AI Summary */}
        <Card className="p-4" accent={!!aiSummary}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-black text-sm">◎ AI Analysis</span>
            <AiButton onClick={getAISummary} loading={loadingAI} label="Generate Summary" />
          </div>
          {aiSummary ? (
            <p className="text-zinc-300 text-sm leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-zinc-600 text-sm mono">Click "Generate Summary" for AI-powered market analysis.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
