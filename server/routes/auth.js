const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth, require2FA, hashToken } = require('../middleware/auth');
const { loginLimiter, totpLimiter, registerLimiter } = require('../middleware/rateLimiter');
const {
  sanitizeBody, validateCsrf,
  loginValidation, registerValidation, handleValidationErrors,
} = require('../middleware/security');

const SESSION_TIMEOUT_MINUTES = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 15;
const SALT_ROUNDS = 12;

// ── Helper: log login attempt ────────────────────────────────────────────────
async function logLogin(data) {
  try { await supabase.from('login_history').insert(data); } catch (e) {}
}

// ── Helper: create session + JWT ────────────────────────────────────────────
async function createSession(user, req, twoFactorVerified = false) {
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000);

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    twoFactorVerified,
    sessionId: uuidv4(),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${SESSION_TIMEOUT_MINUTES}m`,
  });

  const tokenHash = hashToken(token);

  await supabase.from('sessions').insert({
    user_id: user.id,
    token_hash: tokenHash,
    device_info: req.headers['user-agent'],
    ip_address: req.ip,
    expires_at: expiresAt.toISOString(),
  });

  return token;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register',
  registerLimiter,
  sanitizeBody,
  validateCsrf,
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name, area } = req.body;

      // Check if user exists
      const { data: existing } = await supabase
        .from('users').select('id').eq('email', email).single();
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({ email, password_hash: passwordHash, name, area })
        .select()
        .single();

      if (error) throw error;

      // Log successful registration
      await logLogin({
        user_id: user.id, email,
        ip_address: req.ip,
        device_info: req.headers['user-agent'],
        status: 'success',
        failure_reason: null,
      });

      const token = await createSession(user, req, false);

      res.status(201).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, area: user.area, totpEnabled: false },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login',
  loginLimiter,
  sanitizeBody,
  validateCsrf,
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      // Fetch user
      const { data: user } = await supabase
        .from('users').select('*').eq('email', email).single();

      if (!user) {
        await logLogin({ email, ip_address: ip, device_info: ua, status: 'failed', failure_reason: 'user_not_found' });
        // Timing-safe: still hash to prevent user enumeration
        await bcrypt.hash(password, SALT_ROUNDS);
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Compare password
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        await logLogin({ user_id: user.id, email, ip_address: ip, device_info: ua, status: 'failed', failure_reason: 'wrong_password' });
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // If 2FA enabled, return partial token (requires 2FA step)
      if (user.totp_enabled && user.totp_verified) {
        await logLogin({ user_id: user.id, email, ip_address: ip, device_info: ua, status: '2fa_required' });

        // Short-lived pre-auth token (5 min, no 2FA flag)
        const preToken = jwt.sign(
          { sub: user.id, email: user.email, twoFactorVerified: false, pre: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return res.json({ success: true, requires2FA: true, preToken });
      }

      // No 2FA — full session
      await logLogin({ user_id: user.id, email, ip_address: ip, device_info: ua, status: 'success' });
      const token = await createSession(user, req, false);

      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, area: user.area, totpEnabled: user.totp_enabled },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/verify  — Verify TOTP after login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/2fa/verify',
  totpLimiter,
  sanitizeBody,
  validateCsrf,
  async (req, res) => {
    try {
      const { preToken, totpCode } = req.body;

      let payload;
      try {
        payload = jwt.verify(preToken, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired pre-auth token' });
      }

      if (!payload.pre) {
        return res.status(400).json({ success: false, error: 'Invalid token type' });
      }

      const { data: user } = await supabase
        .from('users').select('*').eq('id', payload.sub).single();

      if (!user?.totp_secret) {
        return res.status(400).json({ success: false, error: '2FA not configured' });
      }

      // Verify TOTP code
      const isValid = authenticator.verify({ token: totpCode, secret: user.totp_secret });

      if (!isValid) {
        await logLogin({
          user_id: user.id, email: user.email,
          ip_address: req.ip, device_info: req.headers['user-agent'],
          status: '2fa_failed', failure_reason: 'invalid_totp',
        });
        return res.status(401).json({ success: false, error: 'Invalid 2FA code' });
      }

      // Issue full session
      await logLogin({
        user_id: user.id, email: user.email,
        ip_address: req.ip, device_info: req.headers['user-agent'],
        status: 'success',
      });

      const token = await createSession(user, req, true);
      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, area: user.area, totpEnabled: true },
      });
    } catch (err) {
      console.error('2FA verify error:', err);
      res.status(500).json({ success: false, error: '2FA verification failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/setup  — Generate TOTP secret + QR code
// ─────────────────────────────────────────────────────────────────────────────
router.post('/2fa/setup', requireAuth, async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(req.user.email, 'chi360', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
    const backupHashes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // Save secret temporarily (not enabled until verified)
    await supabase.from('users').update({ totp_secret: secret, totp_verified: false }).eq('id', req.user.sub);

    // Save backup codes
    await supabase.from('totp_backup_codes').delete().eq('user_id', req.user.sub);
    await supabase.from('totp_backup_codes').insert(
      backupHashes.map(hash => ({ user_id: req.user.sub, code_hash: hash }))
    );

    res.json({ success: true, qrCode: qrCodeDataUrl, backupCodes, secret });
  } catch (err) {
    console.error('2FA setup error:', err);
    res.status(500).json({ success: false, error: '2FA setup failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/enable  — Confirm TOTP and enable 2FA
// ─────────────────────────────────────────────────────────────────────────────
router.post('/2fa/enable', requireAuth, async (req, res) => {
  try {
    const { totpCode } = req.body;
    const { data: user } = await supabase.from('users').select('totp_secret').eq('id', req.user.sub).single();

    if (!user?.totp_secret) {
      return res.status(400).json({ success: false, error: 'Run /2fa/setup first' });
    }

    const isValid = authenticator.verify({ token: totpCode, secret: user.totp_secret });
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid TOTP code — check your authenticator app' });
    }

    await supabase.from('users').update({ totp_enabled: true, totp_verified: true }).eq('id', req.user.sub);
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    console.error('2FA enable error:', err);
    res.status(500).json({ success: false, error: '2FA enable failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Revoke current session
    await supabase.from('sessions').update({ is_revoked: true }).eq('id', req.session.id);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout-all  — Revoke ALL sessions (nuclear option)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    await supabase.from('sessions').update({ is_revoked: true }).eq('user_id', req.user.sub);
    res.json({ success: true, message: 'All sessions revoked' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to revoke sessions' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, area, totp_enabled, created_at')
      .eq('id', req.user.sub)
      .single();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/google — Redirect to Google OAuth
// ─────────────────────────────────────────────────────────────────────────────
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.SERVER_URL || 'http://localhost:4000'}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/google/callback — Handle Google OAuth callback
// ─────────────────────────────────────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (!code) return res.redirect(`${clientUrl}/?error=google_cancelled`);

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.SERVER_URL || 'http://localhost:4000'}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token');

    // Fetch user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();
    const { email, name, picture } = googleUser;

    // Find or create user in Supabase
    let { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    let wasJustCreated = false;

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ email, name, area: '', password_hash: 'oauth_google' })
        .select().single();
      if (error) throw error;
      user = newUser;
      wasJustCreated = true;
    }

    await logLogin({ user_id: user.id, email, ip_address: req.ip, device_info: req.headers['user-agent'], status: 'success' });
    const token = await createSession(user, req, false);

    // Go to setup if new user OR never completed setup (area is empty/null)
    const needsSetup = wasJustCreated || !user.area || user.area.trim() === '';
    console.log('Google OAuth debug:', { email, wasJustCreated, area: user.area, needsSetup });
    res.redirect(`${clientUrl}/oauth-callback?token=${token}&new=${needsSetup}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${clientUrl}/?error=google_failed`);
  }
});

module.exports = router;