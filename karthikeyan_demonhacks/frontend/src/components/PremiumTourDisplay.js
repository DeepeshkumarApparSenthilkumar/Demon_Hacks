import React, { useState, useEffect, useRef } from 'react';
import { tourService } from '../services/tourService';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ModernTourDisplay.css';
import './MapControls.css';
import {
  ArrowLeft, 
  Clock, 
  MapPin, 
  Footprints,
  Coffee,
  Utensils,
  Users,
  Zap,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Route,
  Navigation,
  MapPinned,
  Locate,
  X
} from 'lucide-react';

// POI data for nearby feature
const nearbyPlaces = [
  { name: "Starbucks", category: "coffee", lat: 41.8840, lng: -87.6240 },
  { name: "CVS Pharmacy", category: "shopping", lat: 41.8835, lng: -87.6228 },
  { name: "CTA Station", category: "transport", lat: 41.8845, lng: -87.6238 },
  { name: "Restaurant", category: "food", lat: 41.8832, lng: -87.6225 },
  { name: "ATM", category: "service", lat: 41.8842, lng: -87.6235 },
  { name: "Public Restroom", category: "service", lat: 41.8838, lng: -87.6232 },
];

function PremiumTourDisplay({ tour, preferences, onBackToForm }) {
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adjustmentMessage, setAdjustmentMessage] = useState('');
  const [adjustedTour, setAdjustedTour] = useState(null);
  const [showNearBy, setShowNearBy] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [navigationStep, setNavigationStep] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlacesList, setNearbyPlacesList] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const directions = useRef(null);

  const currentTour = adjustedTour || tour;
  const currentStop = currentTour.stops[selectedStopIndex];

  // Calculate actual total time
  const calculateTotalTime = () => {
    let total = 0;
    currentTour.stops.forEach((stop, idx) => {
      total += stop.visit_minutes || 20;
      if (idx < currentTour.stops.length - 1 && stop.walk_time_to_next) {
        total += stop.walk_time_to_next;
      } else if (idx < currentTour.stops.length - 1) {
        const nextStop = currentTour.stops[idx + 1];
        const dist = getDistance(stop.lat, stop.lng, nextStop.lat, nextStop.lng);
        total += Math.round((dist / 5) * 60);
      }
    });
    return total;
  };

  // Convert km to miles
  const kmToMiles = (km) => {
    return (km * 0.621371).toFixed(1);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTotalDistance = () => {
    let distance = 0;
    for (let i = 0; i < currentTour.stops.length - 1; i++) {
      distance += getDistance(
        currentTour.stops[i].lat, currentTour.stops[i].lng,
        currentTour.stops[i + 1].lat, currentTour.stops[i + 1].lng
      );
    }
    // Return in miles for US metrics
    return kmToMiles(distance);
  };

  const totalTime = calculateTotalTime();

  // Get user location with improved error handling
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please use a modern browser.');
      return;
    }

    // Show loading state
    setShowNearBy(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        setUserLocation({ lat: userLat, lng: userLng });
        
        // Fly to user location
        if (map.current) {
          map.current.flyTo({
            center: [userLng, userLat],
            zoom: 15,
            duration: 1500
          });
          
          // Add user marker
          const userMarkerEl = document.createElement('div');
          userMarkerEl.className = 'user-location-marker';
          userMarkerEl.innerHTML = `
            <div style="width: 20px; height: 20px; background: #00d4ff; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            </div>
          `;
          
          new mapboxgl.Marker(userMarkerEl)
            .setLngLat([userLng, userLat])
            .addTo(map.current);
        }
        
        // Find nearby places within 0.3 miles (~500m)
        const near = nearbyPlaces.filter(p => 
          getDistance(userLat, userLng, p.lat, p.lng) < 0.3
        );
        
        // If no places in range, show all places sorted by distance
        if (near.length === 0) {
          const sortedPlaces = [...nearbyPlaces].sort((a, b) => {
            const distA = getDistance(userLat, userLng, a.lat, a.lng);
            const distB = getDistance(userLat, userLng, b.lat, b.lng);
            return distA - distB;
          }).slice(0, 5);
          setNearbyPlacesList(sortedPlaces);
        } else {
          setNearbyPlacesList(near);
        }
        
        setShowNearBy(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Could not get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission was denied. Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enable location services and try again.';
        }
        
        alert(errorMessage);
        setShowNearBy(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.REACT_APP_MAPBOX_TOKEN;
    if (!token || token.includes('YOUR_TOKEN')) {
      console.warn('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [currentTour.stops[0].lng, currentTour.stops[0].lat],
      zoom: 14,
      pitch: 30,
      bearing: -20
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    directions.current = new MapboxDirections({
      accessToken: token,
      profile: 'walking',
      alternatives: false,
      geometries: 'geojson',
      controls: { instructions: true },
      flyTo: true
    });
    
    map.current.addControl(directions.current, 'top-left');

    map.current.on('load', () => {
      // Add markers
      currentTour.stops.forEach((stop, idx) => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        const isActive = idx === selectedStopIndex;
        const isCompleted = idx < selectedStopIndex;
        
        el.innerHTML = `
          <div class="marker-pin ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
            <span class="marker-number">${isCompleted ? '✓' : idx + 1}</span>
          </div>
        `;
        
        el.addEventListener('click', () => {
          setSelectedStopIndex(idx);
          setShowDirections(false);
        });

        new mapboxgl.Marker(el)
          .setLngLat([stop.lng, stop.lat])
          .addTo(map.current);
      });

      // Show route
      updateRoute();
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [currentTour]);

  // Update route when stop changes
  useEffect(() => {
    if (map.current && currentTour.stops[selectedStopIndex]) {
      const stop = currentTour.stops[selectedStopIndex];
      map.current.flyTo({
        center: [stop.lng, stop.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedStopIndex, currentTour]);

  // Update route on the map with proper A to B navigation
  const updateRoute = () => {
    if (!map.current || !directions.current || currentTour.stops.length < 2) return;
    
    const origin = [currentTour.stops[0].lng, currentTour.stops[0].lat];
    const destination = [
      currentTour.stops[currentTour.stops.length - 1].lng,
      currentTour.stops[currentTour.stops.length - 1].lat
    ];
    
    // Clear previous routes
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    
    // Set origin and destination
    directions.current.setOrigin(origin);
    
    setTimeout(() => {
      directions.current.setDestination(destination);
    }, 300);
    
    // Draw direct line route as fallback
    setTimeout(() => {
      const coordinates = currentTour.stops.map(stop => [stop.lng, stop.lat]);
      
      if (map.current.getSource('tour-route')) {
        map.current.getSource('tour-route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        });
      } else {
        map.current.addSource('tour-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });
        
        map.current.addLayer({
          id: 'tour-route',
          type: 'line',
          source: 'tour-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#6366f1',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
      }
    }, 1000);
  };

  // Navigate to next stop with proper A to B directions
  const navigateToNextStop = () => {
    if (selectedStopIndex < currentTour.stops.length - 1) {
      const nextIdx = selectedStopIndex + 1;
      setSelectedStopIndex(nextIdx);
      setShowDirections(true);
      setNavigationStep(nextIdx);
      
      // Show navigation to next stop
      const currentStopData = currentTour.stops[selectedStopIndex];
      const nextStopData = currentTour.stops[nextIdx];
      
      if (directions.current) {
        directions.current.setOrigin([currentStopData.lng, currentStopData.lat]);
        directions.current.setDestination([nextStopData.lng, nextStopData.lat]);
      }
    }
  };

  // Show directions to specific stop - fully functional A to B
  const showNavigationTo = (stopIndex) => {
    if (!directions.current || stopIndex >= currentTour.stops.length) return;
    
    const from = currentTour.stops[selectedStopIndex];
    const to = currentTour.stops[stopIndex];
    
    // Set proper A to B navigation
    directions.current.setOrigin([from.lng, from.lat]);
    directions.current.setDestination([to.lng, to.lat]);
    
    // Add a direct line on map for visual guide
    if (map.current) {
      const coordinates = [[from.lng, from.lat], [to.lng, to.lat]];
      
      if (map.current.getSource('direct-route')) {
        map.current.getSource('direct-route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        });
      } else {
        map.current.addSource('direct-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });
        
        map.current.addLayer({
          id: 'direct-route',
          type: 'line',
          source: 'direct-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff6b6b',
            'line-width': 5,
            'line-opacity': 0.9,
            'line-dasharray': [2, 1]
          }
        });
      }
    }
    
    setShowDirections(true);
  };

  // Handle adjust tour
  const handleAdjustTour = async (adjustmentType, adjustmentInterest = null) => {
    try {
      setLoading(true);
      setAdjustmentMessage('');
      
      let elapsedTime = 0;
      for (let i = 0; i <= selectedStopIndex; i++) {
        elapsedTime += currentTour.stops[i].visit_minutes || 20;
        if (i < selectedStopIndex && currentTour.stops[i].walk_time_to_next) {
          elapsedTime += currentTour.stops[i].walk_time_to_next;
        }
      }
      const remainingMinutes = Math.max(30, totalTime - elapsedTime);

      // Ensure we pass correct parameters
      const adjustedTourData = await tourService.adjustTour(
        currentTour.stops[selectedStopIndex].id,
        remainingMinutes,
        adjustmentType,
        adjustmentInterest,
        preferences
      );

      setAdjustedTour(adjustedTourData);
      setSelectedStopIndex(0);
      
      let message = '';
      switch(adjustmentType) {
        case 'TIRED':
          message = 'Tour shortened! Taking it easy from here.';
          break;
        case 'MORE_INTEREST':
          message = `Added ${adjustmentInterest} spots to your tour!`;
          break;
        case 'TOO_CROWDED':
          message = 'Found quieter alternatives for you!';
          break;
        default:
          message = 'Tour adjusted successfully!';
      }
      setAdjustmentMessage(message);
      setTimeout(() => setAdjustmentMessage(''), 5000);
    } catch (error) {
      console.error('Error adjusting tour:', error);
      setAdjustmentMessage('Could not adjust tour. Please try again. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'coffee': return <Coffee size={14} />;
      case 'food': return <Utensils size={14} />;
      default: return <MapPin size={14} />;
    }
  };

  const getDirectionSteps = () => {
    if (selectedStopIndex >= currentTour.stops.length - 1) return [];
    
    const steps = [];
    const current = currentTour.stops[selectedStopIndex];
    const next = currentTour.stops[selectedStopIndex + 1];
    
    // Generate pseudo-instructions (in real app, would use Directions API response)
    steps.push({
      instruction: `Start from ${current.name}`,
      distance: `${(current.walk_time_to_next || 5)} min walk`
    });
    steps.push({
      instruction: `Walk to ${next.name}`,
      distance: `${(current.walk_time_to_next || 5)} min`
    });
    steps.push({
      instruction: `Arrive at ${next.name}`,
      distance: 'Destination'
    });
    
    return steps;
  };

  return (
    <div className="premium-tour-container">
      {/* Header */}
      <div className="tour-header">
        <button className="btn-back" onClick={onBackToForm}>
          <ArrowLeft size={18} />
          <span>New Tour</span>
        </button>
        
        <div className="header-center">
          <h1 className="tour-title">
            <Sparkles size={22} className="title-icon" />
            Your Journey
          </h1>
        </div>

        <div className="tour-stats">
          <div className="stat-item">
            <Clock size={16} />
            <span className="stat-value">{totalTime}</span>
            <span className="stat-label">min</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Route size={16} />
            <span className="stat-value">{getTotalDistance()}</span>
            <span className="stat-label">mi</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <MapPin size={16} />
            <span className="stat-value">{currentTour.stops.length}</span>
            <span className="stat-label">stops</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="tour-content">
        {/* Left: Map */}
        <div className="tour-map-section">
          <div className="map-wrapper">
            <div className="map-container" ref={mapContainer}></div>
            
            {/* Map Controls Overlay */}
            <div className="map-controls">
              <button className="map-control-btn" onClick={getUserLocation} title="Find Near Me">
                <Locate size={18} />
              </button>
              <button className="map-control-btn" onClick={() => setShowNearBy(!showNearBy)} title="Nearby Places">
                <MapPinned size={18} />
              </button>
              <button className="map-control-btn" onClick={() => setShowDirections(!showDirections)} title="Directions">
                <Navigation size={18} />
              </button>
            </div>

            {/* Near By Panel */}
            {showNearBy && (
              <div className="nearby-panel">
                <div className="nearby-header">
                  <h4>Near Your Location</h4>
                  <button onClick={() => setShowNearBy(false)}><X size={16} /></button>
                </div>
                <div className="nearby-list">
                  {nearbyPlacesList.length > 0 ? (
                    nearbyPlacesList.map((place, idx) => (
                      <div key={idx} className="nearby-item" onClick={() => {
                        map.current.flyTo({ center: [place.lng, place.lat], zoom: 16 });
                        setShowNearBy(false);
                      }}>
                        <div className="nearby-icon">{getCategoryIcon(place.category)}</div>
                        <div className="nearby-info">
                          <span className="nearby-name">{place.name}</span>
                          <span className="nearby-category">{place.category}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="nearby-empty">No places found nearby. Make sure location is enabled.</p>
                  )}
                </div>
              </div>
            )}

            {/* Directions Panel */}
            {showDirections && (
              <div className="directions-panel">
                <div className="directions-header">
                  <h4>Navigation</h4>
                  <button onClick={() => setShowDirections(false)}><X size={16} /></button>
                </div>
                <div className="directions-list">
                  {getDirectionSteps().map((step, idx) => (
                    <div key={idx} className="direction-step">
                      <div className="step-number">{idx + 1}</div>
                      <div className="step-content">
                        <span className="step-instruction">{step.instruction}</span>
                        <span className="step-distance">{step.distance}</span>
                      </div>
                    </div>
                  ))}
                  {selectedStopIndex < currentTour.stops.length - 1 && (
                    <button className="navigate-btn" onClick={navigateToNextStop}>
                      <Navigation size={16} />
                      Start Navigation to Next Stop
                    </button>
                  )}
                  <button className="navigate-btn" onClick={() => showNavigationTo(selectedStopIndex)}>
                    <Navigation size={16} />
                    Show Full Route
                  </button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="map-legend">
              <div className="legend-item"><div className="legend-marker active"></div><span>Current</span></div>
              <div className="legend-item"><div className="legend-marker"></div><span>Upcoming</span></div>
              <div className="legend-item"><div className="legend-marker completed"></div><span>Visited</span></div>
            </div>
          </div>

          {/* Stop Navigation */}
          <div className="stop-navigation">
            <button className="nav-btn" onClick={() => setSelectedStopIndex(Math.max(0, selectedStopIndex - 1))} disabled={selectedStopIndex === 0}>
              <ChevronLeft size={20} />
            </button>
            
            <div className="stop-indicators">
              {currentTour.stops.map((stop, idx) => (
                <button
                  key={idx}
                  className={`stop-indicator ${idx === selectedStopIndex ? 'active' : ''} ${idx < selectedStopIndex ? 'completed' : ''}`}
                  onClick={() => { setSelectedStopIndex(idx); showNavigationTo(idx); }}
                  title={stop.name}
                >
                  <span className="indicator-number">{idx < selectedStopIndex ? '✓' : idx + 1}</span>
                </button>
              ))}
            </div>
            
            <button className="nav-btn" onClick={() => setSelectedStopIndex(Math.min(currentTour.stops.length - 1, selectedStopIndex + 1))} disabled={selectedStopIndex === currentTour.stops.length - 1}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Right: Details Panel */}
        <div className="tour-details-section">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Info size={16} />Overview
            </button>
            <button className={`tab-btn ${activeTab === 'stops' ? 'active' : ''}`} onClick={() => setActiveTab('stops')}>
              <MapPin size={16} />Stops
            </button>
            <button className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`} onClick={() => setActiveTab('adjust')}>
              <Zap size={16} />Adjust
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane overview-pane">
                <div className="current-stop-card">
                  <div className="stop-badge">
                    <span className="stop-number-badge">{selectedStopIndex + 1}</span>
                    <span className="stop-total">of {currentTour.stops.length}</span>
                  </div>
                  
                  <h2 className="stop-name">{currentStop.name}</h2>
                  <p className="stop-description">{currentStop.description}</p>

                  <div className="stop-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span className="meta-label">Explore:</span>
                      <span className="meta-value">{currentStop.visit_minutes || 20} min</span>
                    </div>
                    {currentStop.walk_time_to_next && (
                      <div className="meta-item">
                        <Footprints size={16} />
                        <span className="meta-label">Walk:</span>
                        <span className="meta-value">{currentStop.walk_time_to_next} min</span>
                      </div>
                    )}
                  </div>

                  <div className="stop-tags">
                    {currentStop.categories && currentStop.categories.map((cat, idx) => (
                      <span key={idx} className="tag">{getCategoryIcon(cat)}{cat}</span>
                    ))}
                  </div>

                  {/* Navigation Button */}
                  {selectedStopIndex < currentTour.stops.length - 1 && (
                    <button className="nav-to-stop-btn" onClick={() => showNavigationTo(selectedStopIndex + 1)}>
                      <Navigation size={16} />
                      Get Directions to Next Stop
                    </button>
                  )}
                </div>

                {/* Next Stop Preview */}
                {selectedStopIndex < currentTour.stops.length - 1 && (
                  <div className="next-stop-card">
                    <div className="next-stop-header">
                      <span className="next-label">Next Stop</span>
                      <span className="next-walk-time">
                        <Footprints size={14} />{currentStop.walk_time_to_next || '~5'} min
                      </span>
                    </div>
                    <h3 className="next-stop-name">{currentTour.stops[selectedStopIndex + 1].name}</h3>
                    {currentStop.transition_to_next && <p className="transition-hint">{currentStop.transition_to_next}</p>}
                  </div>
                )}

                <div className="progress-section">
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{ width: `${((selectedStopIndex + 1) / currentTour.stops.length) * 100}%` }}></div>
                  </div>
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>{selectedStopIndex + 1} / {currentTour.stops.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stops Tab */}
            {activeTab === 'stops' && (
              <div className="tab-pane stops-pane">
                <div className="stops-list">
                  {currentTour.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className={`stop-item ${idx === selectedStopIndex ? 'active' : ''} ${idx < selectedStopIndex ? 'completed' : ''}`}
                      onClick={() => { setSelectedStopIndex(idx); showNavigationTo(idx); }}
                    >
                      <div className="stop-item-number">
                        {idx < selectedStopIndex ? <Check size={16} /> : idx + 1}
                      </div>
                      <div className="stop-item-content">
                        <h4 className="stop-item-name">{stop.name}</h4>
                        <div className="stop-item-meta">
                          <span><Clock size={12} /> {stop.visit_minutes || 20} min</span>
                          {stop.categories && stop.categories.slice(0, 2).map((cat, i) => (
                            <span key={i} className="category-pill">{cat}</span>
                          ))}
                        </div>
                      </div>
                      <button className="nav-to-btn" onClick={(e) => { e.stopPropagation(); showNavigationTo(idx); }}>
                        <Navigation size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adjust Tab */}
            {activeTab === 'adjust' && (
              <div className="tab-pane adjust-pane">
                <div className="adjustment-options">
                  <div className="adjust-group">
                    <h3 className="adjust-title"><Zap size={18} />Quick Adjustments</h3>
                    
                    <button className="adjust-btn" onClick={() => handleAdjustTour('TIRED')} disabled={loading}>
                      <div className="adjust-icon tired"><Minus size={20} /></div>
                      <div className="adjust-content">
                        <span className="adjust-label">Shorten Tour</span>
                        <span className="adjust-desc">I'm getting tired</span>
                      </div>
                    </button>

                    <button className="adjust-btn" onClick={() => handleAdjustTour('MORE_INTEREST', 'food')} disabled={loading}>
                      <div className="adjust-icon food"><Utensils size={20} /></div>
                      <div className="adjust-content">
                        <span className="adjust-label">Add Food</span>
                        <span className="adjust-desc">Find places to eat</span>
                      </div>
                    </button>

                    <button className="adjust-btn" onClick={() => handleAdjustTour('MORE_INTEREST', 'coffee')} disabled={loading}>
                      <div className="adjust-icon coffee"><Coffee size={20} /></div>
                      <div className="adjust-content">
                        <span className="adjust-label">Coffee Break</span>
                        <span className="adjust-desc">Need caffeine</span>
                      </div>
                    </button>

                    <button className="adjust-btn" onClick={() => handleAdjustTour('TOO_CROWDED')} disabled={loading}>
                      <div className="adjust-icon quiet"><Users size={20} /></div>
                      <div className="adjust-content">
                        <span className="adjust-label">Less Crowded</span>
                        <span className="adjust-desc">Find quieter spots</span>
                      </div>
                    </button>
                  </div>

                  {adjustmentMessage && (
                    <div className={`adjust-message ${adjustmentMessage.includes('Could not') ? 'error' : 'success'}`}>
                      {adjustmentMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumTourDisplay;
