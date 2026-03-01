import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const [btnHover, setBtnHover] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check both context and sessionStorage (OAuth sets sessionStorage before navigate)
    const savedUser = sessionStorage.getItem('chi360_user');
    const hasUser = user?.email || (savedUser && JSON.parse(savedUser)?.email);
    if (!hasUser) { navigate('/'); return; }
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, [user, navigate]);

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError('');
    updateProfile(name.trim(), area.trim());
    navigate('/welcome');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── Background image ── */}
      <img
        src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2400&q=100"
        alt="Chicago"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* ── Dark overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── chi360 logo top-left ── */}
      <div style={{
        position: 'absolute', top: '32px', left: '40px', zIndex: 20,
        opacity: loaded ? 1 : 0, transition: 'opacity 0.5s',
      }}>
        <span style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px', color: '#fff' }}>
          chi<span style={{ color: '#4f6ef7' }}>360</span>
        </span>
      </div>

      {/* ── Step indicators top-right ── */}
      <div style={{
        position: 'absolute', top: '32px', right: '40px', zIndex: 20,
        display: 'flex', gap: '8px', alignItems: 'center',
        opacity: loaded ? 1 : 0, transition: 'opacity 0.5s',
      }}>
        {[{ label: 'Sign In', done: true }, { label: 'Profile', done: false }].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: !s.done ? 'rgba(79,110,247,0.35)' : 'rgba(255,255,255,0.12)',
            border: `1px solid ${!s.done ? 'rgba(79,110,247,0.7)' : 'rgba(255,255,255,0.25)'}`,
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: s.done ? 'rgba(79,110,247,0.6)' : '#4f6ef7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, color: '#fff',
            }}>
              {s.done ? '✓' : '2'}
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: s.done ? 'rgba(255,255,255,0.6)' : '#fff' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Bottom-left city label ── */}
      <div style={{
        position: 'absolute', bottom: '40px', left: '48px', zIndex: 10,
        opacity: loaded ? 1 : 0, transition: 'opacity 0.7s 0.3s',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '3px',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px',
        }}>Your city</p>
        <h2 style={{
          fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)',
          letterSpacing: '-2px', color: '#fff', lineHeight: 1,
          textShadow: '0 2px 30px rgba(0,0,0,0.5)',
        }}>Chicago.</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
          Every Angle. Every Insight.
        </p>
      </div>

      {/* ── Centered form card ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          pointerEvents: 'all',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <div style={{ marginBottom: '26px' }}>
            <h1 style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.5px', color: '#0f0f1e', marginBottom: '6px' }}>
              Set up your profile
            </h1>
            <p style={{ fontSize: '13.5px', color: '#999', fontWeight: 400 }}>
              Personalize your Chicago intelligence experience.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '24px' }}>
            {[false, true].map((active, i) => (
              <div key={i} style={{
                height: '3px', width: active ? '22px' : '8px',
                borderRadius: '999px',
                background: active ? '#4f6ef7' : '#e0e0e8',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              style={{
                width: '100%',
                background: focused === 'name' ? '#fff' : '#f5f5f7',
                border: `1px solid ${focused === 'name' ? '#4f6ef7' : '#e0e0e8'}`,
                borderRadius: '10px', color: '#0f0f1e',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '14px', padding: '14px 16px', outline: 'none',
                boxShadow: focused === 'name' ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none',
                transition: 'all 0.2s',
              }}
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <div style={{ position: 'relative' }}>
              <input
                style={{
                  width: '100%',
                  background: focused === 'area' ? '#fff' : '#f5f5f7',
                  border: `1px solid ${focused === 'area' ? '#4f6ef7' : '#e0e0e8'}`,
                  borderRadius: '10px', color: '#0f0f1e',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '14px', padding: '14px 16px 14px 40px', outline: 'none',
                  boxShadow: focused === 'area' ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none',
                  transition: 'all 0.2s',
                }}
                type="text"
                placeholder="Neighborhood (e.g. Loop, Wicker Park)"
                value={area}
                onChange={e => setArea(e.target.value)}
                onFocus={() => setFocused('area')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                width="14" height="14" viewBox="0 0 24 24" fill="#0f0f1e">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%', padding: '14px', marginTop: '20px',
              background: btnHover ? '#1a1a2e' : '#0f0f1e',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600, fontSize: '14.5px', cursor: 'pointer',
              boxShadow: btnHover ? '0 8px 24px rgba(15,15,30,0.3)' : '0 4px 14px rgba(15,15,30,0.2)',
              transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            Enter chi360 →
          </button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#bbb' }}>
            Neighborhood is optional — update anytime.
          </p>
        </div>
      </div>
    </div>
  );
}