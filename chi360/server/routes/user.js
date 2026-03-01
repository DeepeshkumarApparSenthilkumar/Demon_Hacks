const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/login-history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/login-history', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { data, error, count } = await supabase
      .from('login_history')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ success: true, history: data, total: count });
  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch login history' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/sessions  — Active sessions
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, device_info, ip_address, created_at, last_active, expires_at')
      .eq('user_id', req.user.sub)
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .order('last_active', { ascending: false });

    if (error) throw error;

    // Mark which session is current
    const sessionsWithCurrent = data.map(s => ({
      ...s,
      isCurrent: s.id === req.session.id,
    }));

    res.json({ success: true, sessions: sessionsWithCurrent });
  } catch (err) {
    console.error('Sessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/user/sessions/:id  — Revoke a specific session
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/sessions/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ is_revoked: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.sub); // ensure ownership

    if (error) throw error;
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to revoke session' });
  }
});

module.exports = router;
