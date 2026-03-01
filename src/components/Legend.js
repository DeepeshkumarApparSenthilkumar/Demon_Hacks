export default function Legend() {
  const levels = [
    { color: '#22c55e', label: 'Good', range: '0–12 μg/m³' },
    { color: '#eab308', label: 'Moderate', range: '12–35 μg/m³' },
    { color: '#f97316', label: 'Sensitive Groups', range: '35–55 μg/m³' },
    { color: '#ef4444', label: 'Unhealthy', range: '55–150 μg/m³' },
    { color: '#a855f7', label: 'Hazardous', range: '150+ μg/m³' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: 20,
      zIndex: 1500,
      background: 'rgba(6, 8, 15, 0.90)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14,
      padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: 190,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#9ca3af',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          PM2.5 Air Quality Index
        </div>
        <div style={{ fontSize: 10, color: '#4b5563' }}>
          Particulate Matter (Fine Particles)
        </div>
      </div>

      {/* Legend items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {levels.map((level) => (
          <div
            key={level.label}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Color dot */}
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: level.color,
              boxShadow: `0 0 6px ${level.color}80`,
              flexShrink: 0,
            }} />
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, gap: 8 }}>
              <span style={{ fontSize: 12, color: '#e8eaf0', fontWeight: 500 }}>
                {level.label}
              </span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {level.range}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'rgba(255,255,255,0.06)',
        margin: '12px 0 10px',
      }} />

      {/* Source tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: '#4b5563' }}>Source</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 4px rgba(52,211,153,0.8)',
          }} />
          <span style={{
            fontSize: 10,
            color: '#34d399',
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            OpenAQ · Live
          </span>
        </div>
      </div>
    </div>
  );
}
