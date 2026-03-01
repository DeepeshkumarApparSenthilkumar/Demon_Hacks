const pois = require('../data/pois.json');

/**
 * Calculate distance between two points using Haversine formula (in km)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert walking tolerance to max distance in km
 */
function getMaxDistance(tolerance) {
  const toleranceMap = {
    'VERY_LIGHT': 2.0,
    'MODERATE': 5.0,
    'A_LOT': 10.0
  };
  return toleranceMap[tolerance] || 5.0;
}

/**
 * Calculate estimated walk time between two points (in minutes)
 * Assume average walking speed of 1.4 m/s (5 km/h)
 */
function getWalkTime(distanceKm) {
  return Math.round((distanceKm / 5) * 60);
}

/**
 * Filter POIs by user interests
 */
function filterByInterests(allPois, interests) {
  if (!interests || interests.length === 0) return allPois;
  
  return allPois.map(poi => {
    // Calculate interest match score
    const matches = poi.categories.filter(cat => 
      interests.some(interest => interest.toLowerCase().includes(cat.toLowerCase()) || 
                                cat.toLowerCase().includes(interest.toLowerCase()))
    ).length;
    return { ...poi, interestScore: matches };
  }).sort((a, b) => b.interestScore - a.interestScore);
}

/**
 * Filter POIs by crowd preference
 */
function filterByCrowd(allPois, crowdPref) {
  if (crowdPref === 'ANY') return allPois;
  
  if (crowdPref === 'QUIET') {
    return allPois.filter(p => p.crowd_level === 'LOW' || p.crowd_level === 'MEDIUM');
  }
  
  if (crowdPref === 'BALANCED') {
    return allPois.filter(p => p.crowd_level !== 'HIGH');
  }
  
  return allPois; // "I_DONT_MIND" - include all
}

/**
 * Generate optimal route using nearest neighbor + greedy selection
 * @param {Object} preferences - User preferences
 * @returns {Array<Object>} - Ordered list of selected POIs
 */
function generateRoute(preferences) {
  const {
    time_available_minutes,
    walking_tolerance,
    interests,
    custom_interest_text,
    crowd_preference,
    start_location
  } = preferences;

  // Combine interests
  const allInterests = [...(interests || [])];
  if (custom_interest_text && custom_interest_text.trim()) {
    allInterests.push(custom_interest_text);
  }

  // Filter and sort by interests
  let candidates = filterByInterests(pois, allInterests);
  
  // Filter by crowd preference
  candidates = filterByCrowd(candidates, crowd_preference);

  // Greedy selection: start at user location, add nearby POIs until time/distance exhausted
  const maxDistance = getMaxDistance(walking_tolerance);
  let selectedRoute = [];
  let currentLat = start_location.lat;
  let currentLng = start_location.lng;
  let totalTime = 0;
  let totalDistance = 0;
  const usedIds = new Set();

  while (selectedRoute.length < 6 && candidates.length > 0) {
    // Find nearest unvisited POI
    let nearestPoi = null;
    let nearestDistance = Infinity;

    for (const candidate of candidates) {
      if (usedIds.has(candidate.id)) continue;
      
      const dist = calculateDistance(currentLat, currentLng, candidate.lat, candidate.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestPoi = candidate;
      }
    }

    if (!nearestPoi) break;

    const walkTime = getWalkTime(nearestDistance);
    const totalTimeIfAdded = totalTime + walkTime + nearestPoi.average_visit_minutes;
    const totalDistanceIfAdded = totalDistance + nearestDistance;

    // Check if adding this POI would exceed constraints
    if (totalDistanceIfAdded <= maxDistance && totalTimeIfAdded <= time_available_minutes) {
      selectedRoute.push({
        ...nearestPoi,
        order: selectedRoute.length + 1,
        walk_time_to_here: walkTime,
        distance_to_here: nearestDistance
      });
      usedIds.add(nearestPoi.id);
      totalTime = totalTimeIfAdded;
      totalDistance = totalDistanceIfAdded;
      currentLat = nearestPoi.lat;
      currentLng = nearestPoi.lng;
    } else {
      // Try next nearest if this one doesn't fit
      candidates = candidates.filter(c => c.id !== nearestPoi.id);
    }
  }

  // If no route found, return top 3-4 by interest score
  if (selectedRoute.length === 0) {
    selectedRoute = candidates.slice(0, 4).map((poi, idx) => ({
      ...poi,
      order: idx + 1,
      walk_time_to_here: 5,
      distance_to_here: 0.5
    }));
  }

  // Add walk_time_to_next for each stop (except the last one)
  for (let i = 0; i < selectedRoute.length - 1; i++) {
    const currentStop = selectedRoute[i];
    const nextStop = selectedRoute[i + 1];
    const distToNext = calculateDistance(currentStop.lat, currentStop.lng, nextStop.lat, nextStop.lng);
    selectedRoute[i].walk_time_to_next = getWalkTime(distToNext);
  }

  return selectedRoute;
}

/**
 * Regenerate route from a given stop
 */
function regenerateRouteFromStop(currentStopId, remainingMinutes, userPreferences) {
  const currentStop = pois.find(p => p.id === currentStopId);
  if (!currentStop) {
    throw new Error('Current stop not found');
  }

  // Create new preferences starting from current stop
  const newPreferences = {
    ...userPreferences,
    time_available_minutes: remainingMinutes,
    start_location: {
      lat: currentStop.lat,
      lng: currentStop.lng
    }
  };

  return generateRoute(newPreferences);
}

module.exports = {
  calculateDistance,
  getMaxDistance,
  getWalkTime,
  filterByInterests,
  filterByCrowd,
  generateRoute,
  regenerateRouteFromStop
};
