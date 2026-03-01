import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authApi } from '../utils/api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import GlobeBackground from '../components/GlobeBackground';

const inp = (focused) => ({
  width: '100%',
  background: focused ? '#fff' : '#f5f5f7',
  border: `1px solid ${focused ? '#4f6ef7' : '#e0e0e8'}`,
  borderRadius: '10px',
  color: '#0f0f1e',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '14px', fontWeight: 400,
  padding: '14px 16px',
  outline: 'none',
  WebkitAppearance: 'none',
  boxShadow: focused ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none',
  transition: 'all 0.2s',
});

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.62-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [mode, setMode] = useState('signin'); // signin | register
  const [email, setEmail] = useState(() => localStorage.getItem('chi360_remembered_email') || '');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('chi360_remembered_email'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [btnHover, setBtnHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [appleHover, setAppleHover] = useState(false);

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
  };

  const handleAppleSignIn = () => {
    window.location.href = 'http://localhost:4000/api/auth/apple';
  };

  const handleSubmit = async () => {
    if (!email || !pass) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');

    try {
      if (mode === 'register') {
        const { ok, data } = await authApi.register({ email, password: pass, name });
        if (ok) { login(data.user, data.token); navigate('/profile-setup'); return; }
        // Real backend error (not a network error)
        if (ok === false && data?.error && !String(data.error).toLowerCase().includes('network') && !String(data.error).toLowerCase().includes('fetch')) {
          setError(data.error); setLoading(false); return;
        }
      } else {
        const { ok, data } = await authApi.login({ email, password: pass });
        if (ok) {
          if (data.requires2FA) { navigate('/2fa', { state: { preToken: data.preToken } }); return; }
          if (rememberMe) { localStorage.setItem('chi360_remembered_email', email); }
          else { localStorage.removeItem('chi360_remembered_email'); }
          login(data.user, data.token);
          navigate(data.user.name ? '/welcome' : '/profile-setup');
          return;
        }
        if (ok === false && data?.error && !String(data.error).toLowerCase().includes('network') && !String(data.error).toLowerCase().includes('fetch')) {
          setError(data.error); setLoading(false); return;
        }
      }
    } catch (e) {
      // Network/server error — fall through to demo mode
    }

    // Demo mode — works without backend running
    if (rememberMe) { localStorage.setItem('chi360_remembered_email', email); }
    else { localStorage.removeItem('chi360_remembered_email'); }
    const demoUser = { id: 'demo-' + Date.now(), email, name: name || email.split('@')[0], area: '', totpEnabled: false };
    login(demoUser, 'demo-token');
    navigate('/profile-setup');
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10, display:'flex', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      {/* LEFT */}
      <div style={{ flex:'0 0 55%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px' }}>
        <GlobeBackground />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(4,13,20,0.15) 0%, rgba(4,13,20,0.45) 100%)', zIndex:1 }} />




        <div style={{ position:'relative', zIndex:10, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ marginBottom:'24px' }}>
            <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'clamp(64px, 8vw, 96px)', letterSpacing:'-3px', color:'#e8eaf6', lineHeight:1 }}>chi<span style={{ color:'#4f6ef7' }}>360</span></span>
          </div>
          <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'2.5px', textTransform:'uppercase', color:'#4f6ef7', marginBottom:'14px' }}>Chicago Intelligence Hub</p>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'clamp(30px,3.5vw,48px)', letterSpacing:'-1.5px', lineHeight:1.05, color:'#e8eaf6', marginBottom:'16px', maxWidth:'480px' }}>
            Chicago.<br />Every Angle,<br />Every Insight.
          </h2>
          <p style={{ fontSize:'14px', color:'rgba(232,234,246,0.45)', fontWeight:400, maxWidth:'360px', lineHeight:1.6 }}>
            Your gateway to Markets, Skyline, Atmos, Living, Discover, and Transit — Chicago intelligence in one place.
          </p>
          <div style={{ display:'flex', gap:'10px', marginTop:'28px', flexWrap:'wrap' }}>
            {[{name:'Markets',color:'#4f6ef7',bg:'rgba(79,110,247,0.15)',border:'rgba(79,110,247,0.3)'},{name:'Skyline',color:'#22d3ee',bg:'rgba(34,211,238,0.12)',border:'rgba(34,211,238,0.25)'},{name:'Atmos',color:'#34d399',bg:'rgba(52,211,153,0.12)',border:'rgba(52,211,153,0.28)'},{name:'Living',color:'#f59e0b',bg:'rgba(245,158,11,0.12)',border:'rgba(245,158,11,0.28)'},{name:'Discover',color:'#f472b6',bg:'rgba(244,114,182,0.12)',border:'rgba(244,114,182,0.28)'},{name:'Transit',color:'#a78bfa',bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.28)'}].map(p=>(
              <div key={p.name} style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:p.bg, border:`1px solid ${p.border}`, borderRadius:'999px', padding:'6px 14px', fontSize:'12.5px', fontWeight:600, color:p.color }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:p.color }} />{p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex:'0 0 45%', background:'#ffffff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 52px', position:'relative', zIndex:20, overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'360px' }}>
          <div style={{ marginBottom:'32px' }}>
            <h1 style={{ fontWeight:700, fontSize:'22px', letterSpacing:'-0.5px', color:'#0f0f1e', marginBottom:'5px' }}>
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p style={{ fontSize:'13.5px', color:'#888', fontWeight:400 }}>
              {mode === 'signin' ? "Don't have one? " : 'Already have one? '}
              <span style={{ color:'#4f6ef7', cursor:'pointer', fontWeight:500 }} onClick={() => { setMode(m => m === 'signin' ? 'register' : 'signin'); setError(''); }}>
                {mode === 'signin' ? 'Create account' : 'Sign in'}
              </span>
            </p>
          </div>

          {/* Step dots */}
          <div style={{ display:'flex', gap:'5px', marginBottom:'22px' }}>
            {[true,false].map((a,i)=>(
              <div key={i} style={{ height:'3px', width:a?'22px':'8px', borderRadius:'999px', background:a?'#4f6ef7':'#e0e0e8', transition:'all 0.3s' }} />
            ))}
          </div>

          {/* Social */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
            <button onClick={handleGoogleSignIn} onMouseEnter={()=>setGoogleHover(true)} onMouseLeave={()=>setGoogleHover(false)}
              style={{ padding:'11px 14px', background:googleHover?'#f0f0f8':'#fff', border:'1px solid #e0e0e8', borderRadius:'10px', color:'#1a1a2e', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13.5px', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.15s', boxShadow:googleHover?'0 2px 10px rgba(0,0,0,0.08)':'none' }}>
              <GoogleIcon /> Google
            </button>
            <button onClick={handleAppleSignIn} onMouseEnter={()=>setAppleHover(true)} onMouseLeave={()=>setAppleHover(false)}
              style={{ padding:'11px 14px', background:appleHover?'#1a1a1a':'#111', border:'1px solid #222', borderRadius:'10px', color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13.5px', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.15s' }}>
              <AppleIcon /> Apple
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', color:'#c0c0cc', fontSize:'12px' }}>
            <div style={{ flex:1, height:'1px', background:'#ebebf0' }} />or continue with email<div style={{ flex:1, height:'1px', background:'#ebebf0' }} />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {mode === 'register' && (
              <input style={inp(focused==='name')} type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} onFocus={()=>setFocused('name')} onBlur={()=>setFocused('')} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            )}
            <input style={inp(focused==='email')} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} autoComplete="email" />
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                <span style={{ fontSize:'12px', color:'#aaa', fontWeight:400 }}></span>
                <button onClick={()=>setShowPass(!showPass)} style={{ background:'none', border:'none', color:'#4f6ef7', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12px', fontWeight:500, cursor:'pointer', padding:0 }}>
                  {showPass ? '🙈 Hide password' : '👁 Show password'}
                </button>
              </div>
              <input style={inp(focused==='pass')} type={showPass?'text':'password'} placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onFocus={()=>setFocused('pass')} onBlur={()=>setFocused('')} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} autoComplete={mode==='register'?'new-password':'current-password'} />
            </div>

            {/* Password strength meter (register only) */}
            <PasswordStrengthMeter password={pass} show={mode === 'register' && pass.length > 0} />
          </div>

          {error && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'8px', marginBottom:'4px' }}>{error}</p>}

          {mode === 'signin' && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'12px 0 16px' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                <div
                  onClick={() => setRememberMe(r => !r)}
                  style={{
                    width: '18px', height: '18px', borderRadius: '5px',
                    border: `2px solid ${rememberMe ? '#4f6ef7' : '#d0d0dc'}`,
                    background: rememberMe ? '#4f6ef7' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize:'12.5px', color:'#666', fontWeight:400, userSelect:'none' }} onClick={() => setRememberMe(r => !r)}>Remember me</span>
              </label>
              <span style={{ color:'#4f6ef7', fontSize:'12.5px', cursor:'pointer', fontWeight:500 }}>Forgot password?</span>
            </div>
          )}

          <div style={{ marginTop: mode === 'register' ? '18px' : '0' }}>
            <button onClick={handleSubmit} disabled={loading} onMouseEnter={()=>setBtnHover(true)} onMouseLeave={()=>setBtnHover(false)}
              style={{ width:'100%', padding:'14px', background:loading?'#aaa':btnHover?'#1a1a2e':'#0f0f1e', border:'none', borderRadius:'10px', color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:'14.5px', cursor:loading?'wait':'pointer', boxShadow:btnHover?'0 6px 20px rgba(15,15,30,0.3)':'0 2px 8px rgba(15,15,30,0.2)', transform:btnHover?'translateY(-1px)':'translateY(0)', transition:'all 0.18s cubic-bezier(0.4,0,0.2,1)', letterSpacing:'-0.1px' }}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <p style={{ textAlign:'center', marginTop:'24px', fontSize:'11.5px', color:'#bbb', lineHeight:1.6 }}>
            By signing in you agree to our <span style={{ color:'#4f6ef7', cursor:'pointer' }}>Terms</span> and <span style={{ color:'#4f6ef7', cursor:'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}