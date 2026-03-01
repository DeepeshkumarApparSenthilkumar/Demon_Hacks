import React, { useState, useEffect } from 'react';
import { tourService } from '../services/tourService';
import './InteractivePreferenceForm.css';

function InteractivePreferenceForm({ onTourGenerated }) {
  const [time, setTime] = useState(60);
  const [interests, setInterests] = useState([]);
  const [walkingTolerance, setWalkingTolerance] = useState('MODERATE');
  const [crowdPreference, setCrowdPreference] = useState('ANY');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, [currentStep]);

  const allInterests = [
    { id: 'history', icon: '🏛️', label: 'History' },
    { id: 'food', icon: '🍽️', label: 'Food & Dining' },
    { id: 'art', icon: '🎨', label: 'Art & Culture' },
    { id: 'nature', icon: '🌳', label: 'Nature' },
    { id: 'coffee', icon: '☕', label: 'Coffee Shops' },
    { id: 'shopping', icon: '🛍️', label: 'Shopping' },
    { id: 'photography', icon: '📸', label: 'Photography' },
    { id: 'architecture', icon: '🏗️', label: 'Architecture' },
  ];

  const steps = [
    {
      title: 'How much time do you have?',
      subtitle: 'Select your available time for the tour',
      icon: '⏱️',
    },
    {
      title: 'What interests you?',
      subtitle: 'Pick one or more interests',
      icon: '✨',
    },
    {
      title: 'Walking comfort level?',
      subtitle: 'How much walking are you up for?',
      icon: '🚶',
    },
    {
      title: 'Crowd preference?',
      subtitle: 'Prefer quiet or bustling places?',
      icon: '👥',
    },
  ];

  const handleInterestToggle = (interestId) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleGenerateTour = async () => {
    try {
      setLoading(true);
      const preferences = {
        available_minutes: time,
        interests: interests.length > 0 ? interests : ['history'],
        walking_tolerance: walkingTolerance,
        crowd_preference: crowdPreference,
        start_location: 'Riverfront Coffee',
      };

      const tour = await tourService.generateTour(preferences);
      onTourGenerated(tour, preferences);
    } catch (error) {
      console.error('Error generating tour:', error);
      alert('Failed to generate tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setAnimateIn(false);
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setAnimateIn(false);
      setTimeout(() => setCurrentStep(currentStep - 1), 300);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="interactive-preference-form">
      {/* Background animation */}
      <div className="animated-bg">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>

      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <h1>🗺️ LoopTour</h1>
          <p>Create your personalized walking tour</p>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="step-counter">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Steps */}
        <div className={`form-step ${animateIn ? 'animate-in' : ''}`}>
          <div className="step-header">
            <span className="step-icon">{steps[currentStep].icon}</span>
            <h2>{steps[currentStep].title}</h2>
            <p className="step-subtitle">{steps[currentStep].subtitle}</p>
          </div>

          {/* Step 0: Time */}
          {currentStep === 0 && (
            <div className="step-content">
              <div className="time-display">
                <div className="time-value">{time}</div>
                <div className="time-label">minutes</div>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                value={time}
                onChange={(e) => setTime(parseInt(e.target.value))}
                className="slider"
              />
              <div className="time-presets">
                {[
                  { label: 'Quick', value: 30 },
                  { label: 'Moderate', value: 60 },
                  { label: 'Full', value: 120 },
                  { label: 'Deep', value: 180 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    className={`preset-btn ${time === preset.value ? 'active' : ''}`}
                    onClick={() => setTime(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="interests-grid">
                {allInterests.map((interest) => (
                  <button
                    key={interest.id}
                    className={`interest-card ${interests.includes(interest.id) ? 'selected' : ''}`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <span className="interest-icon">{interest.icon}</span>
                    <span className="interest-label">{interest.label}</span>
                    {interests.includes(interest.id) && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Walking */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="radio-group">
                {[
                  {
                    id: 'LOW',
                    label: 'Easy Walker',
                    description: 'Prefer short distances',
                    icon: '🌤️',
                  },
                  {
                    id: 'MODERATE',
                    label: 'Steady Pacer',
                    description: 'Medium distances',
                    icon: '🏃',
                  },
                  {
                    id: 'HIGH',
                    label: 'Adventurous',
                    description: 'Love long walks',
                    icon: '⛰️',
                  },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`radio-card ${walkingTolerance === option.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      value={option.id}
                      checked={walkingTolerance === option.id}
                      onChange={(e) => setWalkingTolerance(e.target.value)}
                    />
                    <span className="radio-icon">{option.icon}</span>
                    <div className="radio-content">
                      <span className="radio-label">{option.label}</span>
                      <span className="radio-desc">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Crowd */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="radio-group">
                {[
                  {
                    id: 'QUIET',
                    label: 'Peaceful Explorer',
                    description: 'Seek quiet, hidden gems',
                    icon: '🤫',
                  },
                  {
                    id: 'ANY',
                    label: 'Flexible',
                    description: "Don't mind either way",
                    icon: '🎯',
                  },
                  {
                    id: 'BUSY',
                    label: 'Social Butterfly',
                    description: 'Love vibrant, crowded places',
                    icon: '🎉',
                  },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`radio-card ${crowdPreference === option.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      value={option.id}
                      checked={crowdPreference === option.id}
                      onChange={(e) => setCrowdPreference(e.target.value)}
                    />
                    <span className="radio-icon">{option.icon}</span>
                    <div className="radio-content">
                      <span className="radio-label">{option.label}</span>
                      <span className="radio-desc">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            ← Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-generate"
              onClick={handleGenerateTour}
              disabled={loading}
            >
              {loading ? '✨ Creating tour...' : '✨ Generate My Tour'}
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="step-dots">
          {steps.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              onClick={() => {
                setAnimateIn(false);
                setTimeout(() => setCurrentStep(idx), 300);
              }}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InteractivePreferenceForm;
