import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.css';

function MapboxMap({ tour, selectedStopIndex, onStopSelect }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [hoveredStop, setHoveredStop] = useState(null);
  const [showRoute, setShowRoute] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.warn('Mapbox token not found. Please add REACT_APP_MAPBOX_TOKEN to .env.local');
      // Show dummy map
      return;
    }

    if (map.current) return;

    // Calculate bounds
    if (tour.stops && tour.stops.length > 0) {
      const lats = tour.stops.map(s => s.lat);
      const lngs = tour.stops.map(s => s.lng);
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 13,
      });

      // Add route line
      if (tour.stops.length > 1) {
        map.current.on('load', () => {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: tour.stops.map(s => [s.lng, s.lat]),
              },
            },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#0066ff',
              'line-width': 3,
              'line-opacity': 0.7,
            },
          });

          // Add markers
          tour.stops.forEach((stop, idx) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = `<div class="marker-inner" style="background: ${idx === selectedStopIndex ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}">${idx + 1}</div>`;
            
            el.addEventListener('click', () => {
              onStopSelect(idx);
            });

            el.addEventListener('mouseenter', () => {
              setHoveredStop(idx);
            });

            el.addEventListener('mouseleave', () => {
              setHoveredStop(null);
            });

            new mapboxgl.Marker(el)
              .setLngLat([stop.lng, stop.lat])
              .addTo(map.current);
          });
        });
      }

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }), 'top-right');
    }

    return () => {
      // Cleanup
    };
  }, [tour, selectedStopIndex, onStopSelect]);

  return (
    <div className="mapbox-container">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      <div className="map-controls">
        <button
          className={`control-btn ${showRoute ? 'active' : ''}`}
          onClick={() => setShowRoute(!showRoute)}
          title="Toggle route visibility"
        >
          🛤️
        </button>
      </div>

      {!process.env.REACT_APP_MAPBOX_TOKEN && (
        <div className="api-warning">
          ⚠️ Add REACT_APP_MAPBOX_TOKEN to .env.local
        </div>
      )}
    </div>
  );
}

export default MapboxMap;
