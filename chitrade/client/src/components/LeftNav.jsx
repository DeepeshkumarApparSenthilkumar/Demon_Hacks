const NAV_ITEMS = [
  { id: "dashboard",   icon: "⬡", label: "Dashboard"    },
  { id: "companies",   icon: "◈", label: "Companies"    },
  { id: "map",         icon: "⊕", label: "Chicago Map"  },
  { id: "indices",     icon: "◉", label: "Indices"      },
  { id: "news",        icon: "◫", label: "News"         },
  { id: "aiAssistant", icon: "◎", label: "AI Assistant" },
  { id: "risk",        icon: "◬", label: "Risk"         },
];

export default function LeftNav({ screen, setScreen }) {
  return (
    <nav
      className="fixed left-0 top-12 bottom-0 w-16 flex flex-col items-center py-5 gap-1 z-40 border-r border-white/5"
      style={{ background: "rgba(6,6,6,0.88)", backdropFilter: "blur(16px)" }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = screen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-base transition-all duration-200 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
            style={
              active
                ? { background: "#c8e000", color: "#000" }
                : { color: "#444" }
            }
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#444"; }}
          >
            {item.icon}
            {/* Tooltip */}
            <span
              className="absolute left-12 bg-zinc-900 border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 mono"
              role="tooltip"
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
