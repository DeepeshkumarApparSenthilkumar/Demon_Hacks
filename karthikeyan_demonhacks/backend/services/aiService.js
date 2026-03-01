const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate AI description for a POI
 * @param {Object} poi - The POI object
 * @param {Array<string>} userInterests - User's interests
 * @returns {Promise<string>} - AI-generated description
 */
async function generatePOIDescription(poi, userInterests) {
  try {
    const prompt = `You are a friendly tour guide. Generate a short, engaging 1-3 sentence description for this location that would appeal to someone interested in: ${userInterests.join(', ')}.

Location: ${poi.name}
Type: ${poi.categories.join(', ')}
Fact: ${poi.short_fact}

Make it warm, conversational, and exciting. Focus on what makes this place special for the visitor.`;

    const message = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.choices[0].message.content || poi.short_fact;
  } catch (error) {
    console.error('Error generating POI description:', error);
    // Fallback to short_fact
    return poi.short_fact;
  }
}

/**
 * Generate AI transition text between two stops
 * @param {Object} currentPoi - Current POI
 * @param {Object} nextPoi - Next POI
 * @param {number} walkTimeMinutes - Estimated walk time
 * @param {Array<string>} userInterests - User's interests
 * @returns {Promise<string>} - AI-generated transition text
 */
async function generateTransition(currentPoi, nextPoi, walkTimeMinutes, userInterests) {
  try {
    const prompt = `You are a friendly tour guide. Generate a 1-2 sentence transition from one location to another. Keep it conversational and engaging.

From: ${currentPoi.name} (${currentPoi.categories.join(', ')})
To: ${nextPoi.name} (${nextPoi.categories.join(', ')})
Walk time: about ${walkTimeMinutes} minutes
User interests: ${userInterests.join(', ')}

Make it feel natural and tie it back to the user's interests if possible. Example tone: "Just a short 5-minute stroll away, you'll find..."`;

    const message = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.choices[0].message.content 
      ? message.choices[0].message.content 
      : `Head to ${nextPoi.name} next, about ${walkTimeMinutes} minutes away.`;
  } catch (error) {
    console.error('Error generating transition:', error);
    // Fallback text
    return `Head to ${nextPoi.name} next, about ${walkTimeMinutes} minutes away.`;
  }
}

/**
 * Generate tour summary
 * @param {Array<Object>} stops - Selected POIs
 * @param {number} totalDistance - Total walking distance in km
 * @param {number} totalTime - Total time in minutes
 * @param {Array<string>} userInterests - User's interests
 * @returns {Promise<string>} - AI-generated summary
 */
async function generateTourSummary(stops, totalDistance, totalTime, userInterests) {
  try {
    const stopNames = stops.map(s => s.name).join(', ');
    const theme = userInterests.slice(0, 2).join(' + ');

    const prompt = `You are a tour guide creating an exciting summary for a walking tour. Generate a 2-4 sentence overview that hooks the visitor.

Tour stops: ${stopNames}
Theme: ${theme}
Total time: about ${totalTime} minutes
Distance: about ${totalDistance.toFixed(1)} km

Make it enticing and set expectations for what they'll experience. Be specific about what makes this tour special.`;

    const message = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.choices[0].message.content 
      ? message.choices[0].message.content 
      : `A ${theme} tour covering ${stops.length} amazing locations in about ${totalTime} minutes.`;
  } catch (error) {
    console.error('Error generating tour summary:', error);
    const theme = userInterests.slice(0, 2).join(' + ');
    return `A ${theme} tour covering ${stops.length} amazing locations in about ${totalTime} minutes.`;
  }
}

module.exports = {
  generatePOIDescription,
  generateTransition,
  generateTourSummary
};
