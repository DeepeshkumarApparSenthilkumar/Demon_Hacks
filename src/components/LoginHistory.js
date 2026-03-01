import React, { useEffect, useState } from 'react';
import { userApi } from '../utils/api';

function StatusBadge({ status }) {
  const config = {
    success:      { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Success' },
    failed:       { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Failed' },
    blocked:      { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  label: 'Blocked' },
    '2fa_required': { color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)', label: '2FA' },
    '2fa_failed': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: '2FA Failed' },
  }[status] || { color: '#888', bg: '#f0f0f5', label: status };

  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '3px 8px',
      borderRadius: '999px', background: config.bg, color: config.color,
      letterSpacing: '0.3px',
    }}>
      {config.label}
    </span>
  );
}

function DeviceIcon({ ua }) {
  if (!ua) return '🖥️';
  if (/mobile|android|iphone/i.test(ua)) return '📱';
  if (/tablet|ipad/i.test(ua)) return '📱';
  return '🖥️';
}

export default function LoginHistory({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('history');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      userApi.loginHistory(),
      userApi.sessions(),
    ]).then(([histRes, sessRes]) => {
      if (histRes.ok) setHistory(histRes.data.history || []);
      if (sessRes.ok) setSessions(sessRes.data.sessions || []);
    }).finally(() => setLoading(false));
  }, [isOpen]);

  const revokeSession = async (id) => {
    await userApi.revokeSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        width: '100%', maxWidth: '560px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          borderBottom: '1px solid #f0f0f5',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px', color: '#0f0f1e' }}>
              Security & Sessions
            </h2>
            <button onClick={onClose} style={{ background: '#f5f5f7', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#888' }}>✕</button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0' }}>
            {['history', 'sessions'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 16px',
                background: 'none', border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13.5px', fontWeight: tab === t ? 600 : 400,
                color: tab === t ? '#0f0f1e' : '#999',
                cursor: 'pointer',
                borderBottom: `2px solid ${tab === t ? '#4f6ef7' : 'transparent'}`,
                transition: 'all 0.2s', marginBottom: '-1px',
              }}>
                {t === 'history' ? '📋 Login History' : '💻 Active Sessions'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>Loading...</div>
          ) : tab === 'history' ? (
            history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>No login history found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(h => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: '#fafafa',
                    borderRadius: '12px', border: '1px solid #f0f0f5',
                  }}>
                    <div style={{ fontSize: '20px' }}><DeviceIcon ua={h.device_info} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f1e', marginBottom: '2px' }}>
                        {h.ip_address || 'Unknown IP'}
                        {h.location ? ` · ${h.location}` : ''}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {new Date(h.created_at).toLocaleString()} · {h.device_info?.split(' ').slice(0, 3).join(' ') || 'Unknown device'}
                      </div>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            )
          ) : (
            sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>No active sessions.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessions.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: '#fafafa',
                    borderRadius: '12px',
                    border: `1px solid ${s.isCurrent ? 'rgba(79,110,247,0.25)' : '#f0f0f5'}`,
                    background: s.isCurrent ? 'rgba(79,110,247,0.04)' : '#fafafa',
                  }}>
                    <div style={{ fontSize: '20px' }}><DeviceIcon ua={s.device_info} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f1e' }}>
                          {s.ip_address || 'Unknown IP'}
                        </span>
                        {s.isCurrent && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#4f6ef7', background: 'rgba(79,110,247,0.1)', padding: '2px 7px', borderRadius: '999px' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#aaa' }}>
                        Last active: {new Date(s.last_active).toLocaleString()}
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => revokeSession(s.id)}
                        style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '8px', padding: '5px 10px',
                          fontSize: '12px', fontWeight: 500, color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
