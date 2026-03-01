# chi360 — Chicago. Every Angle, Every Insight.
## Full-Stack Secure React + Node.js + Supabase App

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Frontend
cd chi360
npm install

# Backend
cd server
npm install
```

### 2. Set up Supabase

1. Go to https://supabase.com → New project
2. In **SQL Editor**, paste and run the contents of `server/supabase_schema.sql`
3. Copy your **Project URL** and **service_role key** from Settings → API

### 3. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=generate-32-char-random-string-here
JWT_REFRESH_SECRET=another-32-char-random-string
SESSION_TIMEOUT_MINUTES=15
PORT=4000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

For React, create `chi360/.env`:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### 4. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd chi360 && npm start
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Strength Meter** | Real-time scoring (0-4) with checklist: length, uppercase, number, special char |
| **TOTP 2FA** | `otplib` — scan QR code with Google Authenticator or Authy. 8 backup codes generated |
| **Session Timeout** | 15-min idle timeout with 2-min warning modal + sliding window reset on activity |
| **Login History** | Every login/failure/block logged to Supabase with IP, device, status, timestamp |
| **Rate Limiting** | 5 login attempts / 15 min per IP · 5 2FA attempts / 10 min · 100 API req / 15 min |
| **XSS Protection** | `xss` library sanitizes all request body fields server-side |
| **CSRF Protection** | Double-submit cookie pattern — token in cookie + `x-csrf-token` header validated |
| **Helmet** | 15+ HTTP security headers: CSP, HSTS, X-Frame-Options, etc. |
| **Password Hashing** | `bcrypt` with 12 salt rounds — passwords never stored in plain text |
| **JWT Sessions** | Tokens stored in `sessionStorage` (cleared on tab close) + server-side session table |

---

## 📁 Project Structure

```
chi360/
├── public/
├── src/
│   ├── components/
│   │   ├── Background.js          # Animated topographic canvas
│   │   ├── Card.js                # Glassmorphism card
│   │   ├── Logo.js                # chi360 logo
│   │   ├── PasswordStrengthMeter.js  # Real-time password checker
│   │   ├── SessionWarning.js      # 15-min timeout modal
│   │   └── LoginHistory.js        # Security panel (history + sessions)
│   ├── context/
│   │   └── UserContext.js         # Global auth state
│   ├── hooks/
│   │   └── useSessionTimeout.js   # Idle timer hook
│   ├── pages/
│   │   ├── SignIn.js              # Login + register (split screen)
│   │   ├── TwoFactor.js           # TOTP 6-digit code entry
│   │   ├── Profile.js             # Name + neighborhood setup
│   │   └── Welcome.js             # App launcher dashboard
│   └── utils/
│       ├── api.js                 # Fetch wrapper with CSRF + JWT
│       └── passwordStrength.js    # Strength scoring logic
└── server/
    ├── lib/
    │   └── supabase.js            # Supabase client
    ├── middleware/
    │   ├── auth.js                # JWT verify + session timeout
    │   ├── rateLimiter.js         # express-rate-limit configs
    │   └── security.js            # Helmet + XSS + CSRF + validation
    ├── routes/
    │   ├── auth.js                # register, login, 2FA, logout
    │   └── user.js                # login history, sessions
    ├── supabase_schema.sql        # Full DB schema with RLS
    ├── index.js                   # Express app entry
    └── .env.example
```

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/csrf-token` | — | Get CSRF token |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/2fa/verify` | pre-token | Verify TOTP |
| POST | `/api/auth/2fa/setup` | ✅ | Get QR code |
| POST | `/api/auth/2fa/enable` | ✅ | Activate 2FA |
| POST | `/api/auth/logout` | ✅ | Revoke session |
| POST | `/api/auth/logout-all` | ✅ | Revoke all sessions |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/user/login-history` | ✅ | Login audit log |
| GET | `/api/user/sessions` | ✅ | Active sessions |
| DELETE | `/api/user/sessions/:id` | ✅ | Revoke session |

---

## 🚢 Deploy

### Backend → Railway / Render
```bash
# Set all env vars in dashboard, then:
git push
```

### Frontend → Vercel
```bash
cd chi360
REACT_APP_API_URL=https://your-backend.railway.app/api
vercel --prod
```
