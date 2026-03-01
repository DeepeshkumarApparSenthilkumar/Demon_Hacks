import React, { useState, useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import './GoogleMapsComponent.css';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
};

function GoogleMapsComponent({ tour, selectedStopIndex, onStopSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStops, setFilteredStops] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [infoWindowStop, setInfoWindowStop] = useState(null);

  // Calculate center of tour
  const center = tour.stops && tour.stops.length > 0
    ? {
      lat: tour.stops.reduce((sum, s) => sum + s.lat, 0) / tour.stops.length,
      lng: tour.stops.reduce((sum, s) => sum + s.lng, 0) / tour.stops.length,
    }
    : { lat: 41.8839, lng: -87.6233 };

  // Create polyline path
  const polylinePath = tour.stops ? tour.stops.map(stop => ({
    lat: stop.lat,
    lng: stop.lng,
  })) : [];

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

  const handleStopClick = (stop, index) => {
    onStopSelect(index);
    setInfoWindowStop(index);
    setSearchQuery('');
    setShowSearch(false);
  };

  const getMarkerIcon = (index) => {
    if (index === selectedStopIndex) {
      return {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z',
        fillColor: '#ea4335',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5,
        anchor: { x: 12, y: 20 },
      };
    }
    return {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z',
      fillColor: '#4285f4',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.2,
      anchor: { x: 12, y: 20 },
    };
  };

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDummy'; // Replace with your actual key

  return (
    <div className="google-maps-component">
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
            {filteredStops.map((stop) => {
              const stopIndex = tour.stops.findIndex(s => s.id === stop.id);
              return (
                <div
                  key={stop.id}
                  className={`search-result ${stopIndex === selectedStopIndex ? 'active' : ''}`}
                  onClick={() => handleStopClick(stop, stopIndex)}
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

      {/* Google Map */}
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          options={{
            styles: [
              {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {/* Polyline for route */}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              options={{
                strokeColor: '#4285f4',
                strokeOpacity: 0.7,
                strokeWeight: 3,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: 'M 0,-1 0,1',
                      strokeOpacity: 1,
                      scale: 4,
                    },
                    offset: '0',
                    repeat: '20px',
                  },
                ],
              }}
            />
          )}

          {/* Markers for each stop */}
          {tour.stops &&
            tour.stops.map((stop, idx) => (
              <Marker
                key={stop.id}
                position={{ lat: stop.lat, lng: stop.lng }}
                icon={getMarkerIcon(idx)}
                onClick={() => {
                  onStopSelect(idx);
                  setInfoWindowStop(idx);
                }}
                label={{
                  text: (idx + 1).toString(),
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {infoWindowStop === idx && (
                  <InfoWindow
                    onCloseClick={() => setInfoWindowStop(null)}
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -40),
                    }}
                  >
                    <div className="info-window-content">
                      <h3>{stop.name}</h3>
                      <p className="categories">{stop.categories.join(', ')}</p>
                      <p className="description">{stop.short_fact}</p>
                      <div className="info-meta">
                        <span>⏱️ {stop.visit_minutes} min</span>
                        <span className={`crowd crowd-${stop.crowd_level.toLowerCase()}`}>
                          👥 {stop.crowd_level}
                        </span>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      </LoadScript>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker current">🔴</span>
          <span>Current Stop</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker">🔵</span>
          <span>Other Stops</span>
        </div>
      </div>

      {/* API Key Warning */}
      {apiKey === 'AIzaSyDummy' && (
        <div className="api-warning">
          ⚠️ Add REACT_APP_GOOGLE_MAPS_API_KEY to .env.local
        </div>
      )}
    </div>
  );
}

export default GoogleMapsComponent;
