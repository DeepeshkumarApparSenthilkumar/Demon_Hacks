import { useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';

const RISK_COLORS = {
  1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444', 5: '#a855f7',
};

// Score a route by checking proximity to pollution sensors
const scoreRoute = (routeCoords, stations) => {
  if (!stations || stations.length === 0) return 3;
  
  let totalExposure = 0;
  let sampleCount = 0;

  // Sample every 5th point to keep things fast
  for (let i = 0; i < routeCoords.length; i += 5) {
    const [lng, lat] = routeCoords[i];
    const point = turf.point([lng, lat]);
    let minDist = Infinity;
    let nearestRisk = 1;

    stations.forEach(s => {
      const sensor = turf.point([parseFloat(s.lng), parseFloat(s.lat)]);
      const dist = turf.distance(point, sensor, { units: 'miles' });
      if (dist < minDist) {
        minDist = dist;
        nearestRisk = s.risk;
      }
    });

    // Weight nearby sensors more heavily (within 0.3 miles)
    const weight = minDist < 0.3 ? 2 : 1;
    totalExposure += nearestRisk * weight;
    sampleCount += weight;
  }

  return sampleCount > 0 ? (totalExposure / sampleCount).toFixed(2) : 3;
};

// Geocode an address using OpenStreetMap's Nominatim (free, no key needed)
const geocode = async (address) => {
  const query = encodeURIComponent(address + ', Chicago, IL');
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=us`
  );
  const data = await res.json();
  if (!data || data.length === 0) throw new Error(`Could not find: "${address}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
};

export default function RoutePlanner({ stations }) {
  const map = useMap();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');
  const routeLayersRef = useRef([]);

  const clearRoutes = () => {
    routeLayersRef.current.forEach(l => {
      try { map.removeLayer(l); } catch (e) {}
    });
    routeLayersRef.current = [];
  };

  const planRoute = async () => {
    if (!start.trim() || !end.trim()) {
      setError('Please enter both start and end locations.');
      return;
    }

    setLoading(true);
    setError('');
    setComparison(null);
    clearRoutes();

    try {
      // ── Geocode both addresses ──
      const [startCoords, endCoords] = await Promise.all([
        geocode(start),
        geocode(end),
      ]);

      // ── Fetch routes from OSRM (free, no API key needed) ──
      const osrmUrl =
        `https://router.project-osrm.org/route/v1/foot/` +
        `${startCoords.lng},${startCoords.lat};` +
        `${endCoords.lng},${endCoords.lat}` +
        `?overview=full&geometries=geojson&alternatives=true`;

      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        setError('No routes found. Try addresses closer to Chicago.');
        return;
      }

      // ── Score each route for pollution exposure ──
      const scoredRoutes = data.routes.map(route => ({
        coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        rawCoords: route.geometry.coordinates,
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMin: Math.round(route.duration / 60),
        exposure: parseFloat(scoreRoute(route.geometry.coordinates, stations)),
      }));

      // fastest = first route (OSRM returns by speed)
      const fastest = scoredRoutes[0];

      // cleanest = lowest exposure score
      const cleanest = scoredRoutes.reduce((a, b) =>
        a.exposure < b.exposure ? a : b
      );

      const isSameRoute = fastest === cleanest;
      const exposureSaved = isSameRoute
        ? 0
        : Math.max(0, ((fastest.exposure - cleanest.exposure) / fastest.exposure) * 100).toFixed(0);

      // ── Draw fastest route (red/orange) ──
      const fastestLayer = L.polyline(fastest.coords, {
        color: '#f87171',
        weight: 5,
        opacity: 0.85,
        dashArray: isSameRoute ? '8, 6' : null,
      })
        .bindPopup(`<strong style="color:#f87171">⚡ Fastest Route</strong><br/>${fastest.distanceKm} km · ${fastest.durationMin} min<br/><span style="color:#9ca3af;font-size:12px">Exposure score: ${fastest.exposure}</span>`)
        .addTo(map);

      routeLayersRef.current.push(fastestLayer);

      // ── Draw cleanest route (green) ──
      if (!isSameRoute) {
        const cleanestLayer = L.polyline(cleanest.coords, {
          color: '#34d399',
          weight: 5,
          opacity: 0.85,
        })
          .bindPopup(`<strong style="color:#34d399">🌿 Clean Route</strong><br/>${cleanest.distanceKm} km · ${cleanest.durationMin} min<br/><span style="color:#34d399;font-size:12px">↓ ${exposureSaved}% less exposure</span>`)
          .addTo(map);
        routeLayersRef.current.push(cleanestLayer);
      }

      // ── Add start / end markers ──
      const startMarker = L.circleMarker([startCoords.lat, startCoords.lng], {
        radius: 9, fillColor: '#60a5fa', color: '#fff', weight: 2, fillOpacity: 1,
      }).bindTooltip('📍 Start').addTo(map);

      const endMarker = L.circleMarker([endCoords.lat, endCoords.lng], {
        radius: 9, fillColor: '#a78bfa', color: '#fff', weight: 2, fillOpacity: 1,
      }).bindTooltip('🏁 End').addTo(map);

      routeLayersRef.current.push(startMarker, endMarker);

      // Fit map to show the cleanest route
      map.fitBounds(L.latLngBounds(cleanest.coords), { padding: [60, 60] });

      setComparison({
        fastest: { ...fastest, isSame: isSameRoute },
        cleanest,
        exposureSaved,
        isSameRoute,
      });

    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') planRoute();
  };

  const panelStyle = {
    position: 'fixed',
    top: 100,
    right: 20,
    zIndex: 1500,
    width: 300,
    background: 'rgba(6, 8, 15, 0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    marginBottom: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: '#e8eaf0',
    fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const getExposureColor = (score) => {
    if (score <= 1.5) return '#22c55e';
    if (score <= 2.5) return '#eab308';
    if (score <= 3.5) return '#f97316';
    if (score <= 4.5) return '#ef4444';
    return '#a855f7';
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
          🗺️ Route Planner
        </div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          Find your lowest-pollution path
        </div>
      </div>

      {/* Inputs */}
      <input
        style={inputStyle}
        placeholder="Start (e.g. Pilsen, Chicago)"
        value={start}
        onChange={e => setStart(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
      <input
        style={inputStyle}
        placeholder="End (e.g. The Loop, Chicago)"
        value={end}
        onChange={e => setEnd(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 12, color: '#fca5a5',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '8px 12px',
          marginBottom: 10,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Button */}
      <button
        onClick={planRoute}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading
            ? 'rgba(52,211,153,0.3)'
            : 'linear-gradient(135deg, #34d399, #059669)',
          border: 'none',
          borderRadius: 10,
          color: loading ? '#6b7280' : '#022c22',
          fontWeight: 700,
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.02em',
        }}
      >
        {loading ? '⏳ Calculating routes...' : '🌿 Find Clean Route'}
      </button>

      {/* Clear button */}
      {comparison && (
        <button
          onClick={() => { clearRoutes(); setComparison(null); setStart(''); setEnd(''); }}
          style={{
            width: '100%', marginTop: 8, padding: '8px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#6b7280',
            fontSize: 12, fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
          }}
        >
          ✕ Clear routes
        </button>
      )}

      {/* ── Route Comparison ── */}
      {comparison && (
        <div style={{ marginTop: 16, animation: 'fadeIn 0.4s ease' }}>
          
          {/* Exposure saved banner */}
          {!comparison.isSameRoute && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(5,150,105,0.1))',
              border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>
                ↓ {comparison.exposureSaved}%
              </div>
              <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 2 }}>
                less pollution on the clean route
              </div>
            </div>
          )}

          {comparison.isSameRoute && (
            <div style={{
              background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              fontSize: 12, color: '#93c5fd', textAlign: 'center',
            }}>
              ℹ️ Only one route found — this is already the best path available.
            </div>
          )}

          {/* Route cards */}
          {[
            { label: '⚡ Fastest', color: '#f87171', data: comparison.fastest },
            { label: '🌿 Cleanest', color: '#34d399', data: comparison.cleanest },
          ].map(({ label, color, data }) => (
            <div key={label} style={{
              background: `${color}0d`,
              border: `1px solid ${color}30`,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                <span>📏 {data.distanceKm} km</span>
                <span>⏱ {data.durationMin} min</span>
              </div>
              <div style={{
                marginTop: 6, display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: '#6b7280',
              }}>
                Exposure:
                <div style={{
                  flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(data.exposure / 5) * 100}%`,
                    background: getExposureColor(data.exposure),
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ color: getExposureColor(data.exposure), fontWeight: 600 }}>
                  {data.exposure}/5
                </span>
              </div>
            </div>
          ))}

          <div style={{ fontSize: 10, color: '#374151', textAlign: 'center', marginTop: 8 }}>
            Exposure scored using OpenAQ live PM2.5 data
          </div>
        </div>
      )}
    </div>
  );
}
