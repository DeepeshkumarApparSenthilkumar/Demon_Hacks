import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './InteractiveMap.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function InteractiveMap({ tour, selectedStopIndex, onStopSelect }) {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStops, setFilteredStops] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (searchQuery && tour.stops) {
      const filtered = tour.stops.filter(stop =>
        stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.categories.some(cat =>
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredStops(filtered);
    } else {
      setFilteredStops([]);
    }
  }, [searchQuery, tour.stops]);

  const handleStopSelect = (stop) => {
    const index = tour.stops.findIndex(s => s.id === stop.id);
    onStopSelect(index);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Calculate center of all stops
  const center = tour.stops && tour.stops.length > 0
    ? [tour.stops[0].lat, tour.stops[0].lng]
    : [41.8839, -87.6233]; // Chicago default

  // Create polyline coordinates
  const polylineCoords = tour.stops ? tour.stops.map(stop => [stop.lat, stop.lng]) : [];

  // Custom marker colors
  const getMarkerColor = (index) => {
    if (index === selectedStopIndex) {
      return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
    }
    return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
  };

  const customIconFactory = (url) => {
    return new L.Icon({
      iconUrl: url,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  return (
    <div className="interactive-map-wrapper">
      <div className="map-search-bar">
        <input
          type="text"
          placeholder="🔍 Search stops by name or interest..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearch(true);
          }}
          onFocus={() => setShowSearch(true)}
          className="search-input"
        />
        {showSearch && filteredStops.length > 0 && (
          <div className="search-results">
            {filteredStops.map((stop, idx) => (
              <div
                key={stop.id}
                className="search-result-item"
                onClick={() => handleStopSelect(stop)}
              >
                <span className="result-number">
                  {tour.stops.findIndex(s => s.id === stop.id) + 1}
                </span>
                <div className="result-info">
                  <h4>{stop.name}</h4>
                  <p>{stop.categories.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {showSearch && searchQuery && filteredStops.length === 0 && (
          <div className="search-results">
            <div className="no-results">No stops found</div>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw route line */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#667eea"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        {/* Markers for each stop */}
        {tour.stops &&
          tour.stops.map((stop, idx) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={customIconFactory(getMarkerColor(idx))}
              eventHandlers={{
                click: () => onStopSelect(idx),
              }}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <h3>Stop {stop.order}</h3>
                  <h4>{stop.name}</h4>
                  <p className="categories">{stop.categories.join(', ')}</p>
                  <p className="fact">{stop.short_fact}</p>
                  <div className="popup-meta">
                    <span>⏱️ {stop.visit_minutes} min</span>
                    <span className={`crowd crowd-${stop.crowd_level.toLowerCase()}`}>
                      👥 {stop.crowd_level}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot selected">🔴</span>
          <span>Current Stop</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot">🔵</span>
          <span>Other Stops</span>
        </div>
        <div className="legend-item">
          <span className="legend-line">━━━</span>
          <span>Route</span>
        </div>
      </div>
    </div>
  );
}

export default InteractiveMap;
