import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';

// Color for each risk level 1-5
const RISK_COLORS = {
  1: '#22c55e',   // Green — Good
  2: '#eab308',   // Yellow — Moderate
  3: '#f97316',   // Orange — Sensitive
  4: '#ef4444',   // Red — Unhealthy
  5: '#a855f7',   // Purple — Hazardous
};

const RISK_LABELS = {
  1: 'Good',
  2: 'Moderate',
  3: 'Sensitive Groups',
  4: 'Unhealthy',
  5: 'Hazardous',
};

export default function HeatmapLayer({ stations }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    // Clear previous layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    if (!stations || stations.length === 0) return;

    // ── Step 1: Build GeoJSON points from sensor data ──
    const points = turf.featureCollection(
      stations.map(s =>
        turf.point(
          [parseFloat(s.lng), parseFloat(s.lat)],
          { risk: s.risk, pm25: parseFloat(s.pm25) }
        )
      )
    );

    // ── Step 2: Interpolate across Chicago using Turf IDW ──
    // This is the AI/ML piece — estimates pollution between sensors
    let grid;
    try {
      grid = turf.interpolate(points, 0.8, {
        gridType: 'hex',
        property: 'risk',
        units: 'miles',
        weight: 3,  // Higher = nearby sensors have more influence
      });
    } catch (e) {
      console.warn('Interpolation failed, using point markers only:', e);
    }

    // ── Step 3: Draw interpolated hex grid ──
    if (grid) {
      grid.features.forEach(feature => {
        const rawRisk = feature.properties.risk;
        const risk = Math.min(5, Math.max(1, Math.round(rawRisk)));
        const color = RISK_COLORS[risk];

        const layer = L.geoJSON(feature, {
          style: {
            fillColor: color,
            fillOpacity: 0.22,
            color: color,
            weight: 0.8,
            opacity: 0.4,
          },
        }).addTo(map);

        layersRef.current.push(layer);
      });
    }

    // ── Step 4: Draw sensor markers with rich tooltips ──
    stations.forEach(s => {
      const color = RISK_COLORS[s.risk];
      const riskLabel = RISK_LABELS[s.risk];

      // Outer glow ring
      const glowMarker = L.circleMarker([parseFloat(s.lat), parseFloat(s.lng)], {
        radius: 16,
        fillColor: color,
        fillOpacity: 0.12,
        color: color,
        weight: 1,
        opacity: 0.3,
      }).addTo(map);

      // Main sensor dot
      const marker = L.circleMarker([parseFloat(s.lat), parseFloat(s.lng)], {
        radius: 7,
        fillColor: color,
        fillOpacity: 1,
        color: '#fff',
        weight: 1.5,
        opacity: 1,
      });

      // Rich tooltip showing sensor details
      marker.bindTooltip(`
        <div style="min-width: 160px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #fff;">
            📍 ${s.id}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
            <span style="color: ${color}; font-weight: 600; font-size: 13px;">${riskLabel}</span>
          </div>
          <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">
            PM2.5: <span style="color: #e8eaf0; font-weight: 500;">${s.pm25} μg/m³</span>
          </div>
          <div style="color: #4b5563; font-size: 10px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
            Source: OpenAQ · Live
          </div>
        </div>
      `, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });

      marker.addTo(map);
      layersRef.current.push(glowMarker, marker);
    });

    // Cleanup on unmount or data change
    return () => {
      layersRef.current.forEach(layer => {
        try { map.removeLayer(layer); } catch (e) {}
      });
      layersRef.current = [];
    };
  }, [stations, map]);

  return null;
}
