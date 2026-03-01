import React from 'react';
import './TourMap.css';

function TourMap({ tour, selectedStopIndex }) {
  // For production, use react-leaflet with a proper map library

  return (
    <div className="tour-map-container">
      {tour.stops && tour.stops.length > 0 ? (
        <div className="map-view">
          {/* Fallback: Show ASCII map representation */}
          <div className="map-placeholder">
            <div className="map-info">
              <h3>Interactive Map</h3>
              <div className="route-preview">
                {tour.stops.map((stop, idx) => (
                  <div key={stop.id} className="map-point">
                    <span className={`point-number ${idx === selectedStopIndex ? 'active' : ''}`}>
                      {idx + 1}
                    </span>
                    <span className="point-name">{stop.name}</span>
                  </div>
                ))}
              </div>
              <p className="map-note">
                📍 Route with {tour.stops.length} stops | Distance: {tour.total_distance_km} km
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="map-placeholder">
          <p>No tour data available</p>
        </div>
      )}
    </div>
  );
}

export default TourMap;
