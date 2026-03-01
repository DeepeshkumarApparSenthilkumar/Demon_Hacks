import { useState, useEffect } from "react";
import { checkHealth } from "../api";
import { Card, Badge } from "../components/UI";

export default function Settings() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await checkHealth();
      setHealth(data);
    };
    load();
  }, []);

  const keys = [
    { label: "Claude AI",      key: "CLAUDE_API_KEY",  env: "claude",  url: "https://console.anthropic.com",  desc: "Powers all AI analysis, summaries, and chat" },
    { label: "Alpha Vantage",  key: "MARKET_API_KEY",  env: "market",  url: "https://alphavantage.co",         desc: "Live stock quotes and chart data"             },
    { label: "NewsAPI",        key: "NEWS_API_KEY",    env: "news",    url: "https://newsapi.org",             desc: "Chicago financial news headlines"             },
  ];

  return (
    <div className="fade-up max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Settings</h1>
        <p className="text-zinc-500 mono text-sm mt-1">API configuration · Server status</p>
      </div>

      {/* Server status */}
      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-black text-sm">Server Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${health ? "bg-lime-400 pulse-dot" : "bg-red-400"}`} />
            <span className="mono text-xs text-zinc-500">{health ? "Connected" : "Offline"}</span>
          </div>
        </div>
        <p className="mono text-zinc-600 text-xs">
          Backend running at <span className="text-zinc-400">localhost:3001</span> — all API keys are secured server-side.
        </p>
      </Card>

      {/* API Keys */}
      <div className="space-y-3 mb-5">
        <div className="mono text-zinc-600 text-xs tracking-wider mb-2">API KEYS (server/.env)</div>
        {keys.map((k) => {
          const configured = health?.keys?.[k.env];
          return (
            <Card key={k.key} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-semibold text-sm">{k.label}</div>
                  <div className="mono text-zinc-600 text-xs mt-0.5">{k.desc}</div>
                </div>
                <Badge variant={configured ? "positive" : "negative"}>
                  {configured ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <code className="mono text-zinc-500 text-xs">{k.key}=</code>
                <a
                  href={k.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs text-zinc-600 hover:text-lime-400 transition-colors"
                >
                  Get key →
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Setup instructions */}
      <Card className="p-5">
        <div className="text-white font-black text-sm mb-3">Setup Instructions</div>
        <ol className="space-y-3 text-sm text-zinc-400 list-decimal list-inside">
          <li>Open <code className="mono text-zinc-300 text-xs bg-zinc-900 px-1.5 py-0.5 rounded">server/.env</code> in a text editor</li>
          <li>Add your API keys (one per line)</li>
          <li>Restart the server: <code className="mono text-zinc-300 text-xs bg-zinc-900 px-1.5 py-0.5 rounded">npm run dev</code> in the server folder</li>
          <li>Keys never leave the server — the browser only talks to <code className="mono text-zinc-300 text-xs bg-zinc-900 px-1.5 py-0.5 rounded">localhost:3001</code></li>
        </ol>
        <pre
          className="mt-4 mono text-xs text-zinc-500 leading-relaxed rounded-lg p-4 overflow-x-auto"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
        >{`# server/.env
CLAUDE_API_KEY=sk-ant-api03-...
MARKET_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_newsapi_key
PORT=3001`}</pre>
      </Card>
    </div>
  );
}
