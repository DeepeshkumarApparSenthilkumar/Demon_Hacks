import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionWarning from '../components/SessionWarning';
import LoginHistory from '../components/LoginHistory';
import Logo from '../components/Logo';
import HolographicOrb from '../components/HolographicOrb';

const apps = [
  { key:'chitrade', name:'Markets', tag:'Markets & Finance', emoji:'📈', desc:"Real-time market intelligence, trading signals, and financial insights driven by Chicago's economic pulse.", href:'https://chi-trade.vercel.app/', color:'#4f6ef7', colorAlt:'#7c5cfc', glow:'rgba(79,110,247,0.18)', glowHover:'rgba(79,110,247,0.28)', tagBg:'rgba(79,110,247,0.12)', tagColor:'#6b84ff', tagBorder:'rgba(79,110,247,0.25)', iconBg:'linear-gradient(135deg, rgba(79,110,247,0.25), rgba(124,92,252,0.35))', iconShadow:'0 0 0 1px rgba(79,110,247,0.25), 0 6px 20px rgba(79,110,247,0.2)', lineColor:'rgba(79,110,247,0.6)' },
  { key:'looplens', name:'Skyline', tag:'City Analytics', emoji:'🔄', desc:'Deep neighborhood analytics, city trends, and data-driven stories from every angle of Chicago.', href:'https://looppulse-app.vercel.app/', color:'#22d3ee', colorAlt:'#06b6d4', glow:'rgba(34,211,238,0.12)', glowHover:'rgba(34,211,238,0.2)', tagBg:'rgba(34,211,238,0.1)', tagColor:'#67e8f9', tagBorder:'rgba(34,211,238,0.22)', iconBg:'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(6,182,212,0.3))', iconShadow:'0 0 0 1px rgba(34,211,238,0.25), 0 6px 20px rgba(34,211,238,0.15)', lineColor:'rgba(34,211,238,0.55)' },
  { key:'airguardian', name:'Atmos', tag:'Air Quality', emoji:'🌬️', desc:'Real-time Chicago air quality monitoring, pollution alerts, and environmental insights across every neighborhood.', href:'https://airguardian123-git-main-asp25scm06vs-projects.vercel.app/', color:'#34d399', colorAlt:'#059669', glow:'rgba(52,211,153,0.12)', glowHover:'rgba(52,211,153,0.22)', tagBg:'rgba(52,211,153,0.1)', tagColor:'#6ee7b7', tagBorder:'rgba(52,211,153,0.25)', iconBg:'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(5,150,105,0.35))', iconShadow:'0 0 0 1px rgba(52,211,153,0.25), 0 6px 20px rgba(52,211,153,0.15)', lineColor:'rgba(52,211,153,0.55)' },
  { key:'housingai', name:'Living', tag:'Real Estate & Housing', emoji:'🏠', desc:'AI-powered Chicago housing market insights, price predictions, and neighborhood-level real estate intelligence.', href:'https://housingai1-git-main-deepesh-kumar-appar-senthilkumars-projects.vercel.app/', color:'#f59e0b', colorAlt:'#d97706', glow:'rgba(245,158,11,0.12)', glowHover:'rgba(245,158,11,0.22)', tagBg:'rgba(245,158,11,0.1)', tagColor:'#fcd34d', tagBorder:'rgba(245,158,11,0.25)', iconBg:'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.35))', iconShadow:'0 0 0 1px rgba(245,158,11,0.25), 0 6px 20px rgba(245,158,11,0.15)', lineColor:'rgba(245,158,11,0.55)' },
  { key:'looptour', name:'Discover', tag:'City Tours', emoji:'🗺️', desc:'Adaptive city tours that discover Chicago at your pace — personalized routes, hidden gems, and local stories.', href:'https://demon-hacks-onzu.vercel.app/', color:'#f472b6', colorAlt:'#ec4899', glow:'rgba(244,114,182,0.12)', glowHover:'rgba(244,114,182,0.22)', tagBg:'rgba(244,114,182,0.1)', tagColor:'#f9a8d4', tagBorder:'rgba(244,114,182,0.25)', iconBg:'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.35))', iconShadow:'0 0 0 1px rgba(244,114,182,0.25), 0 6px 20px rgba(244,114,182,0.15)', lineColor:'rgba(244,114,182,0.55)' },
  { key:'busguard', name:'Transit', tag:'Transit & Safety', emoji:'🚌', desc:'Real-time CTA tracking, ghost bus detection, train map, and AI transit assistant for Chicago commuters.', href:'https://hackthon-30-production.up.railway.app/', color:'#a78bfa', colorAlt:'#7c3aed', glow:'rgba(167,139,250,0.12)', glowHover:'rgba(167,139,250,0.22)', tagBg:'rgba(167,139,250,0.1)', tagColor:'#c4b5fd', tagBorder:'rgba(167,139,250,0.25)', iconBg:'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.35))', iconShadow:'0 0 0 1px rgba(167,139,250,0.25), 0 6px 20px rgba(167,139,250,0.15)', lineColor:'rgba(167,139,250,0.55)' },
];

function AppCard({ app, delay }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVisible(true),delay); return()=>clearTimeout(t); },[delay]);
  return (
    <a href={app.href} target="_blank" rel="noopener noreferrer" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ display:'block', textDecoration:'none', background:'rgba(10,10,22,0.75)', border:`1px solid ${hovered?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.07)'}`, borderRadius:'18px', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)', padding:'32px 28px', position:'relative', overflow:'hidden', cursor:'pointer', opacity:visible?1:0, transform:visible?(hovered?'translateY(-6px)':'translateY(0)'):'translateY(24px)', transition:'opacity 0.6s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.2s, box-shadow 0.3s', boxShadow:hovered?`0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${app.glowHover}, 0 0 0 1px rgba(255,255,255,0.06)`:`0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${app.glow}` }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg, transparent, ${app.lineColor}, transparent)`, opacity:hovered?1:0.5, transition:'opacity 0.3s' }} />
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% -10%, ${app.glow} 0%, transparent 65%)`, opacity:hovered?1:0, transition:'opacity 0.4s', pointerEvents:'none' }} />
      <div style={{ display:'inline-flex', alignItems:'center', background:app.tagBg, color:app.tagColor, border:`1px solid ${app.tagBorder}`, borderRadius:'999px', padding:'3px 10px', fontSize:'11px', fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase', marginBottom:'20px', position:'relative', zIndex:1 }}>{app.tag}</div>
      <div style={{ width:'58px', height:'58px', borderRadius:'15px', background:app.iconBg, boxShadow:app.iconShadow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', marginBottom:'18px', position:'relative', zIndex:1, transform:hovered?'scale(1.06)':'scale(1)', transition:'transform 0.3s' }}>{app.emoji}</div>
      <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'20px', letterSpacing:'-0.3px', color:app.color, marginBottom:'10px', position:'relative', zIndex:1 }}>{app.name}</h3>
      <p style={{ fontSize:'13.5px', lineHeight:1.65, color:'rgba(232,234,246,0.45)', position:'relative', zIndex:1, fontWeight:400 }}>{app.desc}</p>
      <div style={{ position:'absolute', bottom:'20px', right:'22px', width:'28px', height:'28px', borderRadius:'50%', background:hovered?'rgba(255,255,255,0.08)':'transparent', border:`1px solid ${hovered?'rgba(255,255,255,0.12)':'transparent'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(232,234,246,0.5)', fontSize:'14px', transition:'all 0.25s', transform:hovered?'translate(2px,-2px)':'translate(0,0)', zIndex:1 }}>↗</div>
    </a>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const { user, logout, sessionExpired } = useUser();
  const [visible, setVisible] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  useSessionTimeout({
    enabled: !!user,
    onWarning: () => setShowWarning(true),
    onTimeout: () => { setShowWarning(false); sessionExpired(); navigate('/'); },
  });

  useEffect(() => {
    if (!user?.name && !user?.email) { navigate('/'); return; }
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [user, navigate]);

  if (!user) return null;
  const firstName = user.name || user.email?.split('@')[0] || 'there';
  const initial = firstName.charAt(0).toUpperCase();
  const location = user.area ? `${user.area}, Chicago` : 'Chicago, IL';

  const handleSignOut = async () => { await logout(); navigate('/'); };
  const handleStayLoggedIn = () => setShowWarning(false);

  return (
    <>
      {/* Session warning modal */}
      {showWarning && <SessionWarning onStayLoggedIn={handleStayLoggedIn} onLogout={handleSignOut} />}
      {/* Login history modal */}
      <LoginHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Holographic orb background */}
      <HolographicOrb />

      {/* Top-left logo */}
      <div style={{ position:'fixed', top:'24px', left:'32px', zIndex:100, opacity:visible?1:0, transition:'opacity 0.6s 0.1s' }}>
        <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'20px', letterSpacing:'-0.5px', color:'#e8eaf6' }}>chi<span style={{ color:'#4f6ef7' }}>360</span></span>
      </div>

      {/* Top-right user controls */}
      <div style={{ position:'fixed', top:'16px', right:'24px', zIndex:100, display:'flex', alignItems:'center', gap:'10px', opacity:visible?1:0, transition:'opacity 0.6s 0.1s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'rgba(232,234,246,0.4)', background:'rgba(12,12,24,0.7)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'999px', padding:'6px 12px', backdropFilter:'blur(12px)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.5 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {user.area || 'Chicago'}
        </div>
        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, #4f6ef7, #7c5cfc)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'13px', color:'#fff', boxShadow:'0 0 12px rgba(79,110,247,0.4)' }}>{initial}</div>
        <button onClick={handleSignOut}
          style={{ background:'rgba(12,12,24,0.7)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'999px', color:'rgba(232,234,246,0.6)', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12px', fontWeight:500, cursor:'pointer', padding:'7px 16px', backdropFilter:'blur(12px)', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.color='#e8eaf6';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='rgba(232,234,246,0.6)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
          Sign out
        </button>
      </div>

      {/* 2FA setup nudge */}
      {user && !user.totpEnabled && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:50, background:'rgba(12,12,24,0.95)', border:'1px solid rgba(79,110,247,0.3)', borderRadius:'16px', padding:'16px 20px', maxWidth:'280px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', opacity:visible?1:0, transition:'opacity 0.6s 0.8s' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
            <span style={{ fontSize:'20px' }}>🔐</span>
            <div>
              <p style={{ fontSize:'13px', fontWeight:600, color:'#e8eaf6', marginBottom:'4px' }}>Enable 2FA</p>
              <p style={{ fontSize:'12px', color:'rgba(232,234,246,0.5)', lineHeight:1.5, marginBottom:'10px' }}>Add an extra layer of security with Google Authenticator.</p>
              <button onClick={()=>navigate('/setup-2fa')} style={{ fontSize:'12px', fontWeight:600, color:'#4f6ef7', background:'rgba(79,110,247,0.12)', border:'1px solid rgba(79,110,247,0.25)', borderRadius:'8px', padding:'6px 12px', cursor:'pointer' }}>
                Set up now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ position:'fixed', inset:0, zIndex:10, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'160px', paddingBottom:'60px', paddingLeft:'24px', paddingRight:'24px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'680px', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'rgba(79,110,247,0.1)', border:'1px solid rgba(79,110,247,0.2)', borderRadius:'999px', padding:'5px 14px', fontSize:'12px', fontWeight:500, color:'#6b84ff', marginBottom:'20px', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(12px)', transition:'all 0.55s 0.1s' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            {location}
          </div>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:'clamp(38px,6vw,62px)', letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:'14px', color:'#e8eaf6', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(16px)', transition:'all 0.6s 0.15s' }}>
            Hi, {firstName}.
          </h1>
          <p style={{ fontSize:'15px', fontWeight:400, color:'rgba(232,234,246,0.42)', lineHeight:1.6, marginBottom:'52px', opacity:visible?1:0, transition:'opacity 0.6s 0.2s' }}>
            Chicago. Every Angle, Every Insight.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'18px', textAlign:'left' }}>
            {apps.map((app,i)=><AppCard key={app.key} app={app} delay={300+i*120} />)}
          </div>
          <p style={{ marginTop:'48px', fontSize:'11.5px', color:'rgba(232,234,246,0.18)', letterSpacing:'0.3px', fontWeight:400, opacity:visible?1:0, transition:'opacity 0.6s 0.5s' }}>
            chi360 · Chicago. Every Angle, Every Insight.
          </p>
        </div>
      </div>
    </>
  );
}