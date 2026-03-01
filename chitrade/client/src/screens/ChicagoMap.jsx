import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchQuote, askClaude } from "../api";
import { MOCK_QUOTES, MOCK_NEWS } from "../mockData";
import { buildSystemPrompt, buildStockPrompt } from "../promptBuilder";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN;

// ─── Company HQ Data ─────────────────────────────────────────────────────────
const COMPANY_HQ = [
  { id: "BA",   name: "Boeing",          sector: "Aerospace",   address: "100 N Riverside Plaza",       lng: -87.6377, lat: 41.8839 },
  { id: "MCD",  name: "McDonald's",      sector: "Consumer",    address: "110 N Carpenter St",          lng: -87.6523, lat: 41.8836 },
  { id: "CME",  name: "CME Group",       sector: "Finance",     address: "20 S Wacker Dr",              lng: -87.6366, lat: 41.8826 },
  { id: "CBOE", name: "Cboe Global",     sector: "Finance",     address: "433 W Van Buren St",          lng: -87.6406, lat: 41.8764 },
  { id: "UAL",  name: "United Airlines", sector: "Aviation",    address: "233 S Wacker Dr (Willis)",    lng: -87.6359, lat: 41.8789 },
  { id: "ABBV", name: "AbbVie",          sector: "Pharma",      address: "1 N Waukegan Rd, N. Chicago", lng: -87.8556, lat: 42.3282 },
  { id: "MDLZ", name: "Mondelez",        sector: "Consumer",    address: "905 W Fulton Market",         lng: -87.6547, lat: 41.8865 },
  { id: "ADM",  name: "Archer-Daniels",  sector: "Agriculture", address: "77 W Wacker Dr",              lng: -87.6340, lat: 41.8861 },
  { id: "WEC",  name: "WEC Energy",      sector: "Utilities",   address: "231 W Michigan St, Milwaukee",lng: -87.9121, lat: 43.0389 },
  { id: "MS",   name: "Morningstar",     sector: "Finance",     address: "22 W Washington St",          lng: -87.6327, lat: 41.8830 },
];

// ─── News Hotspots (economic activity overlays) ───────────────────────────────
const NEWS_HOTSPOTS = [
  { id: "loop",      label: "The Loop",         lng: -87.6298, lat: 41.8826, type: "finance",  intensity: 0.9, news: "CME & CBOE driving record derivatives volumes in Chicago's financial district" },
  { id: "ohare",     label: "O'Hare Corridor",  lng: -87.9073, lat: 41.9742, type: "aviation", intensity: 0.7, news: "UAL capacity cuts affecting O'Hare gate utilization — Q2 headwinds visible" },
  { id: "fulton",    label: "Fulton Market",     lng: -87.6521, lat: 41.8858, type: "consumer", intensity: 0.6, news: "Mondelez expanding innovation hub — snacking category up 4% YoY" },
  { id: "riverwalk", label: "River North",       lng: -87.6341, lat: 41.8902, type: "finance",  intensity: 0.5, news: "Downtown Chicago office vacancy still elevated; financial sector absorbing space" },
  { id: "midway",    label: "Midway District",   lng: -87.7374, lat: 41.7868, type: "logistics",intensity: 0.4, news: "ADM logistics hub active; grain futures reflecting weather-driven supply pressure" },
];

const SECTOR_COLORS = {
  Finance:     "#c8e000",
  Aerospace:   "#4fc3f7",
  Consumer:    "#ff9f43",
  Pharma:      "#a29bfe",
  Aviation:    "#fd79a8",
  Agriculture: "#55efc4",
  Utilities:   "#74b9ff",
};

const HOTSPOT_COLORS = {
  finance:   "#c8e000",
  aviation:  "#fd79a8",
  consumer:  "#ff9f43",
  logistics: "#55efc4",
};

function PctBadge({ pct }) {
  const pos = pct >= 0;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{
        color: pos ? "#c8e000" : "#ff4444",
        background: pos ? "rgba(200,224,0,0.12)" : "rgba(255,68,68,0.12)",
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {pos ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

// ─── Floating card for selected company ──────────────────────────────────────
function CompanyCard({ company, quote, onClose, onOpenCompany }) {
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const getAI = async () => {
    setAiLoading(true);
    const text = await askClaude(
      [{ role: "user", content: buildStockPrompt(company, quote, {}) }],
      buildSystemPrompt()
    );
    setAiText(text);
    setAiLoading(false);
  };

  const pos = (quote?.pct ?? 0) >= 0;
  const sectorColor = SECTOR_COLORS[company.sector] || "#c8e000";

  return (
    <div
      className="absolute top-4 right-4 w-80 rounded-2xl overflow-hidden z-20 shadow-2xl fade-up"
      style={{
        background: "rgba(8,8,8,0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: sectorColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-black text-lg">{company.id}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: sectorColor, background: `${sectorColor}15` }}
              >
                {company.sector}
              </span>
            </div>
            <div className="text-zinc-400 text-sm">{company.name}</div>
            <div className="text-zinc-600 text-xs mt-0.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              📍 {company.address}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors text-lg leading-none mt-0.5"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Price */}
        <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-zinc-500 text-xs mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>LAST PRICE</div>
              <div className="text-white font-black text-2xl" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                ${(quote?.price || 0).toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <PctBadge pct={quote?.pct ?? 0} />
              <div className={`text-xs mt-1 ${pos ? "text-lime-400" : "text-red-400"}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {pos ? "+" : ""}{(quote?.change || 0).toFixed(2)} today
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
            {[
              { label: "Mkt Cap", value: quote?.cap || "—" },
              { label: "P/E",     value: quote?.pe ? quote.pe.toFixed(1) : "—" },
              { label: "Volume",  value: quote?.vol || "—" },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-zinc-600 text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>{m.label}</div>
                <div className="text-white font-bold text-sm">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {aiText ? (
          <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(200,224,0,0.05)", border: "1px solid rgba(200,224,0,0.15)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{ color: "#c8e000" }}>◎</span>
              <span className="text-white font-bold text-xs">AI Analysis</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{aiText}</p>
          </div>
        ) : (
          <button
            onClick={getAI}
            disabled={aiLoading}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all mb-3"
            style={{
              background: aiLoading ? "rgba(200,224,0,0.1)" : "#c8e000",
              color: aiLoading ? "#c8e000" : "#000",
              border: aiLoading ? "1px solid rgba(200,224,0,0.3)" : "none",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {aiLoading ? "Analyzing…" : "◎ Generate AI Summary"}
          </button>
        )}

        {/* View full */}
        <button
          onClick={() => onOpenCompany(company.id)}
          className="w-full py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors border border-white/8 hover:border-white/20"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          View Full Analysis →
        </button>
      </div>
    </div>
  );
}

// ─── Hotspot info card ────────────────────────────────────────────────────────
function HotspotCard({ hotspot, onClose }) {
  const color = HOTSPOT_COLORS[hotspot.type] || "#c8e000";
  return (
    <div
      className="absolute top-4 right-4 w-80 rounded-2xl overflow-hidden z-20 shadow-2xl fade-up"
      style={{
        background: "rgba(8,8,8,0.96)",
        border: `1px solid ${color}30`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="h-1 w-full" style={{ background: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white font-black text-base">{hotspot.label}</div>
            <div className="text-xs mt-0.5 font-medium capitalize" style={{ color, fontFamily: "JetBrains Mono, monospace" }}>
              {hotspot.type} activity
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors text-lg">×</button>
        </div>

        {/* Activity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            <span className="text-zinc-500">Economic Activity</span>
            <span style={{ color }}>{Math.round(hotspot.intensity * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${hotspot.intensity * 100}%`, background: color }}
            />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-zinc-300 text-xs leading-relaxed">{hotspot.news}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ showHotspots, setShowHotspots }) {
  return (
    <div
      className="absolute bottom-6 left-4 z-20 rounded-2xl p-4"
      style={{
        background: "rgba(8,8,8,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        minWidth: 200,
      }}
    >
      <div className="text-zinc-500 text-xs font-bold tracking-wider mb-3" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        LEGEND
      </div>

      <div className="space-y-1.5 mb-4">
        {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
          <div key={sector} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-zinc-400 text-xs">{sector}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/5">
        <button
          onClick={() => setShowHotspots((p) => !p)}
          className="flex items-center gap-2 text-xs transition-all"
          style={{ fontFamily: "JetBrains Mono, monospace", color: showHotspots ? "#c8e000" : "#555" }}
        >
          <div
            className="w-4 h-4 rounded border flex items-center justify-center transition-all"
            style={{
              borderColor: showHotspots ? "#c8e000" : "#333",
              background: showHotspots ? "#c8e000" : "transparent",
            }}
          >
            {showHotspots && <span style={{ color: "#000", fontSize: 9 }}>✓</span>}
          </div>
          News Hotspots
        </button>
      </div>
    </div>
  );
}

// ─── Main Map Screen ──────────────────────────────────────────────────────────
export default function ChicagoMap({ setScreen, setSelectedCompany }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const hotspotMarkersRef = useRef([]);

  const [selectedCompany, setLocalSelected] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  const [showHotspots, setShowHotspots] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load live quotes
  useEffect(() => {
    COMPANY_HQ.forEach(async (co) => {
      const { data } = await fetchQuote(co.id);
      if (data) setQuotes((p) => ({ ...p, [co.id]: { ...MOCK_QUOTES[co.id], ...data } }));
    });
  }, []);

  // Init Mapbox
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-87.6298, 41.8826],
      zoom: 11.5,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.current.on("load", () => {
      // Add 3D building layer
      map.current.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 10,
        paint: {
          "fill-extrusion-color": "#1a1a1a",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.05, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.05, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.7,
        },
      });

      // Custom map style overrides
      map.current.setPaintProperty("water", "fill-color", "#0a0f1a");
      map.current.setPaintProperty("land", "background-color", "#0d0d0d");

      setMapLoaded(true);
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  // Place company markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    COMPANY_HQ.forEach((co) => {
      const q = quotes[co.id] || MOCK_QUOTES[co.id];
      const pos = (q?.pct ?? 0) >= 0;
      const color = SECTOR_COLORS[co.sector] || "#c8e000";

      // Custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: transform 0.2s ease;
      `;

      const pin = document.createElement("div");
      pin.style.cssText = `
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        border: 2px solid rgba(255,255,255,0.2);
        box-shadow: 0 4px 20px ${color}60;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;

      const inner = document.createElement("div");
      inner.style.cssText = `
        transform: rotate(45deg);
        font-size: 10px;
        font-weight: 900;
        color: #000;
        font-family: 'Syne', sans-serif;
        text-align: center;
        line-height: 1;
      `;
      inner.textContent = co.id.slice(0, 3);

      pin.appendChild(inner);

      const label = document.createElement("div");
      label.style.cssText = `
        background: rgba(8,8,8,0.9);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        padding: 2px 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: ${pos ? "#c8e000" : "#ff4444"};
        white-space: nowrap;
        backdrop-filter: blur(8px);
      `;
      label.textContent = `${pos ? "+" : ""}${(q?.pct ?? 0).toFixed(2)}%`;

      el.appendChild(pin);
      el.appendChild(label);

      el.addEventListener("mouseenter", () => {
        pin.style.transform = "rotate(-45deg) scale(1.15)";
        pin.style.boxShadow = `0 8px 30px ${color}90`;
        el.style.transform = "translateY(-4px)";
      });
      el.addEventListener("mouseleave", () => {
        pin.style.transform = "rotate(-45deg) scale(1)";
        pin.style.boxShadow = `0 4px 20px ${color}60`;
        el.style.transform = "translateY(0)";
      });

      el.addEventListener("click", () => {
        setLocalSelected(co);
        setSelectedHotspot(null);
        map.current.flyTo({ center: [co.lng, co.lat], zoom: 14, pitch: 55, duration: 1000 });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([co.lng, co.lat])
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, quotes]);

  // Place hotspot markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    hotspotMarkersRef.current.forEach((m) => m.remove());
    hotspotMarkersRef.current = [];

    if (!showHotspots) return;

    NEWS_HOTSPOTS.forEach((hs) => {
      const color = HOTSPOT_COLORS[hs.type] || "#888";
      const size = 20 + hs.intensity * 30;

      const el = document.createElement("div");
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color}25;
        border: 1.5px solid ${color}60;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;

      // Pulsing ring
      const ring = document.createElement("div");
      ring.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 1px solid ${color}40;
        animation: hsRing 2s ease-out infinite;
      `;

      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${color};
      `;

      el.appendChild(ring);
      el.appendChild(dot);

      el.addEventListener("mouseenter", () => {
        el.style.background = `${color}40`;
        el.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.background = `${color}25`;
        el.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => {
        setSelectedHotspot(hs);
        setLocalSelected(null);
        map.current.flyTo({ center: [hs.lng, hs.lat], zoom: 13, duration: 800 });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([hs.lng, hs.lat])
        .addTo(map.current);

      hotspotMarkersRef.current.push(marker);
    });
  }, [mapLoaded, showHotspots]);

  const handleOpenCompany = useCallback((id) => {
    setSelectedCompany(id);
    setScreen("companies");
  }, [setScreen, setSelectedCompany]);

  return (
    <div className="fade-up" style={{ height: "calc(100vh - 116px)", position: "relative" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Chicago HQ Map</h1>
          <p className="text-zinc-500 mono text-sm mt-1">
            Company headquarters · Economic activity · Real-time signals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mono text-xs text-zinc-500 border border-white/8 rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" />
            {COMPANY_HQ.length} Companies · {NEWS_HOTSPOTS.length} Hotspots
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: "calc(100% - 80px)", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Pulse ring animation */}
        <style>{`
          @keyframes hsRing {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .mapboxgl-ctrl-group {
            background: rgba(8,8,8,0.9) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 10px !important;
          }
          .mapboxgl-ctrl-group button {
            background: transparent !important;
            color: #888 !important;
          }
          .mapboxgl-ctrl-group button:hover { color: #fff !important; }
          .mapboxgl-ctrl-attrib { display: none !important; }
          .mapboxgl-canvas { border-radius: 14px; }
        `}</style>

        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

        {/* Selected company card */}
        {selectedCompany && (
          <CompanyCard
            company={selectedCompany}
            quote={quotes[selectedCompany.id] || MOCK_QUOTES[selectedCompany.id]}
            onClose={() => setLocalSelected(null)}
            onOpenCompany={handleOpenCompany}
          />
        )}

        {/* Selected hotspot card */}
        {selectedHotspot && (
          <HotspotCard
            hotspot={selectedHotspot}
            onClose={() => setSelectedHotspot(null)}
          />
        )}

        {/* Legend */}
        <Legend showHotspots={showHotspots} setShowHotspots={setShowHotspots} />

        {/* Quick stats bar */}
        <div
          className="absolute bottom-6 right-16 z-20 rounded-2xl px-4 py-3 flex items-center gap-5"
          style={{
            background: "rgba(8,8,8,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {["BA", "CME", "CBOE", "UAL"].map((id) => {
            const q = quotes[id] || MOCK_QUOTES[id];
            const pos = (q?.pct ?? 0) >= 0;
            return (
              <div
                key={id}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const co = COMPANY_HQ.find((c) => c.id === id);
                  if (co) {
                    setLocalSelected(co);
                    setSelectedHotspot(null);
                    map.current?.flyTo({ center: [co.lng, co.lat], zoom: 14, pitch: 55, duration: 800 });
                  }
                }}
              >
                <span className="text-white font-black text-xs mono">{id}</span>
                <span className={`text-xs mono ${pos ? "text-lime-400" : "text-red-400"}`}>
                  {pos ? "+" : ""}{(q?.pct ?? 0).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
