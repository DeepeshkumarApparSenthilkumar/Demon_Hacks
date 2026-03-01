import React, { useState } from 'react';
import './TourDisplay.css';
import GoogleMapsComponent from '../components/GoogleMapsComponent';
import ImprovedStopsList from '../components/ImprovedStopsList';
import AdjustmentPanel from '../components/AdjustmentPanel';
import tourService from '../services/tourService';

function TourDisplay({ tour, preferences, onBackToForm }) {
  const [currentTour, setCurrentTour] = useState(tour);
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adjustmentMessage, setAdjustmentMessage] = useState(null);

  const handleAdjustTour = async (adjustmentType, adjustmentInterest = null) => {
    try {
      setLoading(true);
      setAdjustmentMessage(null);

      const currentStop = currentTour.stops[selectedStopIndex];
      const remainingTime = Math.max(
        currentTour.total_duration_minutes - (selectedStopIndex * 10),
        30
      );

      const newTour = await tourService.adjustTour(
        currentStop.id,
        remainingTime,
        adjustmentType,
        adjustmentInterest,
        preferences
      );

      setCurrentTour(newTour);
      setSelectedStopIndex(0);
      setAdjustmentMessage(`✓ Tour updated! ${adjustmentType.toLowerCase()} adjustment applied.`);

      setTimeout(() => setAdjustmentMessage(null), 3000);
    } catch (error) {
      console.error('Error adjusting tour:', error);
      setAdjustmentMessage('Failed to adjust tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tour-display-container">
      <header className="tour-header">
        <button className="back-btn" onClick={onBackToForm}>
          ← Back
        </button>
        <h1>🗺️ Your LoopTour</h1>
        <div />
      </header>

      {adjustmentMessage && (
        <div className="adjustment-notification">
          {adjustmentMessage}
        </div>
      )}

      <div className="tour-content">
        <div className="map-section">
          <GoogleMapsComponent 
            tour={currentTour} 
            selectedStopIndex={selectedStopIndex}
            onStopSelect={setSelectedStopIndex}
          />
        </div>

        <div className="details-section">
          <div className="tour-summary">
            <p>{currentTour.summary}</p>
            <div className="tour-stats">
              <span>⏱️ {currentTour.total_duration_minutes} min</span>
              <span>📍 {currentTour.total_distance_km} km</span>
              <span>🛑 {currentTour.stops.length} stops</span>
            </div>
          </div>

          <ImprovedStopsList 
            stops={currentTour.stops}
            selectedStopIndex={selectedStopIndex}
            onStopSelect={setSelectedStopIndex}
          />

          <AdjustmentPanel
            onAdjust={handleAdjustTour}
            loading={loading}
            currentStopIndex={selectedStopIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default TourDisplay;
