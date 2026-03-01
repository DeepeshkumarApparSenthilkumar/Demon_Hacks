const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

const OPENAQ_API_KEY    = process.env.OPENAQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Cache — prevents 429 rate limit errors
let cachedData = null;
let cacheTime  = null;
let isFetching = false;
const CACHE_MS = 5 * 60 * 1000;

// ── Fetch all PM2.5 sensors (single clean run) ──
const fetchLiveData = async () => {
  if (isFetching) return;
  isFetching = true;

  try {
    const locResponse = await axios.get('https://api.openaq.org/v3/locations', {
      params: { bbox: '-88.30,41.55,-87.30,42.15', limit: 100 },
      headers: { Accept: 'application/json', 'X-API-Key': OPENAQ_API_KEY },
      timeout: 12000,
    });

    const locations = locResponse.data?.results || [];
    console.log(`Found ${locations.length} locations`);

    const pm25Sensors = [];
    locations.forEach(location => {
      const sensor = location.sensors?.find(s => s.parameter?.name === 'pm25');
      if (sensor && location.coordinates?.latitude && location.coordinates?.longitude) {
        pm25Sensors.push({
          sensorId:     sensor.id,
          locationName: location.name || 'OpenAQ Sensor',
          latitude:     location.coordinates.latitude,
          longitude:    location.coordinates.longitude,
        });
      }
    });

    console.log(`Found ${pm25Sensors.length} PM2.5 sensors — fetching readings...`);

    const results = [];
    for (let i = 0; i < pm25Sensors.length; i++) {
      const sensor = pm25Sensors[i];
      let retries = 2;

      while (retries >= 0) {
        try {
          const r = await axios.get(
            `https://api.openaq.org/v3/sensors/${sensor.sensorId}/measurements`,
            {
              params: { limit: 1, order_by: 'datetime', sort_order: 'desc' },
              headers: { Accept: 'application/json', 'X-API-Key': OPENAQ_API_KEY },
              timeout: 8000,
            }
          );
          const value = r.data?.results?.[0]?.value;
          if (value !== null && value !== undefined && value >= 0 && value < 1000) {
            results.push({
              location:  sensor.locationName,
              latitude:  sensor.latitude,
              longitude: sensor.longitude,
              pm25:      parseFloat(value).toFixed(1),
            });
            console.log(`✓ [${i+1}/${pm25Sensors.length}] ${sensor.locationName}: ${value} μg/m³`);
          }
          break;

        } catch (e) {
          if (e.response?.status === 429 && retries > 0) {
            console.log(`⏳ Rate limited — waiting 10s...`);
            await new Promise(r => setTimeout(r, 10000));
            retries--;
          } else {
            console.log(`✗ Skipped ${sensor.locationName}`);
            break;
          }
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    cachedData = results;
    cacheTime  = Date.now();
    console.log(`\n✅ Done: ${results.length} live stations`);

  } catch (err) {
    console.error('Fetch error:', err.message);
  } finally {
    isFetching = false;
  }
};

// ── Air quality route ──
app.get('/api/airquality', async (req, res) => {
  // Serve cache if fresh
  if (cachedData && cacheTime && (Date.now() - cacheTime) < CACHE_MS) {
    console.log(`Cache hit: ${cachedData.length} stations`);
    return res.json({ stations: cachedData });
  }

  // If fetch is running, wait for it then serve
  if (isFetching) {
    console.log('Fetch running — waiting...');
    while (isFetching) {
      await new Promise(r => setTimeout(r, 1000));
    }
    return res.json({ stations: cachedData || [] });
  }

  // Trigger fresh fetch — respond immediately with stale/empty
  // React will auto-refresh in 5 min anyway
  fetchLiveData();
  return res.json({ stations: cachedData || [] });
});

// ── Debug route ──
app.get('/debug', async (req, res) => {
  res.json({
    cached:      cachedData?.length || 0,
    isFetching,
    cacheAge:    cacheTime ? Math.round((Date.now() - cacheTime) / 1000) + 's ago' : 'never',
    nextRefresh: cacheTime ? Math.round((CACHE_MS - (Date.now() - cacheTime)) / 1000) + 's' : 'now',
  });
});

// ── Claude AI chat ──
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      { model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages },
      {
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Claude error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Claude API failed' });
  }
});

// ── Start server and pre-warm cache ──
app.listen(3001, () => {
  console.log('✅ Proxy running on http://localhost:3001');
  console.log('⏳ Pre-warming cache — wait for ✅ Done before opening React...\n');
  fetchLiveData();
});

// Auto-refresh cache every 5 minutes
setInterval(() => {
  console.log('\n🔄 Auto-refreshing cache...');
  fetchLiveData();
}, CACHE_MS);