import React, { useState, useEffect, useRef } from 'react';
import { tourService } from '../services/tourService';
import { 
  MapPin, 
  Clock, 
  Footprints, 
  Users, 
  Building2, 
  Utensils, 
  Palette, 
  TreePine, 
  Coffee, 
  ShoppingBag, 
  Camera, 
  Building,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import './ModernPreferenceForm.css';

function PremiumPreferenceForm({ onTourGenerated }) {
  const [time, setTime] = useState(60);
  const [interests, setInterests] = useState([]);
  const [walkingTolerance, setWalkingTolerance] = useState('MODERATE');
  const [crowdPreference, setCrowdPreference] = useState('ANY');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Track mouse for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      return () => card.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const allInterests = [
    { id: 'history', icon: Building2, label: 'History', color: '#8B4513', gradient: 'from-amber-700 to-orange-500' },
    { id: 'food', icon: Utensils, label: 'Food & Dining', color: '#FF6B6B', gradient: 'from-red-500 to-pink-500' },
    { id: 'art', icon: Palette, label: 'Art & Culture', color: '#9B59B6', gradient: 'from-purple-500 to-violet-600' },
    { id: 'nature', icon: TreePine, label: 'Nature', color: '#27AE60', gradient: 'from-green-500 to-emerald-600' },
    { id: 'coffee', icon: Coffee, label: 'Coffee Shops', color: '#A0522D', gradient: 'from-amber-600 to-yellow-600' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shopping', color: '#E74C3C', gradient: 'from-rose-500 to-red-600' },
    { id: 'photography', icon: Camera, label: 'Photography', color: '#3498DB', gradient: 'from-blue-500 to-cyan-600' },
    { id: 'architecture', icon: Building, label: 'Architecture', color: '#34495E', gradient: 'from-slate-600 to-zinc-700' },
  ];

  const steps = [
    {
      title: 'How much time do you have?',
      subtitle: 'Select your preferred tour duration',
      icon: Clock,
    },
    {
      title: 'What catches your eye?',
      subtitle: 'Choose your interests',
      icon: Sparkles,
    },
    {
      title: 'How do you like to explore?',
      subtitle: 'Pick your walking pace',
      icon: Footprints,
    },
    {
      title: 'What vibe do you prefer?',
      subtitle: 'Select your atmosphere',
      icon: Users,
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
    if (interests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    try {
      setLoading(true);
      const preferences = {
        time_available_minutes: time,
        interests: interests,
        walking_tolerance: walkingTolerance,
        crowd_preference: crowdPreference,
        // Start at Riverfront Coffee Co. coordinates
        start_location: {
          lat: 41.8839,
          lng: -87.6233
        },
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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return interests.length > 0;
    return true;
  };

  const getPresetTimes = [
    { label: '30 min', value: 30, desc: 'Quick' },
    { label: '1 hour', value: 60, desc: 'Leisurely' },
    { label: '2 hours', value: 120, desc: 'Explorer' },
    { label: '4 hours', value: 240, desc: 'Adventure' },
  ];

  const getWalkingOptions = [
    { 
      value: 'LIGHT', 
      label: 'Casual Stroll', 
      icon: Footprints,
      desc: 'Short distances, lots of breaks',
      gradient: 'from-green-400 to-emerald-500'
    },
    { 
      value: 'MODERATE', 
      label: 'Steady Pace', 
      icon: Footprints,
      desc: 'Balanced walking & exploring',
      gradient: 'from-blue-400 to-indigo-500'
    },
    { 
      value: 'HEAVY', 
      label: 'Active Explorer', 
      icon: Footprints,
      desc: 'Cover maximum ground',
      gradient: 'from-orange-400 to-red-500'
    },
  ];

  const getCrowdOptions = [
    { 
      value: 'QUIET', 
      label: 'Peaceful', 
      desc: 'Quiet neighborhoods',
      gradient: 'from-slate-400 to-zinc-500'
    },
    { 
      value: 'ANY', 
      label: 'Mixed Vibes', 
      desc: 'Any atmosphere works',
      gradient: 'from-purple-400 to-pink-500'
    },
    { 
      value: 'BUSTLING', 
      label: 'Lively', 
      desc: 'Energy & excitement',
      gradient: 'from-amber-400 to-orange-500'
    },
  ];

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="premium-form-container">
      {/* Animated background */}
      <div className="form-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="premium-form-card" ref={cardRef}>
        {/* Glass effect overlay */}
        <div className="glass-overlay"></div>
        
        {/* Header with animation */}
        <div className="form-header">
          <div className="logo-section">
            <div className="logo-icon">
              <MapPin size={24} />
            </div>
            <div className="logo-text">
              <h1 className="brand-name">LoopTour</h1>
              <p className="brand-tagline">Your AI-Powered City Adventure</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="progress-wrapper">
            <div className="progress-steps">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`progress-step ${idx <= currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                >
                  <div className="step-dot">
                    {idx < currentStep ? <Check size={12} /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && <div className="step-line"></div>}
                </div>
              ))}
            </div>
            <span className="progress-label">Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="step-content">
          <div className="step-header">
            <div className="step-icon-wrapper">
              <CurrentStepIcon size={28} />
            </div>
            <div className="step-text">
              <h2 className="step-title">{steps[currentStep].title}</h2>
              <p className="step-subtitle">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="step-body">
            {/* Step 1: Time */}
            {currentStep === 0 && (
              <div className="time-step">
                <div className="time-circle">
                  <span className="time-number">{time}</span>
                  <span className="time-label">minutes</span>
                </div>
                
                <div className="time-slider-container">
                  <input
                    type="range"
                    min="30"
                    max="240"
                    step="15"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value))}
                    className="time-slider"
                    style={{
                      '--progress': `${((time - 30) / 210) * 100}%`
                    }}
                  />
                  <div className="slider-labels">
                    <span>30 min</span>
                    <span>4 hours</span>
                  </div>
                </div>

                <div className="preset-grid">
                  {getPresetTimes.map((preset) => (
                    <button
                      key={preset.value}
                      className={`preset-card ${time === preset.value ? 'active' : ''}`}
                      onClick={() => setTime(preset.value)}
                    >
                      <span className="preset-time">{preset.label}</span>
                      <span className="preset-desc">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {currentStep === 1 && (
              <div className="interests-step">
                <div className="interests-grid">
                  {allInterests.map((interest) => {
                    const IconComponent = interest.icon;
                    const isSelected = interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        className={`interest-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleInterestToggle(interest.id)}
                        style={isSelected ? { '--accent-color': interest.color } : {}}
                      >
                        <div className={`interest-icon ${isSelected ? 'selected' : ''}`}>
                          <IconComponent size={24} />
                        </div>
                        <span className="interest-label">{interest.label}</span>
                        {isSelected && <div className="check-badge"><Check size={14} /></div>}
                      </button>
                    );
                  })}
                </div>
                
                <div className="selection-counter">
                  <span>{interests.length} selected</span>
                  {interests.length > 0 && (
                    <span className="selection-names">
                      {interests.map(id => allInterests.find(i => i.id === id)?.label).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Walking */}
            {currentStep === 2 && (
              <div className="walking-step">
                <div className="option-cards">
                  {getWalkingOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = walkingTolerance === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setWalkingTolerance(option.value)}
                      >
                        <div className={`option-icon ${option.gradient}`}>
                          <IconComponent size={24} />
                        </div>
                        <div className="option-content">
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.desc}</span>
                        </div>
                        <div className="option-check">
                          {isSelected && <div className="check-circle"><Check size={14} /></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Crowd */}
            {currentStep === 3 && (
              <div className="crowd-step">
                <div className="option-cards">
                  {getCrowdOptions.map((option) => {
                    const isSelected = crowdPreference === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setCrowdPreference(option.value)}
                      >
                        <div className={`option-icon ${option.gradient}`}>
                          <Users size={24} />
                        </div>
                        <div className="option-content">
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.desc}</span>
                        </div>
                        <div className="option-check">
                          {isSelected && <div className="check-circle"><Check size={14} /></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <button
            className="btn-nav btn-back"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              className="btn-nav btn-next"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              <span>Continue</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className={`btn-generate ${loading ? 'loading' : ''}`}
              onClick={handleGenerateTour}
              disabled={loading || interests.length === 0}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Generating Your Tour...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Create My Tour</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PremiumPreferenceForm;
