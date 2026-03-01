const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../lib/supabase');

const SESSION_TIMEOUT_MS = (parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 15) * 60 * 1000;

// ── Hash a token for DB storage (never store raw JWTs) ───────────────────────
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── Verify JWT + check session in DB ────────────────────────────────────────
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });
    }

    // 1. Verify JWT signature + expiry
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
      return res.status(401).json({ success: false, error: 'Invalid or expired token', code });
    }

    // 2. Check session exists in DB and is not revoked
    const tokenHash = hashToken(token);
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('is_revoked', false)
      .single();

    if (error || !session) {
      return res.status(401).json({ success: false, error: 'Session not found or revoked', code: 'SESSION_INVALID' });
    }

    // 3. Check session timeout (15 min idle)
    const lastActive = new Date(session.last_active).getTime();
    const now = Date.now();
    if (now - lastActive > SESSION_TIMEOUT_MS) {
      // Revoke the session
      await supabase.from('sessions').update({ is_revoked: true }).eq('id', session.id);
      return res.status(401).json({ success: false, error: 'Session expired due to inactivity', code: 'SESSION_TIMEOUT' });
    }

    // 4. Update last_active (sliding window)
    await supabase.from('sessions').update({ last_active: new Date().toISOString() }).eq('id', session.id);

    // 5. Attach user to request
    req.user = payload;
    req.session = session;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

// ── Require 2FA to be completed ──────────────────────────────────────────────
function require2FA(req, res, next) {
  if (!req.user?.twoFactorVerified) {
    return res.status(403).json({ success: false, error: '2FA verification required', code: '2FA_REQUIRED' });
  }
  next();
}

module.exports = { requireAuth, require2FA, hashToken };
