import React, { useState } from 'react';
import './ImprovedStopsList.css';

function ImprovedStopsList({ stops, selectedStopIndex, onStopSelect }) {
  const [expandedStop, setExpandedStop] = useState(selectedStopIndex);

  const currentStop = stops[selectedStopIndex];

  return (
    <div className="improved-stops-container">
      {/* Active Stop Card */}
      <div className="active-stop-card">
        <div className="active-stop-number">{selectedStopIndex + 1}</div>
        <div className="active-stop-info">
          <h2>{currentStop.name}</h2>
          <div className="stop-tags">
            {currentStop.categories.map(cat => (
              <span key={cat} className="tag">{cat}</span>
            ))}
          </div>
          <p className="stop-description">{currentStop.description}</p>
          <div className="stop-stats">
            <div className="stat">
              <span className="stat-label">⏱️ Duration</span>
              <span className="stat-value">{currentStop.visit_minutes} min</span>
            </div>
            <div className="stat">
              <span className="stat-label">👥 Crowd</span>
              <span className={`stat-value crowd-${currentStop.crowd_level.toLowerCase()}`}>
                {currentStop.crowd_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transition to Next */}
      {currentStop.transition_to_next && (
        <div className="transition-card">
          <div className="transition-icon">↓</div>
          <p className="transition-text">{currentStop.transition_to_next}</p>
        </div>
      )}

      {/* All Stops Carousel */}
      <div className="stops-carousel">
        <h3 className="carousel-title">All {stops.length} Stops</h3>
        <div className="carousel-container">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className={`carousel-card ${idx === selectedStopIndex ? 'active' : ''}`}
              onClick={() => {
                onStopSelect(idx);
                setExpandedStop(idx);
              }}
            >
              <div className="card-header">
                <div className={`card-number ${idx === selectedStopIndex ? 'active' : ''}`}>
                  {idx + 1}
                </div>
                <div className="card-title-section">
                  <h4>{stop.name}</h4>
                  <p className="card-categories">{stop.categories.join(', ')}</p>
                </div>
              </div>

              {idx === selectedStopIndex && (
                <div className="card-expanded">
                  <div className="expanded-content">
                    <p className="expanded-description">{stop.short_fact}</p>
                    <div className="expanded-meta">
                      <span className="meta-badge">⏱️ {stop.visit_minutes}m</span>
                      <span className={`meta-badge crowd crowd-${stop.crowd_level.toLowerCase()}`}>
                        👥 {stop.crowd_level}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-action">
                <span className="action-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Summary */}
      <div className="journey-summary">
        <h3>Journey Summary</h3>
        <div className="summary-timeline">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-title">{stop.name}</div>
                <div className="timeline-meta">
                  {idx === 0 ? '🚶 Start' : `${idx}. ${stop.categories[0]}`}
                </div>
              </div>
              {idx < stops.length - 1 && (
                <div className="timeline-duration">
                  {Math.round(Math.random() * 15 + 5)}m walk
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImprovedStopsList;
