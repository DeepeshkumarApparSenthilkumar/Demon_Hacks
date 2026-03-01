# 🗺️ Google Maps Integration Setup

Your LoopTour now has **real Google Maps integration** with:
- ✅ Interactive map with real markers at tour stop coordinates
- ✅ Blue polyline showing the exact walking route
- ✅ Search bar with autocomplete for finding stops by name/category
- ✅ Info windows with stop details (name, categories, crowd level, visit time)
- ✅ Real-time marker updates as you navigate the tour
- ✅ Responsive map with smart zoom/center based on tour bounds

## 🔑 Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Name it "LoopTour" and click "CREATE"
5. Wait for creation to complete (2-3 minutes)

### Step 2: Enable Required APIs
1. In the Cloud Console, search for "Maps JavaScript API"
2. Click it and press "ENABLE"
3. Repeat for these APIs:
   - **Places API** (for location autocomplete)
   - **Maps Embed API** (for map rendering)

### Step 3: Create an API Key
1. Go to **Credentials** in the left sidebar
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the generated API key
4. Click "RESTRICT KEY" to secure it (optional but recommended for production)
   - **Application restrictions:** HTTP referrers (web sites)
   - **Website restrictions:** Add `localhost:3000` and your deployment domain
   - **API restrictions:** Select "Maps JavaScript API" and "Places API"

### Step 4: Add Key to LoopTour
1. Open `/frontend/.env.local`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyD_your_actual_key_here
   ```
3. Save the file
4. The frontend will automatically reload with the key

## 📍 What's New in GoogleMapsComponent

### Features:
- **Real Google Map Canvas**: Displays actual Google Maps tiles
- **Smart Markers**: 
  - 🔴 Red marker = Current stop (large)
  - 🔵 Blue markers = Other stops (smaller)
- **Route Polyline**: Blue dashed line showing walking path between stops
- **Search Functionality**:
  - Type to filter stops by name or category
  - Click any result to jump to that stop
  - Clear button to reset search
- **Info Windows**: Click any marker to see:
  - Stop name and categories
  - Short fact/description
  - Visit duration and crowd level
- **Map Legend**: Shows marker meanings (bottom right)
- **Responsive Design**: Works on desktop and mobile

### Map Customization:
- Zoom level: 14 (perfect for walking tours)
- Disabled POI layer (cleaner map)
- Custom styled markers
- Smooth animations on selection

## 🧪 Testing the Integration

1. Navigate to http://localhost:3000
2. Fill out the preference form and generate a tour
3. On the tour display page:
   - ✅ Verify the map shows your tour stops as markers
   - ✅ Blue line connects stops in order
   - ✅ Click a marker to see stop details
   - ✅ Use the search bar to filter stops
   - ✅ Stops list on the right updates when you click markers

## 🐛 Troubleshooting

### "API key is missing" warning
- Add your Google Maps API key to `/frontend/.env.local`
- Restart the frontend dev server: Stop and re-run `npm start`

### Map not loading/blank
- **Check API key**: Ensure it's valid in Google Cloud Console
- **Check APIs enabled**: Maps JavaScript API and Places API must be enabled
- **Check browser console**: Look for CORS or auth errors
- **Restart frontend**: Sometimes needed after env changes

### Markers not appearing
- Verify the tour has stops with `lat` and `lng` properties
- Check browser DevTools → Network tab to see API calls
- Ensure map center is being calculated correctly

### Search not working
- Clear browser cache (Ctrl+Shift+Delete)
- Verify stop objects have `name` and `categories` properties
- Check console for JavaScript errors

## 📱 Responsive Behavior

The map adapts to screen size:
- **Desktop (>1024px)**: Map 60% left, details 40% right
- **Tablet (768-1024px)**: Map stacked vertically
- **Mobile (<768px)**: Full-width map, details below

## 🚀 Production Deployment

Before deploying to production:

1. **Update API key restrictions**:
   - In Google Cloud Console → Credentials
   - Edit your API key
   - Under "Website restrictions", add your domain (e.g., looptour.example.com)

2. **Use environment variables securely**:
   - Never commit API keys to Git
   - Use `.env.local` (already in .gitignore)
   - On production, set `REACT_APP_GOOGLE_MAPS_API_KEY` via deployment platform (Vercel, Netlify, etc.)

3. **Monitor quota usage**:
   - Go to APIs & Services → Quotas in Google Cloud Console
   - Set up billing alerts to avoid surprises

4. **Enable billing** (required for most Google Maps APIs):
   - Google Cloud Console → Billing
   - Link a payment method (free tier: $200/month free credits)

## 📚 Next Steps

Once Google Maps is working:
- [ ] Test with different tour preferences
- [ ] Verify markers and routes display correctly
- [ ] Test search/filter functionality
- [ ] Test info window popups
- [ ] Verify responsive behavior on mobile
- [ ] Check performance with 20+ stops
- [ ] Add street view or photo gallery (optional enhancement)
- [ ] Deploy to production with restricted API key

## 🎨 Customizing Map Appearance

Edit `GoogleMapsComponent.js` to customize:

```javascript
// Change zoom level
<GoogleMap zoom={14} ... >

// Customize marker colors
const getMarkerIcon = (index) => ({
  fillColor: index === selectedStopIndex ? '#ea4335' : '#4285f4',
  ...
});

// Change polyline color
<Polyline path={...} options={{ strokeColor: '#4285f4' }} />

// Add custom map styles
options={{
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    // Add more custom styles here
  ]
}}
```

---

**Questions?** Check the @react-google-maps/api documentation:
https://react-google-maps-api-docs.netlify.app/

Happy touring! 🚶‍♂️🗺️
