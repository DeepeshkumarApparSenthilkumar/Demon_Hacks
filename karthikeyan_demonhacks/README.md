# 🗺️ LoopTour - Interactive City Walking Tours

> **Adaptive walking tours that change in real time based on your mood, energy, and interests**

## 🎯 Quick Start

### Prerequisites
- Node.js 25.7.0+
- Mapbox account (free)
- Groq API key

### 1. Setup Environment
```bash
# Frontend - Add to frontend/.env.local
REACT_APP_MAPBOX_TOKEN=pk_your_mapbox_token

# Backend - Already has GROQ_API_KEY in .env
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 3. Open Browser
```
http://localhost:3000
```

---

## ✨ Features

### 🎨 Ultra-Interactive UI
- **Multi-step preference wizard** with smooth animations
- **Real-time Mapbox GL integration** with custom styling
- **Tab-based tour viewer** (Overview, Stops, Adjust)
- **Responsive design** for desktop, tablet, mobile
- **Purple gradient theme** with modern aesthetics

### 🤖 AI-Powered
- **Smart route generation** using nearest-neighbor algorithm
- **Groq Mixtral AI** for natural language descriptions
- **Adaptive preferences** - Time, interests, walking tolerance, crowd avoidance
- **Real-time adjustments** - Refine tours on the fly

### 🗺️ Interactive Map
- **Mapbox GL rendering** with clean styling
- **Color-coded markers** - Purple for stops, Pink for current
- **Animated pulsing marker** for active stop
- **Blue polyline route** showing exact walking path
- **Navigation controls** with zoom & geolocation

### 📱 Responsive Layout
- **Desktop**: 50/50 map + details split
- **Tablet**: Stacked vertical (60% map, 40% details)
- **Mobile**: Full-width with bottom panel

---

## 📁 Project Structure

```
looptour/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── tours.js          # API endpoints
│   ├── services/
│   │   ├── aiService.js      # Groq integration
│   │   └── routeService.js   # Route generation
│   ├── data/
│   │   └── pois.json         # 12 Chicago POIs
│   └── .env                  # Groq API key
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractivePreferenceForm.js
│   │   │   ├── InteractiveTourDisplay.js
│   │   │   ├── MapboxMap.js
│   │   │   └── *.css
│   │   ├── pages/
│   │   │   └── (legacy - replaced by components)
│   │   ├── services/
│   │   │   └── tourService.js      # API client
│   │   └── App.js
│   ├── .env.local            # Mapbox token
│   └── public/
│
├── INTERACTIVE_UI_GUIDE.md   # Detailed feature guide
├── UI_TRANSFORMATION.md       # Before/after comparison
└── README.md                  # This file
```

---

## 🎮 How to Use

### 1️⃣ Generate a Tour
1. Open **http://localhost:3000**
2. **Step 1**: Select time (30-240 minutes) using slider
3. **Step 2**: Pick 1+ interests (History, Food, Art, etc.)
4. **Step 3**: Choose walking level (Easy/Moderate/Adventurous)
5. **Step 4**: Set crowd preference (Quiet/Flexible/Busy)
6. Click **✨ Generate My Tour**

### 2️⃣ Explore the Tour
- **Map**: Shows all stops as markers with route
- **Overview Tab**: Tour summary + current stop details
- **Stops Tab**: Carousel of all stops (click any to jump)
- **Adjust Tab**: Quick buttons to refine the tour

### 3️⃣ Interact & Adjust
- Click any marker to jump to that stop
- Use adjustment buttons to add interests or reduce walking
- Watch the map update in real-time
- Click "Back" to create a new tour

---

## 🎨 UI/UX Highlights

| Component | Features |
|-----------|----------|
| **Preference Form** | Multi-step wizard, animated blobs, progress bar, emoji categories |
| **Mapbox Map** | Custom markers, polyline route, controls, geolocation |
| **Tab Panel** | 3 tabs with smooth transitions, responsive layout |
| **Cards** | Hero cards, stop cards, adjustment buttons with hover effects |
| **Colors** | Purple gradient (#667eea-#764ba2), pink accents, green/orange status |
| **Animations** | Slide-up, fade-in, scale, pulse, float effects |

---

## 🔧 Configuration

### Mapbox Setup
1. Visit [account.mapbox.com](https://account.mapbox.com/tokens/)
2. Sign up (free) → Create token
3. Copy token (starts with `pk_`)
4. Add to `frontend/.env.local`:
   ```
   REACT_APP_MAPBOX_TOKEN=pk_your_token_here
   ```

### Groq Setup
✅ **Already configured** in `backend/.env`
- API key: `your_groq_api_key_here`
- Model: `mixtral-8x7b-32768` (ultra-fast)

---

## 📊 API Endpoints

### POST `/api/tours/generate`
Generate a tour based on preferences
```json
{
  "available_minutes": 60,
  "interests": ["food", "art"],
  "walking_tolerance": "MODERATE",
  "crowd_preference": "ANY",
  "start_location": "Riverfront Coffee"
}
```

### POST `/api/tours/adjust`
Adjust an existing tour
```json
{
  "current_stop_id": "cloud-gate",
  "remaining_minutes": 45,
  "adjustment_type": "REDUCE_TIME",
  "adjustment_interest": null,
  "original_preferences": {...}
}
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'build/' folder

# Set environment variable:
REACT_APP_MAPBOX_TOKEN = pk_your_token
```

### Backend (Heroku/Railway/Render)
```bash
# Set environment variables:
GROQ_API_KEY = gsk_your_key
PORT = 5000
NODE_ENV = production

# Start:
npm run dev
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Map blank | Add REACT_APP_MAPBOX_TOKEN to .env.local |
| No markers | Verify tour has lat/lng properties |
| Form won't submit | Select ≥1 interest, check backend running |
| Slow inference | Groq uses fast inference (100-200ms typical) |
| CORS errors | Backend has CORS enabled on port 5000 |

---

## 🎓 Tech Stack

- **Frontend**: React 18, CSS3, Mapbox GL JS
- **Backend**: Express.js, Node.js
- **AI**: Groq API (Mixtral-8x7b-32768)
- **Routing**: Haversine formula, nearest-neighbor algorithm
- **Styling**: Gradient + glassmorphism

---

## 📈 Stats

- **Stops**: 12 Chicago POIs
- **Route time**: 30-240 minutes
- **Interests**: 8 categories
- **Tour variants**: 100+ possible combinations
- **AI speed**: ~150ms per description

---

## 🎯 Future Enhancements

- [ ] User authentication & profiles
- [ ] Save/share tours
- [ ] Real-time crowd data
- [ ] Street view integration
- [ ] Voice narration
- [ ] Dark mode
- [ ] Multiple cities
- [ ] Turn-by-turn navigation

---

## 📞 Support

**For issues:**
1. Check `INTERACTIVE_UI_GUIDE.md` for detailed help
2. Verify both servers are running
3. Check browser console for errors
4. Ensure API keys are set correctly
5. Try clearing cache and restarting

---

## 📝 License

Built for hackathon 🚀

---

## 👨‍💻 Made with

❤️ React • 🤖 Groq AI • 🗺️ Mapbox GL • ⚡ Express.js

**Start exploring. Discover your city. 🌍✨** - Adaptive City Walking Tours

Adaptive city walking tours that change in real time based on the user's time, energy, mood, and interests.

## 🎯 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Anthropic API key (for Claude AI integration)

### Setup

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

Backend runs on `http://localhost:5000`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## 🏗️ Project Structure

```
looptour/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   ├── .env.example              # Configuration template
│   ├── routes/
│   │   └── tours.js              # API endpoints
│   ├── services/
│   │   ├── routeService.js       # Route generation logic
│   │   └── aiService.js          # Claude AI integration
│   └── data/
│       └── pois.json             # Points of Interest database
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── PreferenceForm.js  # User input form
    │   │   └── TourDisplay.js     # Tour visualization
    │   ├── components/
    │   │   ├── TourMap.js         # Map display
    │   │   ├── StopDetails.js     # Stop information
    │   │   └── AdjustmentPanel.js # Tour adaptation controls
    │   ├── services/
    │   │   └── tourService.js     # API client
    │   └── App.js
    ├── public/
    │   └── index.html
    └── package.json
```

## 🔑 API Endpoints

### Generate Tour
```
POST /api/tours/generate

Request body:
{
  "city": "Chicago",
  "time_available_minutes": 120,
  "walking_tolerance": "MODERATE",
  "interests": ["history", "coffee"],
  "custom_interest_text": "waterfront views",
  "crowd_preference": "BALANCED",
  "start_location": {
    "lat": 41.8839,
    "lng": -87.6233
  }
}

Response:
{
  "summary": "AI-generated tour overview",
  "total_distance_km": 3.2,
  "total_duration_minutes": 110,
  "stops": [
    {
      "id": "poi_001",
      "name": "Stop Name",
      "lat": 41.123456,
      "lng": -87.123456,
      "description": "AI-generated description",
      "short_fact": "Factual information",
      "categories": ["history", "coffee"],
      "crowd_level": "MEDIUM",
      "visit_minutes": 20,
      "order": 1,
      "transition_to_next": "Walking directions to next stop"
    }
  ]
}
```

### Adjust Tour
```
POST /api/tours/adjust

Request body:
{
  "current_stop_id": "poi_002",
  "remaining_time_minutes": 60,
  "adjustment_type": "TIRED|MORE_INTEREST|TOO_CROWDED",
  "adjustment_interest": "food",
  "original_preferences": { ...full preferences object }
}

Response: (same as Generate Tour)
```

## 🎨 Features

### User Preferences
- **Time**: 30 min - 4+ hours
- **Walking Tolerance**: Very light, Moderate, A lot
- **Interests**: Select from presets or add custom
- **Crowd Preference**: Quiet, Balanced, Any
- **Starting Location**: Predefined or custom

### Tour Generation
- **AI-Driven**: Claude generates descriptions and transitions
- **Optimized Routes**: Greedy nearest-neighbor algorithm
- **Time & Distance**: Respects user constraints
- **Crowd Awareness**: Biases toward quiet/popular based on preference

### Tour Adaptation (Mid-Tour)
- **I'm tired** → Reduces remaining distance/time
- **More food/coffee** → Adds relevant POI nearby
- **Too crowded** → Avoids HIGH crowd locations
- **Real-time Recalculation** → New route from current position

## 🛠️ Technology Stack

- **Frontend**: React 18, CSS3
- **Backend**: Express.js, Node.js
- **AI**: Groq API (Mixtral-8x7b for ultra-fast inference)
- **Routing**: Custom nearest-neighbor algorithm
- **Distance Calculation**: Haversine formula

## 📝 Environment Variables

Create a `.env` file in the backend folder:

```
GROQ_API_KEY=gsk_...
PORT=5000
NODE_ENV=development
```

Get your free Groq API key at: https://console.groq.com/

## 🧪 Testing the MVP

1. Open `http://localhost:3000`
2. Select preferences (e.g., 2 hours, coffee + history)
3. Click "Generate My Tour"
4. Browse stops on the map/list
5. Try adjustments: "I'm tired", "More coffee", etc.
6. Watch the tour regenerate with new AI descriptions

## 📊 Demo Data

The app includes 12 preloaded POIs in Chicago (Loop area):
- Riverfront Coffee Co.
- Cloud Gate (The Bean)
- Art Institute of Chicago
- Grant Park
- Millennium Park
- Chicago History Museum
- Street Art District
- Navy Pier
- Chicago Cultural Center
- Intelligentsia Coffee
- Museum of Science & Industry
- The Magnificent Mile

## 🚀 Deployment Notes

For production:
1. Replace `REACT_APP_API_URL` environment variable in frontend
2. Add real map provider (Google Maps, Mapbox)
3. Store POIs in a database (MongoDB, PostgreSQL)
4. Implement user authentication
5. Add rate limiting and caching

## 📄 License

MIT
