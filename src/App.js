import HealthProfile from './components/HealthProfile';
import AirChat       from './components/AirChat';
import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchChicagoAirQuality } from './services/airQuality';
import HeatmapLayer from './components/HeatmapLayer';
import RoutePlanner from './components/RoutePlanner';
import Legend from './components/Legend';
import StatsBar from './components/StatsBar';



// REPLACE THIS WITH YOUR MAPBOX TOKEN
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

const MAPBOX_STYLE = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

export default function App() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchChicagoAirQuality();
      setStations(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch sensor data. Retrying...');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ── Top Header Bar ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
        background: 'rgba(6, 8, 15, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #34d399, #06b6d4)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🌬️</div>
          <div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700, fontSize: 15,
              letterSpacing: '0.05em',
              color: '#fff',
            }}>AirGuardian</div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Chicago Air Quality
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#fbbf24',
                animation: 'pulse 1.2s infinite',
              }} />
              <span style={{ fontSize: 12, color: '#fbbf24', fontFamily: 'Space Mono, monospace' }}>
                Fetching sensors...
              </span>
            </>
          ) : error ? (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
              <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
            </>
          ) : (
            <>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 8px rgba(52,211,153,0.8)',
                animation: 'pulse 3s infinite',
              }} />
              <span style={{ fontSize: 12, color: '#34d399', fontFamily: 'Space Mono, monospace' }}>
                LIVE · {stations.length} sensors active
              </span>
            </>
          )}
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4b5563', fontFamily: 'Space Mono, monospace' }}>
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={loadData}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#9ca3af',
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = '#9ca3af'}
        >
          ↻ Refresh
        </button>
      </header>

      {/* ── Stats Bar ── */}
      {!loading && stations.length > 0 && (
        <StatsBar stations={stations} />
      )}

      {/* ── Map ── */}
      <div style={{ paddingTop: 56, height: '100vh' }}>
        <MapContainer
          center={[41.8827, -87.6233]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url={MAPBOX_STYLE}
            attribution='© <a href="https://mapbox.com">Mapbox</a>'
            tileSize={512}
            zoomOffset={-1}
          />

          {stations.length > 0 && (
            <HeatmapLayer stations={stations} />
          )}

          <RoutePlanner stations={stations} />
        </MapContainer>
      </div>

      {/* ── Legend ── */}
      <Legend />
      <HealthProfile stations={stations} profile={profile} onProfileSave={setProfile} />
      <AirChat stations={stations} profile={profile} />
      

      {/* ── Loading Overlay ── */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(6, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20,
        }}>
          <div style={{
            width: 48, height: 48,
            border: '3px solid rgba(52,211,153,0.2)',
            borderTopColor: '#34d399',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
              Loading AirGuardian
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Fetching live sensor data from OpenAQ...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
