const rateLimit = require('express-rate-limit');
const supabase = require('../lib/supabase');

// ── In-memory store (dev) — swap for Redis in prod ──────────────────────────
const memoryStore = new Map();

// Generic rate limiter factory
function createLimiter({ windowMs, max, message, keyPrefix }) {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message, code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      return `${keyPrefix}:${ip}`;
    },
    handler: async (req, res, next, options) => {
      // Log blocked attempt to DB
      const email = req.body?.email || 'unknown';
      const ip = req.ip || req.connection.remoteAddress;
      await supabase.from('login_history').insert({
        email,
        ip_address: ip,
        device_info: req.headers['user-agent'],
        status: 'blocked',
        failure_reason: 'rate_limited',
      }).catch(() => {}); // don't fail if logging fails

      res.status(429).json(options.message);
    },
  });
}

// ── Specific limiters ────────────────────────────────────────────────────────

// Strict login limiter: 5 attempts per 15 min per IP
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  keyPrefix: 'login',
});

// 2FA limiter: 5 attempts per 10 min
const totpLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many 2FA attempts. Please wait 10 minutes.',
  keyPrefix: 'totp',
});

// General API limiter: 100 requests per 15 min
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please slow down.',
  keyPrefix: 'api',
});

// Registration limiter: 3 per hour per IP
const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts. Please try again later.',
  keyPrefix: 'register',
});

module.exports = { loginLimiter, totpLimiter, apiLimiter, registerLimiter };
