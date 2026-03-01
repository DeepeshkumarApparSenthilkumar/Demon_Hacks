import { useState, useEffect } from "react";
import { fetchIndices, askClaude } from "../api";
import { MOCK_INDICES, genSparkline } from "../mockData";
import { buildSystemPrompt, buildMarketSummaryPrompt } from "../promptBuilder";
import { Card, Sparkline, PctChange, AiButton } from "../components/UI";

export default function Indices() {
  const [indices, setIndices] = useState(MOCK_INDICES);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await fetchIndices();
      if (data) setIndices(data);
    };
    load();
  }, []);

  const getInsight = async () => {
    setLoading(true);
    const text = await askClaude(
      [{ role: "user", content: buildMarketSummaryPrompt() }],
      buildSystemPrompt()
    );
    setAiInsight(text);
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Market Indices</h1>
          <p className="text-zinc-500 mono text-sm mt-1">Global signals · Chicago impact</p>
        </div>
        <AiButton onClick={getInsight} loading={loading} label="◎ AI Insight" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {indices.map((idx) => {
          const pos = Number(idx.change) >= 0;
          const spark = genSparkline(Number(idx.value), 0.01, 40);
          return (
            <Card key={idx.id} className="p-5 hover:border-white/12">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-zinc-400 text-sm tracking-wider">{idx.id}</span>
                <PctChange pct={Number(idx.change)} />
              </div>
              <div className="text-white font-black text-2xl mono mb-1">
                {Number(idx.value).toLocaleString()}
              </div>
              <div className="text-zinc-600 text-xs mb-3">{idx.name}</div>
              <Sparkline data={spark} positive={pos} />
              {idx.impact && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-zinc-500 leading-relaxed">
                  {idx.impact}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {aiInsight && (
        <Card className="p-5" accent>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lime-400">◎</span>
            <span className="text-white font-black text-sm">AI Market Intelligence</span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{aiInsight}</p>
        </Card>
      )}
    </div>
  );
}
