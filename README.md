# chi360 🏙️

> **Chicago intelligence, every angle.**

chi360 is a full-stack urban intelligence platform built for Chicago — combining real-time market data, city analytics, air quality monitoring, housing insights, guided city tours, and transit tracking into a single seamless dashboard.

---

## What is chi360?

chi360 brings together 6 powerful apps under one roof, giving Chicago residents, professionals, and visitors a 360° view of the city they live in.

| App | Description |
|---|---|
| **Markets** | Real-time market intelligence & trading signals for Chicago-area assets |
| **Skyline** | Deep neighborhood analytics, demographic trends & city data |
| **Atmos** | Live air quality monitoring, pollution alerts & environmental data |
| **Living** | AI-powered housing insights, price predictions & neighborhood comparisons |
| **Discover** | Adaptive city tours, hidden gems & curated Chicago experiences |
| **Transit** | Ghost bus detector, real-time CTA tracking & commute intelligence |

---

## Features

- 🔐 **Secure Authentication** — Email/password login, Google OAuth, session management
- 🛡️ **Two-Factor Authentication (2FA)** — TOTP-based with QR code setup & backup codes
- 🔒 **Security Dashboard** — Login history, active sessions, device management
- 👤 **User Profiles** — Personalized experience based on neighborhood & preferences
- 🌙 **Dark UI** — Cinematic design with Chicago night skyline imagery
- 📱 **Responsive** — Works across desktop and mobile

---

## Tech Stack

### Frontend
- **React** — UI framework
- **React Router** — Client-side routing
- **Plus Jakarta Sans** — Typography
- Hosted on **Netlify / Vercel**

### Backend
- **Node.js + Express** — REST API server
- **JWT** — Stateless authentication tokens
- **bcryptjs** — Password hashing
- **otplib** — TOTP 2FA generation & verification
- **Helmet + CORS** — Security headers
- **Rate limiting** — Brute force protection
- Hosted on **Render**

### Database
- **Supabase (PostgreSQL)** — Users, sessions, login history, 2FA backup codes

### OAuth
- **Google OAuth 2.0** — Sign in with Google

---

## Project Structure

```
chi360/
├── src/                    # React frontend
│   ├── pages/
│   │   ├── SignIn.js       # Login & register page
│   │   ├── Profile.js      # Profile setup page
│   │   ├── Welcome.js      # Main dashboard
│   │   └── OAuthCallback.js# Google OAuth handler
│   ├── components/
│   │   ├── GlobeBackground.js
│   │   └── HolographicOrb.js
│   ├── context/
│   │   └── UserContext.js  # Global auth state
│   └── utils/
│       └── api.js          # API client & token management
│
├── server/                 # Node.js backend
│   ├── routes/
│   │   ├── auth.js         # Auth routes (login, register, OAuth, 2FA)
│   │   └── user.js         # User routes (sessions, history)
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── security.js     # CSRF, validation, sanitization
│   │   └── rateLimiter.js  # Rate limiting
│   └── lib/
│       └── supabase.js     # Supabase client
│
└── public/                 # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Supabase account
- Google Cloud Console project (for OAuth)

### Installation

```bash
# Clone the repo
git clone https://github.com/arthiya2002/Chi360.git
cd Chi360

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Environment Variables

Create `server/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:4000
NODE_ENV=development
SESSION_TIMEOUT_MINUTES=15
```

Create `chi360/.env`:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### Run Locally

```bash
# Terminal 1 — Start backend
cd server
node index.js

# Terminal 2 — Start frontend
cd chi360
npm start
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:4000`

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Netlify / Vercel |
| Backend | Render |
| Database | Supabase |

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  area TEXT,
  totp_enabled BOOLEAN DEFAULT false,
  totp_secret TEXT,
  totp_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_hash TEXT,
  device_info TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Login History
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email TEXT,
  ip_address TEXT,
  device_info TEXT,
  status TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT authentication with session expiry
- ✅ CSRF token protection
- ✅ Rate limiting on auth endpoints
- ✅ XSS sanitization
- ✅ Helmet security headers
- ✅ TOTP two-factor authentication
- ✅ Session revocation
- ✅ Login history tracking

---