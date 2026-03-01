import React, { useState } from 'react';
import MapboxMap from '../components/MapboxMap';
import { tourService } from '../services/tourService';
import './InteractiveTourDisplay.css';

function InteractiveTourDisplay({ tour, preferences, onBackToForm }) {
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [currentTour, setCurrentTour] = useState(tour);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adjustmentMessage, setAdjustmentMessage] = useState(null);

  const handleAdjustTour = async (adjustmentType, interest = null) => {
    try {
      setLoading(true);
      const currentStop = currentTour.stops[selectedStopIndex];
      const remainingTime = Math.max(
        currentTour.total_duration_minutes - selectedStopIndex * 10,
        30
      );

      const newTour = await tourService.adjustTour(
        currentStop.id,
        remainingTime,
        adjustmentType,
        interest,
        preferences
      );

      setCurrentTour(newTour);
      setSelectedStopIndex(0);
      setAdjustmentMessage(`✓ Tour updated!`);
      setTimeout(() => setAdjustmentMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setAdjustmentMessage('Failed to adjust tour');
    } finally {
      setLoading(false);
    }
  };

  const currentStop = currentTour.stops[selectedStopIndex];
  const nextStop = currentTour.stops[selectedStopIndex + 1];
  const progressPercent = ((selectedStopIndex + 1) / currentTour.stops.length) * 100;

  return (
    <div className="interactive-tour-display">
      {/* Header */}
      <header className="tour-header">
        <button className="back-btn" onClick={onBackToForm}>
          ← Back
        </button>
        <h1>🗺️ Your LoopTour</h1>
        <div className="tour-stats-mini">
          <span>⏱️ {currentTour.total_duration_minutes}m</span>
          <span>📍 {currentTour.total_distance_km}km</span>
        </div>
      </header>

      {adjustmentMessage && (
        <div className="adjustment-notification">
          {adjustmentMessage}
        </div>
      )}

      {/* Main content */}
      <div className="tour-content">
        {/* Left: Map */}
        <div className="map-column">
          <div className="map-wrapper">
            <MapboxMap
              tour={currentTour}
              selectedStopIndex={selectedStopIndex}
              onStopSelect={setSelectedStopIndex}
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="details-column">
          {/* Tabs */}
          <div className="tab-bar">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab ${activeTab === 'stops' ? 'active' : ''}`}
              onClick={() => setActiveTab('stops')}
            >
              🛑 Stops ({currentTour.stops.length})
            </button>
            <button
              className={`tab ${activeTab === 'adjust' ? 'active' : ''}`}
              onClick={() => setActiveTab('adjust')}
            >
              ⚙️ Adjust
            </button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane animate-in">
                <div className="tour-summary-card">
                  <h2>Tour Overview</h2>
                  <p className="summary-text">{currentTour.summary}</p>
                </div>

                {/* Current stop hero */}
                <div className="current-stop-hero">
                  <div className="stop-number-badge">{selectedStopIndex + 1}</div>
                  <h3>{currentStop.name}</h3>
                  <div className="stop-tags">
                    {currentStop.categories.map((cat) => (
                      <span key={cat} className="tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="stop-description">{currentStop.description}</p>
                  <div className="stop-meta">
                    <div className="meta-item">
                      <span className="meta-label">⏱️ Visit time</span>
                      <span className="meta-value">{currentStop.visit_minutes} min</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">👥 Crowd level</span>
                      <span className={`meta-value crowd-${currentStop.crowd_level.toLowerCase()}`}>
                        {currentStop.crowd_level}
                      </span>
                    </div>
                  </div>

                  {nextStop && (
                    <div className="next-stop-card">
                      <span className="label">Next:</span>
                      <h4>{nextStop.name}</h4>
                      <p>{nextStop.categories.join(' • ')}</p>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    Stop {selectedStopIndex + 1} of {currentTour.stops.length}
                  </p>
                </div>
              </div>
            )}

            {/* Stops Tab */}
            {activeTab === 'stops' && (
              <div className="tab-pane animate-in">
                <div className="stops-carousel">
                  {currentTour.stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className={`stop-card ${idx === selectedStopIndex ? 'active' : ''}`}
                      onClick={() => setSelectedStopIndex(idx)}
                    >
                      <div className="stop-card-number">{idx + 1}</div>
                      <h4>{stop.name}</h4>
                      <p className="stop-card-meta">
                        {stop.categories.slice(0, 2).join(', ')}
                      </p>
                      <div className="stop-card-time">⏱️ {stop.visit_minutes}m</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adjust Tab */}
            {activeTab === 'adjust' && (
              <div className="tab-pane animate-in">
                <div className="adjustment-grid">
                  <button
                    className="adjustment-btn"
                    onClick={() => handleAdjustTour('REDUCE_TIME')}
                    disabled={loading}
                  >
                    <span className="btn-icon">⏱️</span>
                    <span className="btn-text">I'm Tired</span>
                    <span className="btn-desc">Shorten the tour</span>
                  </button>
                  <button
                    className="adjustment-btn"
                    onClick={() => handleAdjustTour('ADD_INTEREST', 'food')}
                    disabled={loading}
                  >
                    <span className="btn-icon">🍽️</span>
                    <span className="btn-text">More Food</span>
                    <span className="btn-desc">Add food spots</span>
                  </button>
                  <button
                    className="adjustment-btn"
                    onClick={() => handleAdjustTour('ADD_INTEREST', 'coffee')}
                    disabled={loading}
                  >
                    <span className="btn-icon">☕</span>
                    <span className="btn-text">Coffee Break</span>
                    <span className="btn-desc">Add coffee shops</span>
                  </button>
                  <button
                    className="adjustment-btn"
                    onClick={() => handleAdjustTour('AVOID_CROWDS')}
                    disabled={loading}
                  >
                    <span className="btn-icon">🤫</span>
                    <span className="btn-text">Less Crowded</span>
                    <span className="btn-desc">Avoid busy areas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveTourDisplay;
