require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { helmetMiddleware, sanitizeBody, csrfTokenEndpoint } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Trust proxy (for correct IP behind Vercel/Nginx) ────────────────────────
app.set('trust proxy', 1);

// ── Security headers (Helmet) ────────────────────────────────────────────────
app.use(helmetMiddleware);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // limit payload size
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Global XSS sanitizer ────────────────────────────────────────────────────
app.use(sanitizeBody);

// ── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── CSRF token endpoint ──────────────────────────────────────────────────────
app.get('/api/csrf-token', csrfTokenEndpoint);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal error occurred'
    : err.message;
  res.status(500).json({ success: false, error: message });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════╗
  ║   chi360 API Server              ║
  ║   Running on port ${PORT}           ║
  ║   Env: ${process.env.NODE_ENV || 'development'}            ║
  ╚══════════════════════════════════╝
  `);
});

module.exports = app;
