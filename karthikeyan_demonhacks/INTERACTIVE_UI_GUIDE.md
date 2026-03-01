# 🗺️ LoopTour - Ultra Interactive UI with Mapbox

Your LoopTour now features a **completely redesigned, highly interactive UI** with Mapbox GL integration!

## ✨ What's New

### 🎯 Interactive Preference Form
- **Multi-step wizard** with smooth animations between steps
- **Progress bar** showing tour creation progress (Step 1-4)
- **Dynamic time selector** with slider and quick preset buttons
- **Interest grid** with 8 emoji-based categories (History, Food, Art, Nature, Coffee, Shopping, Photography, Architecture)
- **Radio button cards** for walking tolerance and crowd preferences
- **Animated background blobs** for visual appeal
- **Step indicators** at bottom for quick navigation
- **Responsive design** that adapts to mobile screens

### 🗺️ Mapbox GL Map
- **Real-time markers** at tour stop coordinates
- **Color-coded markers**: Purple/Blue for other stops, Pink/Red for current stop
- **Animated marker pulse** for active stop
- **Blue polyline route** showing the exact walking path
- **Interactive zoom & pan** with Mapbox controls
- **GeoLocation button** to find your position
- **Smart bounds calculation** that auto-zooms to fit all stops
- **Clean map styling** with minimal POI clutter

### 📋 Dynamic Tab-Based Tour Display
- **Overview Tab**: Tour summary, current stop hero card, progress bar
- **Stops Tab**: Visual carousel of all stops (click to jump to any stop)
- **Adjust Tab**: 4 quick adjustment buttons:
  - ⏱️ I'm Tired (reduce time/distance)
  - 🍽️ More Food (add food spots)
  - ☕ Coffee Break (add coffee shops)
  - 🤫 Less Crowded (avoid busy areas)

### 🎨 Modern UI/UX Features
- **Purple gradient theme** (primary color: #667eea)
- **Glassmorphism effects** with smooth transitions
- **Card-based layouts** for visual hierarchy
- **Emoji icons** for quick visual recognition
- **Smooth animations** and transitions
- **Responsive grid layouts** that adapt to screen size
- **Hover effects** on all interactive elements
- **Loading states** and feedback messages

## 🚀 Getting Started

### 1. Get a Mapbox Token (Free)

1. Visit [mapbox.com/account/tokens](https://account.mapbox.com/tokens/)
2. Sign up for a free account (if you don't have one)
3. Click "Create a token"
4. Name it "LoopTour"
5. Enable public scopes
6. Copy the token

### 2. Configure Your Environment

1. Open `/frontend/.env.local`
2. Add your Mapbox token:
   ```
   REACT_APP_MAPBOX_TOKEN=pk_your_token_here
   ```
3. Save the file
4. Frontend will automatically reload ✨

### 3. Start the Servers

**Backend** (Port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (Port 3000):
```bash
cd frontend
npm start
```

Both are already running if you see this!

## 🎮 How to Use

1. **Visit http://localhost:3000**
2. **Fill out the preference form**:
   - Choose time available (30-240 minutes)
   - Select interests (at least 1)
   - Pick walking comfort level
   - Set crowd preference
3. **Generate tour** - See AI-powered tour appear on map
4. **Explore your tour**:
   - Click markers to jump to stops
   - Switch between Overview/Stops/Adjust tabs
   - Use adjustment buttons to refine the tour
   - Map updates in real-time

## 📱 Responsive Breakpoints

- **Desktop (>1024px)**: Map 50% left, details 50% right
- **Tablet (768-1024px)**: Stacked vertically with scrollable details
- **Mobile (<768px)**: Full-width map with bottom details panel

## 🎨 Color Scheme

- **Primary**: Purple gradient `#667eea → #764ba2`
- **Success**: Green `#48bb78`
- **Warning**: Orange `#ed8936`
- **Error**: Red `#f56565`
- **Current Stop**: Pink `#f5576c`
- **Background**: Subtle gradient `#f5f7fa → #c3cfe2`

## 📊 Component Architecture

```
App
├── InteractivePreferenceForm
│   ├── Step selector (time, interests, walking, crowd)
│   └── Animated background blobs
└── InteractiveTourDisplay
    ├── MapboxMap
    │   ├── Map container
    │   ├── Markers & route
    │   └── Map controls
    └── Tab panel
        ├── Overview (summary + current stop hero)
        ├── Stops (carousel grid)
        └── Adjust (quick buttons)
```

## 🔑 Environment Variables

```bash
# .env.local (frontend)
REACT_APP_MAPBOX_TOKEN=pk_your_token

# .env (backend)
GROQ_API_KEY=gsk_your_key
PORT=5000
NODE_ENV=development
```

## 🐛 Troubleshooting

### Map shows blank/not loading
- ✅ Add REACT_APP_MAPBOX_TOKEN to .env.local
- ✅ Verify token is valid in Mapbox console
- ✅ Check browser DevTools → Network tab for API errors
- ✅ Clear browser cache (Ctrl+Shift+Delete)

### Markers not appearing
- ✅ Verify tour has stops with lat/lng properties
- ✅ Check map is centered on stops (should auto-center)
- ✅ Open browser console for JavaScript errors

### Form not submitting
- ✅ Select at least 1 interest
- ✅ Verify backend is running on port 5000
- ✅ Check backend .env has valid GROQ_API_KEY

### Frontend won't start
- ✅ Delete `node_modules` and `package-lock.json`
- ✅ Run `npm install` again
- ✅ Make sure Node.js is in PATH: `node --version`

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Scripts 5 |
| **Styling** | CSS3 with animations |
| **Map** | Mapbox GL JS |
| **Backend** | Express.js, Node.js |
| **AI** | Groq Mixtral-8x7b-32768 |
| **HTTP** | Axios |

## 🚀 Production Deployment

Before deploying:

1. **Restrict Mapbox token**:
   - Mapbox Console → Tokens
   - Edit your token
   - Under "Allowed URLs", add your domain

2. **Environment variables**:
   - Set `REACT_APP_MAPBOX_TOKEN` via your hosting platform
   - Set `GROQ_API_KEY` on backend server

3. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy**:
   - Frontend: Deploy `build/` folder to Vercel/Netlify
   - Backend: Deploy to Heroku/Railway/Render

## 📸 Features Showcase

### 🎯 Preference Form
- Wizard-style multi-step experience
- Animated transitions between steps
- Real-time visual feedback
- Emoji-based category selection
- Quick preset buttons

### 🗺️ Interactive Map
- Mapbox GL rendering with custom styling
- Marker clustering (coming soon)
- Turn-by-turn directions (coming soon)
- Street view integration (coming soon)

### 📋 Tour Management
- Tab-based interface for different views
- Real-time map updates when switching stops
- One-click tour adjustments
- Visual progress indicator

### ⚙️ Adaptive AI
- Smart route generation using Groq API
- AI-written stop descriptions
- Natural language transition directions
- Real-time tour adjustments based on preferences

## 🎓 Next Features

- [ ] User authentication & tour history
- [ ] Social sharing (Instagram stories, Twitter)
- [ ] Offline map support
- [ ] Voice narration of stops
- [ ] Photo gallery for each POI
- [ ] Crowd heat maps (real-time)
- [ ] Weather-based suggestions
- [ ] Accessibility features (alt text, screen reader)
- [ ] Dark mode toggle
- [ ] Multiple language support

## 💡 Tips & Tricks

1. **Customize interests** - Edit array in `InteractivePreferenceForm.js`
2. **Change theme colors** - Update CSS variables in `.css` files
3. **Add more POIs** - Modify `/backend/data/pois.json`
4. **Adjust AI prompts** - Edit `/backend/services/aiService.js`
5. **Tweak route algorithm** - Modify `/backend/services/routeService.js`

## 📞 Support

For issues:
1. Check the Troubleshooting section above
2. Look at browser DevTools Console for errors
3. Verify both backend & frontend are running
4. Check that API keys are correctly set
5. Try clearing cache and restarting servers

---

**Happy Touring! 🚶‍♂️🗺️✨**

Made with ❤️ for the hackathon
