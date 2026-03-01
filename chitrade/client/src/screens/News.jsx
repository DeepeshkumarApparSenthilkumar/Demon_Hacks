import { useState, useEffect } from "react";
import { fetchNews, askClaude } from "../api";
import { MOCK_NEWS } from "../mockData";
import { Card, Badge, AiButton } from "../components/UI";

function sentimentVariant(s) {
  if (!s) return "neutral";
  const l = s.toLowerCase();
  if (l.includes("positive")) return "positive";
  if (l.includes("negative")) return "negative";
  return "neutral";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  if (dateStr.includes("ago")) return dateStr;
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 1000 / 60);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  } catch { return dateStr; }
}

export default function News() {
  const [articles, setArticles] = useState(MOCK_NEWS);
  const [expanded, setExpanded] = useState(null);
  const [aiImpacts, setAiImpacts] = useState({});
  const [loading, setLoading] = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      const { data } = await fetchNews();
      if (data && data.length > 0) setArticles(data);
      setFetching(false);
    };
    load();
  }, []);

  const getImpact = async (e, id, headline) => {
    e.stopPropagation();
    setLoading((p) => ({ ...p, [id]: true }));
    const text = await askClaude(
      [{ role: "user", content: `Assess the market impact of this Chicago financial news on local companies in ≤2 sentences: "${headline}"` }]
    );
    setAiImpacts((p) => ({ ...p, [id]: text }));
    setLoading((p) => ({ ...p, [id]: false }));
  };

  return (
    <div className="fade-up">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Chicago Financial News</h1>
        <p className="text-zinc-500 mono text-sm mt-1">
          Hyperlocal intelligence · AI impact assessment
          {fetching && <span className="ml-2 text-lime-400">Loading…</span>}
        </p>
      </div>

      <div className="space-y-2">
        {articles.map((n) => {
          const id = n.id;
          const isOpen = expanded === id;
          const variant = sentimentVariant(n.sentiment);

          return (
            <Card
              key={id}
              className={`p-4 cursor-pointer hover:border-white/12 ${isOpen ? "border-white/10" : ""}`}
              onClick={() => setExpanded(isOpen ? null : id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-semibold leading-snug mb-2 line-clamp-2">
                    {n.headline}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="mono text-zinc-600 text-xs">{n.source}</span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="mono text-zinc-600 text-xs">{formatDate(n.date)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={variant}>{n.sentiment || "Neutral"}</Badge>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  {n.description && (
                    <p className="text-zinc-500 text-xs leading-relaxed mb-3">{n.description}</p>
                  )}
                  {aiImpacts[id] ? (
                    <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(200,224,0,0.04)", border: "1px solid rgba(200,224,0,0.15)" }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-lime-400 text-xs">◎</span>
                        <span className="text-white text-xs font-bold">AI Impact Analysis</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{aiImpacts[id]}</p>
                    </div>
                  ) : (
                    <AiButton
                      onClick={(e) => getImpact(e, id, n.headline)}
                      loading={loading[id]}
                      label="◎ Analyze Impact"
                    />
                  )}
                  {n.url && (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Read full article →
                    </a>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
