import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authApi } from '../utils/api';

export default function TwoFactor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const preToken = location.state?.preToken;

  useEffect(() => {
    if (!preToken) navigate('/');
    inputs.current[0]?.focus();
  }, [preToken, navigate]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    setError('');
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) {
      submitCode(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setCode(arr);
      inputs.current[5]?.focus();
      setTimeout(() => submitCode(pasted), 50);
    }
  };

  const submitCode = async (totpCode) => {
    setLoading(true);
    try {
      const { ok, data } = await authApi.verify2FA({ preToken, totpCode });
      if (ok) {
        login(data.user, data.token);
        navigate('/profile-setup');
      } else {
        setError(data.error || 'Invalid code. Try again.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 55%', position: 'relative',
        overflow: 'hidden', display: 'flex',
        flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'flex-end', padding: '48px',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(4,4,14,0.92) 0%, rgba(8,8,20,0.75) 50%, rgba(5,5,18,0.88) 100%)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: `linear-gradient(rgba(79,110,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div style={{ position: 'absolute', top: '36px', left: '48px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: '#fff', boxShadow: '0 0 20px rgba(79,110,247,0.4)' }}>χ</div>
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', color: '#e8eaf6' }}>chi<span style={{ color: '#4f6ef7' }}>360</span></span>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px' }}>🔐</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3vw,44px)', letterSpacing: '-1.5px', lineHeight: 1.1, color: '#e8eaf6', marginBottom: '14px' }}>
            Two-factor<br />authentication.
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(232,234,246,0.42)', maxWidth: '320px', lineHeight: 1.6 }}>
            Your account is protected with TOTP 2FA. Open your authenticator app to get your 6-digit code.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: '0 0 45%', background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 52px', position: 'relative', zIndex: 20,
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.5px', color: '#0f0f1e', marginBottom: '6px' }}>
              Enter your 2FA code
            </h1>
            <p style={{ fontSize: '13.5px', color: '#888' }}>
              Open Google Authenticator or Authy and enter the 6-digit code for chi360.
            </p>
          </div>

          {/* Code input boxes */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  flex: 1, height: '56px',
                  textAlign: 'center',
                  fontSize: '22px', fontWeight: 700,
                  background: digit ? '#f0f3ff' : '#f5f5f7',
                  border: `2px solid ${digit ? '#4f6ef7' : '#e0e0e8'}`,
                  borderRadius: '12px', color: '#0f0f1e',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

          {loading && (
            <div style={{ textAlign: 'center', color: '#4f6ef7', fontSize: '13.5px', marginBottom: '16px', fontWeight: 500 }}>
              Verifying...
            </div>
          )}

          <button
            onClick={() => submitCode(code.join(''))}
            disabled={code.some(d => !d) || loading}
            style={{
              width: '100%', padding: '14px',
              background: code.every(d => d) ? '#0f0f1e' : '#e0e0e8',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600, fontSize: '14.5px',
              cursor: code.every(d => d) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Verify code
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span
              onClick={() => navigate('/')}
              style={{ fontSize: '13px', color: '#4f6ef7', cursor: 'pointer', fontWeight: 500 }}
            >
              ← Back to sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
