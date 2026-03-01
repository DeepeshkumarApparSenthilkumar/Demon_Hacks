import { AreaChart, Area, ResponsiveContainer } from "recharts";

export function Sparkline({ data, positive }) {
  const color = positive ? "#c8e000" : "#ff4444";
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${positive})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Card({ children, className = "", accent = false }) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${className}`}
      style={{
        background: "rgba(12,12,12,0.85)",
        borderColor: accent ? "rgba(200,224,0,0.2)" : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = "neutral" }) {
  const styles = {
    positive: { color: "#c8e000", background: "rgba(200,224,0,0.1)" },
    negative: { color: "#ff4444", background: "rgba(255,68,68,0.1)"  },
    neutral:  { color: "#888",    background: "rgba(136,136,136,0.1)" },
    high:     { color: "#ff4444", background: "rgba(255,68,68,0.1)"   },
    moderate: { color: "#f5a623", background: "rgba(245,166,35,0.1)"  },
    low:      { color: "#c8e000", background: "rgba(200,224,0,0.1)"   },
  };
  const s = styles[variant.toLowerCase()] || styles.neutral;
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full mono"
      style={s}
    >
      {children}
    </span>
  );
}

export function AiButton({ onClick, loading, label = "◎ AI Analysis" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg mono font-medium transition-all duration-150 disabled:opacity-50"
      style={{
        background: loading ? "rgba(200,224,0,0.15)" : "#c8e000",
        color: loading ? "#c8e000" : "#000",
        border: loading ? "1px solid rgba(200,224,0,0.3)" : "none",
      }}
    >
      {loading ? "Analyzing…" : label}
    </button>
  );
}

export function Loader() {
  return (
    <div className="flex items-center gap-2 text-zinc-600 mono text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" />
      <div className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" style={{ animationDelay: "0.2s" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

export function PctChange({ pct }) {
  const pos = pct >= 0;
  return (
    <span className={`mono text-xs font-medium ${pos ? "text-lime-400" : "text-red-400"}`}>
      {pos ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}
