const express = require('express');
const router = express.Router();
const routeService = require('../services/routeService');
const aiService = require('../services/aiService');

/**
 * POST /api/tours/generate
 * Generate a new tour based on user preferences
 */
router.post('/generate', async (req, res) => {
  try {
    const preferences = req.body;

    // Validate required fields
    if (!preferences.time_available_minutes || !preferences.start_location) {
      return res.status(400).json({ 
        error: 'Missing required fields: time_available_minutes, start_location' 
      });
    }

    // Generate base route
    const stops = routeService.generateRoute(preferences);

    if (stops.length === 0) {
      return res.status(400).json({ 
        error: 'Could not generate a tour with given constraints' 
      });
    }

    // Calculate total stats
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      totalDistance += stop.distance_to_here || 0;
      totalDuration += stop.walk_time_to_here || 0;
      totalDuration += stop.average_visit_minutes;
    }

    // Generate AI descriptions and transitions
    const enrichedStops = [];
    const userInterests = preferences.interests || [];

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      
      // Generate POI description
      const description = await aiService.generatePOIDescription(stop, userInterests);

      let transitionToNext = null;
      if (i < stops.length - 1) {
        const nextStop = stops[i + 1];
        const walkTime = nextStop.walk_time_to_here || 5;
        transitionToNext = await aiService.generateTransition(
          stop, 
          nextStop, 
          walkTime, 
          userInterests
        );
      }

      enrichedStops.push({
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        description,
        short_fact: stop.short_fact,
        categories: stop.categories,
        crowd_level: stop.crowd_level,
        visit_minutes: stop.average_visit_minutes,
        order: stop.order,
        transition_to_next: transitionToNext,
        walk_time_to_next: stop.walk_time_to_next || null,
        walk_time_to_here: stop.walk_time_to_here || null,
        distance_to_here: stop.distance_to_here || null
      });
    }

    // Generate tour summary
    const summary = await aiService.generateTourSummary(
      enrichedStops,
      totalDistance,
      totalDuration,
      userInterests
    );

    res.json({
      summary,
      total_distance_km: Math.round(totalDistance * 100) / 100,
      total_duration_minutes: totalDuration,
      stops: enrichedStops
    });

  } catch (error) {
    console.error('Error generating tour:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tours/adjust
 * Adjust an existing tour based on user feedback
 */
router.post('/adjust', async (req, res) => {
  try {
    const { current_stop_id, remaining_time_minutes, adjustment_type, adjustment_interest, original_preferences } = req.body;

    if (!current_stop_id || !remaining_time_minutes || !original_preferences) {
      return res.status(400).json({ 
        error: 'Missing required fields: current_stop_id, remaining_time_minutes, original_preferences' 
      });
    }

    // Handle adjustment based on type
    let adjustedPreferences = { ...original_preferences };

    if (adjustment_type === 'TIRED') {
      // Reduce remaining time and distance
      adjustedPreferences.time_available_minutes = Math.round(remaining_time_minutes * 0.6);
      adjustedPreferences.walking_tolerance = 'VERY_LIGHT';
    } else if (adjustment_type === 'MORE_INTEREST' && adjustment_interest) {
      // Add the new interest
      adjustedPreferences.interests = [...(adjustedPreferences.interests || []), adjustment_interest];
    } else if (adjustment_type === 'TOO_CROWDED') {
      // Prefer quiet places
      adjustedPreferences.crowd_preference = 'QUIET';
    }

    // Regenerate route from current position
    const pois = require('../data/pois.json');
    const currentStop = pois.find(p => p.id === current_stop_id);

    if (!currentStop) {
      return res.status(404).json({ error: 'Current stop not found' });
    }

    adjustedPreferences.start_location = {
      lat: currentStop.lat,
      lng: currentStop.lng
    };

    // Generate new route
    const newStops = routeService.generateRoute(adjustedPreferences);

    if (newStops.length === 0) {
      return res.status(400).json({ 
        error: 'Could not regenerate tour with adjusted constraints' 
      });
    }

    // Calculate new stats
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < newStops.length; i++) {
      const stop = newStops[i];
      totalDistance += stop.distance_to_here || 0;
      totalDuration += stop.walk_time_to_here || 0;
      totalDuration += stop.average_visit_minutes;
    }

    // Enrich with AI content
    const enrichedStops = [];
    const userInterests = adjustedPreferences.interests || [];

    for (let i = 0; i < newStops.length; i++) {
      const stop = newStops[i];
      const description = await aiService.generatePOIDescription(stop, userInterests);

      let transitionToNext = null;
      if (i < newStops.length - 1) {
        const nextStop = newStops[i + 1];
        const walkTime = nextStop.walk_time_to_here || 5;
        transitionToNext = await aiService.generateTransition(
          stop, 
          nextStop, 
          walkTime, 
          userInterests
        );
      }

      enrichedStops.push({
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        description,
        short_fact: stop.short_fact,
        categories: stop.categories,
        crowd_level: stop.crowd_level,
        visit_minutes: stop.average_visit_minutes,
        order: stop.order,
        transition_to_next: transitionToNext,
        walk_time_to_next: stop.walk_time_to_next || null,
        walk_time_to_here: stop.walk_time_to_here || null,
        distance_to_here: stop.distance_to_here || null
      });
    }

    const summary = await aiService.generateTourSummary(
      enrichedStops,
      totalDistance,
      totalDuration,
      userInterests
    );

    res.json({
      summary,
      total_distance_km: Math.round(totalDistance * 100) / 100,
      total_duration_minutes: totalDuration,
      stops: enrichedStops,
      adjustment_applied: adjustment_type,
      remaining_stops: enrichedStops.length
    });

  } catch (error) {
    console.error('Error adjusting tour:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
