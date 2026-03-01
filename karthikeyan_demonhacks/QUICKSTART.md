# LoopTour Quick Start Guide

Dependencies have been installed successfully! ✅

## ✅ What's Done
- [x] Node.js 25.7.0 installed
- [x] Backend dependencies installed (128 packages)
- [x] Frontend dependencies installed (1303 packages)

## 🚀 Running the Project

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```
Backend will run on **http://localhost:5000**

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```
Frontend will run on **http://localhost:3000** and open in your browser

## ⚙️ Before You Start

### Set Your Groq API Key
Edit `backend/.env` and add your key:

```
GROQ_API_KEY=gsk_YOUR_KEY_HERE
PORT=5000
NODE_ENV=development
```

Get your key from: https://console.groq.com/keys

## 🧪 Testing the App

1. **Fill the form** - Select time (120 min), interests (history + coffee), starting point
2. **Generate tour** - Click "Generate My Tour"
3. **View results** - See the AI-generated tour with 4-6 stops
4. **Try adjustments** - Click "I'm tired", "More food", "Too crowded"
5. **Watch it adapt** - Tour regenerates with new constraints

## 📁 Project Structure

```
looptour/
├── backend/           # Express API
│   ├── server.js
│   ├── routes/        # API endpoints
│   ├── services/      # Route & AI logic
│   ├── data/          # POIs database
│   └── package.json
├── frontend/          # React web app
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md          # Full documentation
```

## 🔑 Key Endpoints

- `POST /api/tours/generate` - Create new tour
- `POST /api/tours/adjust` - Adapt existing tour
- `GET /api/health` - Check backend status

## 💡 Next Steps (Optional Enhancements)

- Add real map library (Leaflet/Mapbox)
- Integrate Google Places API for real POIs
- Add database (MongoDB) for persistence
- Implement user authentication
- Deploy to Vercel (frontend) & Heroku/Railway (backend)

## ❓ Troubleshooting

**Backend won't start?**
- Check `.env` file has your Anthropic API key
- Ensure port 5000 is not in use

**Frontend errors?**
- Run `npm audit fix` if needed
- Clear browser cache (Ctrl+Shift+Del)
- Check that backend is running on port 5000

**AI descriptions not generating?**
- Verify Anthropic API key is correct
- Check your API quota at console.anthropic.com
- Look at backend console for error messages

---

Enjoy your hackathon! 🎉
