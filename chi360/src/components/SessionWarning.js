import React, { useState, useEffect } from 'react';

export default function SessionWarning({ onStayLoggedIn, onLogout }) {
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(interval); onLogout(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '36px 32px', maxWidth: '380px', width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(234,179,8,0.12)',
          border: '1px solid rgba(234,179,8,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '24px',
        }}>⏱️</div>

        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '18px',
          color: '#0f0f1e', marginBottom: '8px', letterSpacing: '-0.3px',
        }}>
          Session expiring soon
        </h3>

        <p style={{ fontSize: '13.5px', color: '#888', marginBottom: '24px', lineHeight: 1.6 }}>
          You'll be signed out in{' '}
          <strong style={{ color: '#0f0f1e' }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </strong>{' '}
          due to inactivity.
        </p>

        {/* Countdown bar */}
        <div style={{
          height: '4px', background: '#f0f0f5', borderRadius: '999px',
          marginBottom: '24px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            background: secondsLeft > 60 ? '#eab308' : '#ef4444',
            width: `${(secondsLeft / 120) * 100}%`,
            transition: 'width 1s linear, background 0.3s',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onLogout}
            style={{
              padding: '12px', background: '#f5f5f7',
              border: '1px solid #e0e0e8', borderRadius: '10px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13.5px', fontWeight: 500, color: '#666',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
          <button
            onClick={onStayLoggedIn}
            style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)',
              border: 'none', borderRadius: '10px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13.5px', fontWeight: 600, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,110,247,0.35)',
            }}
          >
            Stay signed in
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
