import React, { useState } from 'react';
import './PreferenceForm.css';
import tourService from '../services/tourService';

const PRESET_INTERESTS = [
  'history',
  'architecture',
  'coffee',
  'food',
  'street art',
  'waterfront',
  'parks',
  'shopping'
];

const STARTING_LOCATIONS = [
  { name: 'Loop Central', lat: 41.8839, lng: -87.6233 },
  { name: 'Grant Park', lat: 41.8716, lng: -87.6220 },
  { name: 'Navy Pier', lat: 41.8860, lng: -87.6095 },
  { name: 'Millennium Park', lat: 41.8827, lng: -87.6233 }
];

function PreferenceForm({ onTourGenerated }) {
  const [timeAvailable, setTimeAvailable] = useState(120);
  const [walkingTolerance, setWalkingTolerance] = useState('MODERATE');
  const [selectedInterests, setSelectedInterests] = useState(['history', 'coffee']);
  const [customInterest, setCustomInterest] = useState('');
  const [crowdPreference, setCrowdPreference] = useState('BALANCED');
  const [startLocation, setStartLocation] = useState('Loop Central');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedStartLocation = STARTING_LOCATIONS.find(loc => loc.name === startLocation);

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateTour = async () => {
    try {
      setLoading(true);
      setError(null);

      const preferences = {
        city: 'Chicago',
        time_available_minutes: parseInt(timeAvailable),
        walking_tolerance: walkingTolerance,
        interests: selectedInterests,
        custom_interest_text: customInterest,
        crowd_preference: crowdPreference,
        start_location: {
          lat: selectedStartLocation.lat,
          lng: selectedStartLocation.lng
        }
      };

      const tour = await tourService.generateTour(preferences);
      onTourGenerated(tour, preferences);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate tour. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preference-form-container">
      <header className="form-header">
        <h1>🎫 LoopTour</h1>
        <p>Personalized Walking Tours That Adapt to You</p>
      </header>

      <div className="form-card">
        {/* Time Available */}
        <div className="form-group">
          <label htmlFor="time">How much time do you have?</label>
          <div className="time-input">
            <input
              id="time"
              type="range"
              min="30"
              max="240"
              step="30"
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(e.target.value)}
            />
            <span className="time-display">{timeAvailable} minutes</span>
          </div>
          <div className="quick-buttons">
            <button
              className={timeAvailable === '30' ? 'active' : ''}
              onClick={() => setTimeAvailable('30')}
            >
              30m
            </button>
            <button
              className={timeAvailable === '60' ? 'active' : ''}
              onClick={() => setTimeAvailable('60')}
            >
              1h
            </button>
            <button
              className={timeAvailable === '120' ? 'active' : ''}
              onClick={() => setTimeAvailable('120')}
            >
              2h
            </button>
            <button
              className={timeAvailable === '180' ? 'active' : ''}
              onClick={() => setTimeAvailable('180')}
            >
              3h
            </button>
          </div>
        </div>

        {/* Walking Tolerance */}
        <div className="form-group">
          <label>What's your walking tolerance?</label>
          <div className="radio-group">
            {['VERY_LIGHT', 'MODERATE', 'A_LOT'].map(tolerance => (
              <label key={tolerance} className="radio-label">
                <input
                  type="radio"
                  name="walking"
                  value={tolerance}
                  checked={walkingTolerance === tolerance}
                  onChange={(e) => setWalkingTolerance(e.target.value)}
                />
                <span>
                  {tolerance === 'VERY_LIGHT' && '🚶 Very light'}
                  {tolerance === 'MODERATE' && '🚶‍♂️ Moderate'}
                  {tolerance === 'A_LOT' && '🏃 I can walk a lot'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="form-group">
          <label>What interests you? (Select at least 1)</label>
          <div className="interests-grid">
            {PRESET_INTERESTS.map(interest => (
              <button
                key={interest}
                className={`interest-btn ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Or add a custom interest..."
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            className="custom-interest-input"
          />
        </div>

        {/* Crowd Preference */}
        <div className="form-group">
          <label>Crowd preference?</label>
          <div className="radio-group">
            {[
              { value: 'QUIET', label: '🤫 Prefer quiet places' },
              { value: 'BALANCED', label: '⚖️ Balanced' },
              { value: 'ANY', label: '👥 I don\'t mind crowds' }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="crowd"
                  value={option.value}
                  checked={crowdPreference === option.value}
                  onChange={(e) => setCrowdPreference(e.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Starting Location */}
        <div className="form-group">
          <label htmlFor="start-location">Where should we start?</label>
          <select
            id="start-location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="location-select"
          >
            {STARTING_LOCATIONS.map(loc => (
              <option key={loc.name} value={loc.name}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Generate Button */}
        <button
          className="generate-btn"
          onClick={handleGenerateTour}
          disabled={loading || selectedInterests.length === 0}
        >
          {loading ? '⏳ Generating your tour...' : '🗺️ Generate My Tour'}
        </button>
      </div>
    </div>
  );
}

export default PreferenceForm;
