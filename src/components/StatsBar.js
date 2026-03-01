export default function StatsBar({ stations }) {
  if (!stations || stations.length === 0) return null;

  // Calculate stats from live sensor data
  const avgPm25 = (
    stations.reduce((sum, s) => sum + parseFloat(s.pm25), 0) / stations.length
  ).toFixed(1);

  const maxStation = stations.reduce((a, b) =>
    parseFloat(a.pm25) > parseFloat(b.pm25) ? a : b
  );

  const highRiskCount = stations.filter(s => s.risk >= 3).length;
  const highRiskPct = Math.round((highRiskCount / stations.length) * 100);

  const getAvgColor = (pm25) => {
    const v = parseFloat(pm25);
    if (v <= 12) return '#22c55e';
    if (v <= 35) return '#eab308';
    if (v <= 55) return '#f97316';
    if (v <= 150) return '#ef4444';
    return '#a855f7';
  };

  const stats = [
    {
      label: 'Avg PM2.5',
      value: `${avgPm25} μg/m³`,
      color: getAvgColor(avgPm25),
      icon: '📊',
    },
    {
      label: 'Active Sensors',
      value: stations.length,
      color: '#60a5fa',
      icon: '📡',
    },
    {
      label: 'High Risk Zones',
      value: `${highRiskCount} (${highRiskPct}%)`,
      color: highRiskCount > 3 ? '#ef4444' : '#f97316',
      icon: '⚠️',
    },
    {
      label: 'Worst Area',
      value: `${maxStation.pm25} μg/m³`,
      sub: maxStation.id.length > 22 ? maxStation.id.slice(0, 22) + '…' : maxStation.id,
      color: '#a855f7',
      icon: '🔴',
    },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 56,
      left: 0,
      right: 0,
      zIndex: 1400,
      background: 'rgba(6, 8, 15, 0.80)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'stretch',
      height: 48,
      overflow: 'hidden',
    }}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 20px',
            borderRight: index < stats.length - 1
              ? '1px solid rgba(255,255,255,0.06)'
              : 'none',
          }}
        >
          <span style={{ fontSize: 16 }}>{stat.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: stat.color, lineHeight: 1.2 }}>
              {stat.value}
            </div>
            {stat.sub && (
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>
                {stat.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
