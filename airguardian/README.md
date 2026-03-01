# 🌬️ AirGuardian — Chicago Real-Time Air Quality App

> A real-time PM2.5 air quality monitoring and routing app for Chicago, built for residents with respiratory conditions. Features live sensor data, pollution-optimized routing, personalized health risk scoring, and an AI-powered chat assistant.

![AirGuardian Screenshot](https://i.imgur.com/placeholder.png)

---

## ✨ Features

- **🗺️ Live Heatmap** — Hex-grid interpolated PM2.5 visualization across 90 Chicago-area sensors via OpenAQ
- **🛣️ Clean Route Planner** — Compare fastest vs. lowest-pollution routes using OSRM routing + Turf.js IDW interpolation
- **🩺 Personal Health Risk Score** — Personalized 1–10 risk score based on your conditions (asthma, COPD, heart disease, etc.) and commute type
- **🤖 AI Chat Assistant** — Claude-powered conversational AI with live sensor context for neighborhood-specific advice
- **📡 Real-Time Data** — Live OpenAQ V3 API with 5-minute cache refresh and 429 rate-limit protection

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Leaflet.js, Mapbox tiles |
| Mapping | Turf.js (IDW interpolation), OSRM (routing) |
| Data | OpenAQ V3 API (90 Chicago PM2.5 sensors) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Proxy | Express.js (CORS proxy + cache server) |

---

## 📁 Project Structure

```
airguardian/
├── src/
│   ├── App.js                        # Main app, map config, state
│   ├── index.css                     # Global styles
│   ├── services/
│   │   └── airQuality.js             # OpenAQ data fetching + PM2.5 risk utils
│   ├── components/
│   │   ├── HeatmapLayer.js           # Hex grid + Turf.js interpolation
│   │   ├── RoutePlanner.js           # Clean route finder
│   │   ├── Legend.js                 # PM2.5 AQI legend
│   │   ├── StatsBar.js               # Live stats (avg, sensor count, worst area)
│   │   ├── HealthProfile.js          # Onboarding + personalized risk badge
│   │   └── AirChat.js                # Claude AI chat with live data context
│   └── proxy/
│       ├── server.js                 # Express proxy (OpenAQ + Anthropic)
│       └── package.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- A free [OpenAQ API key](https://explore.openaq.org) 
- A free [Anthropic API key](https://console.anthropic.com)
- A free [Mapbox token](https://mapbox.com)

### 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/airguardian.git
cd airguardian
```

### 2 — Install React dependencies

```bash
npm install
```

### 3 — Install proxy dependencies

```bash
cd src/proxy
npm install
```

### 4 — Add your API keys

Open `src/proxy/server.js` and replace the placeholders:

```javascript
const OPENAQ_API_KEY    = 'YOUR_OPENAQ_KEY_HERE';
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_KEY_HERE';
```

Open `src/App.js` and replace the Mapbox token:

```javascript
url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN'
```

### 5 — Run the app (two terminals required)

**Terminal 1 — Start the proxy server:**
```bash
cd airguardian/src/proxy
node server.js
```

Wait until you see:
```
✅ Proxy running on http://localhost:3001
✅ Done: 87 live stations    ← wait for this line
```

**Terminal 2 — Start the React app:**
```bash
cd airguardian
npm start
```

Open [http://localhost:3000](http://localhost:3000)

> ⚠️ Always start the proxy **before** opening the React app so the cache is pre-warmed and you see live data immediately.

---

## 🔑 API Keys — Where to Get Them

| Key | Where | Cost |
|---|---|---|
| OpenAQ | [explore.openaq.org](https://explore.openaq.org) → Sign Up → Profile → API Keys | Free |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key | Free tier available |
| Mapbox | [mapbox.com](https://mapbox.com) → Account → Tokens | Free tier available |

---

## 🧠 How It Works

### Data Pipeline
```
proxy/server.js
  → fetches 100 locations from OpenAQ V3 (Chicago bbox)
  → extracts PM2.5 sensor IDs
  → fetches latest reading per sensor (sequential, 300ms delay)
  → caches for 5 minutes
  → auto-refreshes every 5 minutes via setInterval

React app
  → calls localhost:3001/api/airquality
  → always gets instant cache response
  → renders heatmap via Turf.js IDW interpolation
```

### Health Risk Score
```
Base risk (from city avg PM2.5)
  × condition multiplier (asthma 1.6×, COPD 1.7×, heart 1.4×...)
  × activity multiplier (cycling 1.5×, walking 1.3×, driving 0.6×...)
  = personalized score (1–10)
```

### AI Chat Context
Every Claude query is injected with:
- Live worst/best 5 neighborhoods
- City average PM2.5
- User's health profile (conditions + commute type)

---

## 🌐 Proxy Architecture

The Express proxy at `localhost:3001` solves two problems:

1. **CORS** — Browsers block direct calls to OpenAQ and Anthropic APIs
2. **API Key Security** — Keys stay on the server, never exposed to the browser

```
React (3000)  →  proxy/server.js (3001)  →  OpenAQ API
                                          →  Anthropic API
```

---

## ⚙️ Environment Notes

- Source map warnings from the `arc` package are harmless — suppress with `GENERATE_SOURCEMAP=false` in `.env`
- The proxy fetches all 90 sensors sequentially with 300ms delays to avoid OpenAQ 429 rate limits
- First load after proxy start is instant because `fetchLiveData()` runs on startup to pre-warm the cache

---

## 🔒 Security

**Never commit your API keys.** Add this to your `.gitignore`:

```
src/proxy/.env
```

Or better — move keys to environment variables:

```javascript
const OPENAQ_API_KEY = process.env.OPENAQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
```

---

## 📜 License

MIT — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [OpenAQ](https://openaq.org) — open air quality data platform
- [Anthropic](https://anthropic.com) — Claude AI API
- [Turf.js](https://turfjs.org) — geospatial analysis
- [Leaflet.js](https://leafletjs.com) — interactive maps
- [OSRM](http://project-osrm.org) — open source routing