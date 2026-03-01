import { useEffect, useState } from "react";
import { fetchIndices } from "../api";
import { MOCK_INDICES } from "../mockData";

export default function TopBar() {
  const [indices, setIndices] = useState(MOCK_INDICES);

  useEffect(() => {
    const load = async () => {
      const { data } = await fetchIndices();
      if (data) setIndices(data);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-6 gap-6 border-b border-white/5"
      style={{ background: "rgba(6,6,6,0.94)", backdropFilter: "blur(16px)" }}
      role="banner"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-black"
          style={{ background: "#c8e000", color: "#000", fontFamily: "Syne, sans-serif" }}
          aria-label="ChiTrade logo"
        >
          χ
        </div>
        <span className="text-white font-black tracking-widest text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
          CHITRADE
        </span>
      </div>

      {/* Live indices ticker */}
      <nav
        className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar"
        aria-label="Live market indices"
      >
        {indices.map((idx) => (
          <div key={idx.id} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-zinc-500 mono text-xs tracking-wider">{idx.id}</span>
            <span className="text-white mono text-xs">{Number(idx.value).toLocaleString()}</span>
            <span className={`mono text-xs ${idx.change >= 0 ? "text-lime-400" : "text-red-400"}`}>
              {idx.change >= 0 ? "+" : ""}{Number(idx.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </nav>

      {/* Live indicator */}
      <div className="flex items-center gap-2 flex-shrink-0" aria-label="Live data indicator">
        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" />
        <span className="mono text-xs text-zinc-500">LIVE</span>
      </div>
    </header>
  );
}
