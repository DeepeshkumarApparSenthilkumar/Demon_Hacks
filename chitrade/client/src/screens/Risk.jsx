import { useState } from "react";
import { askClaude } from "../api";
import { MOCK_RISK } from "../mockData";
import { Card, Badge, AiButton } from "../components/UI";

const RISK_STYLES = {
  Low:      { color: "#c8e000", bg: "rgba(200,224,0,0.06)",   border: "rgba(200,224,0,0.2)"  },
  Moderate: { color: "#f5a623", bg: "rgba(245,166,35,0.06)",  border: "rgba(245,166,35,0.2)" },
  High:     { color: "#ff4444", bg: "rgba(255,68,68,0.06)",   border: "rgba(255,68,68,0.2)"  },
};

export default function Risk() {
  const [risk, setRisk] = useState(MOCK_RISK);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = async () => {
    setLoading(true);
    const prompt = `Analyze Chicago market conditions today: VIX at 16.88, Boeing -0.68%, UAL -3.32%, CME +0.50%, ABBV -0.26%, CBOE +1.76%, ADM -1.80%. 

Return ONLY a JSON object (no markdown, no explanation) with exactly these keys:
{
  "overallRisk": "Low" or "Moderate" or "High",
  "reasoning": "2-3 sentence explanation",
  "exposureFactors": [
    {"factor": "name", "level": "Low" or "Moderate" or "High", "ticker": "SYMBOL"}
  ]
}`;

    const text = await askClaude(
      [{ role: "user", content: prompt }],
      "You are a quantitative risk analyst. Return only valid JSON with no markdown formatting."
    );

    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.overallRisk && parsed.reasoning && parsed.exposureFactors) {
        setRisk(parsed);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      console.warn("Could not parse AI risk JSON, keeping current data");
    }
    setLoading(false);
  };

  const style = RISK_STYLES[risk.overallRisk] || RISK_STYLES.Moderate;

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Risk Analysis</h1>
          <p className="text-zinc-500 mono text-sm mt-1">
            Chicago exposure factors · AI aggregation
            {lastUpdated && <span className="ml-2 text-zinc-600">Updated {lastUpdated}</span>}
          </p>
        </div>
        <AiButton onClick={refresh} loading={loading} label="◎ Refresh AI Risk" />
      </div>

      {/* Overall risk card */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{ background: style.bg, border: `1px solid ${style.border}` }}
      >
        <div className="flex items-start gap-5 mb-4">
          <div>
            <div className="mono text-zinc-500 text-xs tracking-wider mb-1">OVERALL RISK</div>
            <div className="text-5xl font-black tracking-tight" style={{ color: style.color }}>
              {risk.overallRisk}
            </div>
          </div>
          <div className="flex-1 pt-1">
            <div className="mono text-zinc-500 text-xs tracking-wider mb-2">RISK METER</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: risk.overallRisk === "Low" ? "25%" : risk.overallRisk === "Moderate" ? "58%" : "88%",
                  background: style.color,
                }}
              />
            </div>
          </div>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{risk.reasoning}</p>
      </div>

      {/* Exposure factors */}
      <div>
        <div className="mono text-zinc-600 text-xs tracking-wider mb-3">EXPOSURE FACTORS</div>
        <div className="space-y-2">
          {risk.exposureFactors.map((f, i) => (
            <Card key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="mono text-zinc-700 text-xs w-6 text-right">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-white text-sm font-semibold">{f.factor}</div>
                  <div className="mono text-zinc-600 text-xs mt-0.5">{f.ticker}</div>
                </div>
              </div>
              <Badge variant={f.level?.toLowerCase()}>{f.level}</Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* Raw JSON */}
      <div className="mt-5">
        <div className="mono text-zinc-700 text-xs tracking-wider mb-2">RAW JSON OUTPUT</div>
        <Card className="p-4">
          <pre className="mono text-xs text-zinc-500 overflow-x-auto leading-relaxed">
            {JSON.stringify(risk, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
