import { Handler } from '@netlify/functions';
import Groq from 'groq-sdk';
import axios from 'axios';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_string',
});
const isGroqEnabled = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'dummy_string';

// Real-time weather data fetching
async function getWeatherData(location: string) {
    try {
        const apiKey = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
        if (!apiKey) {
            // Mock weather data for demo
            return {
                temp: Math.floor(Math.random() * 30) + 50,
                conditions: ['Clear', 'Cloudy', 'Light Rain', 'Snow'][Math.floor(Math.random() * 4)],
                wind: Math.floor(Math.random() * 20) + 5,
                humidity: Math.floor(Math.random() * 40) + 40
            };
        }
        
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`);
        return {
            temp: Math.round(response.data.main.temp),
            conditions: response.data.weather[0].description,
            wind: response.data.wind.speed,
            humidity: response.data.main.humidity
        };
    } catch (error) {
        console.error('Weather API error:', error);
        return {
            temp: 65,
            conditions: 'Partly Cloudy',
            wind: 10,
            humidity: 60
        };
    }
}

// Location insights
async function getLocationInsights(address: string) {
    // Mock location data for Chicago area
    const neighborhoods = ['Loop', 'River North', 'Lincoln Park', 'Lakeview', 'Wicker Park'];
    const ctaLines = ['Red Line', 'Blue Line', 'Brown Line', 'Green Line', 'Orange Line'];
    const stations = ['Clark/Lake', 'State/Lake', 'Washington/Wabash', 'Monroe', 'Jackson'];
    
    return {
        neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
        nearestCTA: ctaLines[Math.floor(Math.random() * ctaLines.length)],
        station: stations[Math.floor(Math.random() * stations.length)],
        ridership: Math.floor(Math.random() * 30) + 70
    };
}

// Handler for all API routes
export const handler: Handler = async (event, context) => {
    const { path, httpMethod, body } = event;
    
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const data = body ? JSON.parse(body) : {};
        
        if (path === '/api/extract' && httpMethod === 'POST') {
            const prompt = `Extract business profile from this input: "${data.input}"
            Return JSON with: name, type, address, staffCount (number), peakHours, primaryPainPoint`;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3
            });
            
            const extracted = JSON.parse(completion.choices[0]?.message?.content || '{}');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ isComplete: true, extractedData: extracted })
            };
        }
        
        if (path === '/api/demand' && httpMethod === 'POST') {
            const profile = data.profile;
            const [weatherData, locationInsights] = await Promise.all([
                getWeatherData(profile?.address || 'Chicago, IL'),
                getLocationInsights(profile?.address || 'Chicago, IL')
            ]);
            
            const prompt = `Generate demand prediction for ${profile?.name} (${profile?.type}) at ${profile?.address}
            Weather: ${weatherData.temp}°F, ${weatherData.conditions}
            Transit: ${locationInsights.nearestCTA} at ${locationInsights.station}
            
            Return JSON with: score (0-100), tier (SLOW/NORMAL/BUSY/CRITICAL), peakHour, staffRec, insights, weather, cta`;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                response_format: { type: "json_object" }
            });
            
            const demand = JSON.parse(completion.choices[0]?.message?.content || '{}');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(demand)
            };
        }
        
        if (path === '/api/insights' && httpMethod === 'POST') {
            const profile = data.profile;
            const demandData = data.demandData;
            
            const prompt = `Generate comprehensive business insights for ${profile?.name}
            Return JSON with: businessHealth, revenueOptimization, competitiveAdvantages, growthOpportunities, riskMitigation, techRecommendations, customerExperience, marketTrends, actionPlan`;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
            
            const insights = JSON.parse(completion.choices[0]?.message?.content || '{}');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(insights)
            };
        }
        
        if (path === '/api/competitors' && httpMethod === 'POST') {
            const profile = data.profile;
            
            const prompt = `Generate competitor analysis for ${profile?.name} (${profile?.type}) at ${profile?.address}
            Return JSON with: marketOverview, competitors, competitivePositioning, swotAnalysis, strategicRecommendations, marketGaps`;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                response_format: { type: "json_object" }
            });
            
            const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(analysis)
            };
        }
        
        if (path === '/api/alerts' && httpMethod === 'POST') {
            const profile = data.profile;
            
            const [weatherData, locationInsights] = await Promise.all([
                getWeatherData(profile?.address || 'Chicago, IL'),
                getLocationInsights(profile?.address || 'Chicago, IL')
            ]);
            
            const prompt = `Generate 1-3 real-time alerts for ${profile?.name}
            Weather: ${weatherData.temp}°F, ${weatherData.conditions}
            Transit: ${locationInsights.nearestCTA} at ${locationInsights.station}
            
            Return JSON with: alerts array containing id, type, severity, title, message, action, timestamp`;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                response_format: { type: "json_object" }
            });
            
            const alerts = JSON.parse(completion.choices[0]?.message?.content || '{"alerts": []}');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(alerts)
            };
        }
        
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: "Endpoint not found" })
        };
        
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal server error" })
        };
    }
};
