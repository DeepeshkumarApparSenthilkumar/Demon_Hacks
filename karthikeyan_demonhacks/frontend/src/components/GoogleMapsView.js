import React, { useState, useCallback, useRef } from 'react';
import './GoogleMapsView.css';

function GoogleMapsView({ tour, selectedStopIndex, onStopSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStops, setFilteredStops] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef(null);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = tour.stops.filter(stop =>
        stop.name.toLowerCase().includes(query.toLowerCase()) ||
        stop.categories.some(cat =>
          cat.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredStops(filtered);
      setShowSearch(true);
    } else {
      setFilteredStops([]);
      setShowSearch(false);
    }
  }, [tour.stops]);

  const handleStopClick = (stop) => {
    const index = tour.stops.findIndex(s => s.id === stop.id);
    onStopSelect(index);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Create mock map using canvas-like visualization
  const mapCenter = tour.stops && tour.stops.length > 0
    ? { lat: tour.stops[0].lat, lng: tour.stops[0].lng }
    : { lat: 41.8839, lng: -87.6233 };

  return (
    <div className="google-maps-view">
      {/* Search Bar */}
      <div className="maps-search-container">
        <div className="search-box">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search stops or interests..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => handleSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && filteredStops.length > 0 && (
          <div className="search-dropdown">
            {filteredStops.map((stop, idx) => {
              const stopIndex = tour.stops.findIndex(s => s.id === stop.id);
              return (
                <div
                  key={stop.id}
                  className={`search-result ${stopIndex === selectedStopIndex ? 'active' : ''}`}
                  onClick={() => handleStopClick(stop)}
                >
                  <div className="result-marker">{stopIndex + 1}</div>
                  <div className="result-details">
                    <h4>{stop.name}</h4>
                    <p>{stop.categories.join(' • ')}</p>
                  </div>
                  <div className="result-distance">
                    {stop.visit_minutes}m
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showSearch && searchQuery && filteredStops.length === 0 && (
          <div className="search-dropdown">
            <div className="no-results">No stops found for "{searchQuery}"</div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="maps-container" ref={mapRef}>
        <div className="map-placeholder">
          <div className="map-content">
            <h2>🗺️ Interactive Tour Map</h2>
            <p>Route visualization with {tour.stops?.length || 0} stops</p>
            
            <div className="stops-overview">
              {tour.stops && tour.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className={`overview-stop ${idx === selectedStopIndex ? 'highlighted' : ''}`}
                  onClick={() => onStopSelect(idx)}
                >
                  <div className="stop-marker">{idx + 1}</div>
                  <div className="stop-title">{stop.name}</div>
                </div>
              ))}
            </div>

            <div className="map-note">
              📍 Integrate with your own Google Maps API key in environment variables
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="map-controls">
        <button className="map-control-btn" title="Current location">
          📍
        </button>
        <button className="map-control-btn" title="Zoom in">
          🔍+
        </button>
        <button className="map-control-btn" title="Zoom out">
          🔍−
        </button>
      </div>

      {/* Mini Legend */}
      <div className="map-legend-mini">
        <div className="legend-row">
          <span className="legend-marker current">●</span>
          <span>Current Stop</span>
        </div>
        <div className="legend-row">
          <span className="legend-marker">●</span>
          <span>Other Stops</span>
        </div>
      </div>
    </div>
  );
}

export default GoogleMapsView;
