import React from 'react';
import './StopDetails.css';

function StopDetails({ stop, stopIndex, totalStops }) {
  if (!stop) return null;

  return (
    <div className="stop-details-card">
      <div className="stop-header">
        <div className="stop-badge">
          Stop {stopIndex + 1} of {totalStops}
        </div>
        <h2>{stop.name}</h2>
      </div>

      <div className="stop-tags">
        {stop.categories.map(category => (
          <span key={category} className="tag">
            {category}
          </span>
        ))}
      </div>

      <div className="stop-description">
        <h3>About this place</h3>
        <p>{stop.description}</p>
        <p className="fact">{stop.short_fact}</p>
      </div>

      <div className="stop-meta">
        <div className="meta-item">
          <span className="meta-label">⏱️ Visit time</span>
          <span className="meta-value">{stop.visit_minutes} min</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">👥 Crowds</span>
          <span className={`crowd-level crowd-${stop.crowd_level.toLowerCase()}`}>
            {stop.crowd_level}
          </span>
        </div>
      </div>

      {stop.transition_to_next && (
        <div className="transition-box">
          <h3>⬇️ Next up</h3>
          <p>{stop.transition_to_next}</p>
        </div>
      )}
    </div>
  );
}

export default StopDetails;
