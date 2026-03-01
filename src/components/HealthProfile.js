import { useState, useEffect } from 'react';
import { pm25ToRisk } from '../services/airQuality';

const CONDITION_MULTIPLIERS = {
  asthma: 1.6, copd: 1.7, heartDisease: 1.4,
  elderly: 1.3, child: 1.25, pregnant: 1.35, none: 1.0,
};

const ACTIVITY_EXPOSURE = {
  walking: 1.3, cycling: 1.5, transit: 0.8, driving: 0.6,
};

const scoreToColor = (s) => {
  if (s <= 2) return '#22c55e';
  if (s <= 4) return '#84cc16';
  if (s <= 6) return '#eab308';
  if (s <= 8) return '#f97316';
  return '#ef4444';
};

const scoreToLabel = (s) => {
  if (s <= 2) return 'Low Risk';
  if (s <= 4) return 'Moderate';
  if (s <= 6) return 'Elevated';
  if (s <= 8) return 'High Risk';
  return 'Dangerous';
};

const generateAdvice = (score, profile, avgPm25) => {
  const hasAsthma  = profile.conditions?.includes('asthma');
  const isCycling  = profile.activity === 'cycling';
  const isChild    = profile.conditions?.includes('child');

  if (score <= 3) return isCycling
    ? 'Good day for cycling. Air quality is favorable across most of Chicago.'
    : 'Air quality is good for your profile today. Enjoy outdoor activities.';

  if (score <= 5) return hasAsthma
    ? 'Moderate risk for asthma. Keep your inhaler accessible, avoid industrial corridors.'
    : 'Moderate conditions. Avoid prolonged outdoor exercise in high-traffic areas.';

  if (score <= 7) return isChild
    ? 'Elevated risk for children. Limit outdoor time, especially near busy roads.'
    : hasAsthma
      ? 'High risk for asthma today. Use the route planner to find your lowest-exposure path.'
      : 'Elevated pollution. Use clean route planner and reduce outdoor exercise time.';

  return hasAsthma
    ? '🚨 Dangerous for asthma today. Consider staying indoors or wearing an N95 outside.'
    : '🚨 Very high pollution. Limit all outdoor exposure and use clean routes.';
};

const calculatePersonalRisk = (stations, profile) => {
  if (!stations?.length || !profile) return null;
  const avgPm25 = stations.reduce((sum, s) => sum + parseFloat(s.pm25), 0) / stations.length;
  const baseRisk = pm25ToRisk(avgPm25);
  const condMult = profile.conditions?.length
    ? Math.max(...profile.conditions.map(c => CONDITION_MULTIPLIERS[c] || 1.0))
    : 1.0;
  const actMult = ACTIVITY_EXPOSURE[profile.activity] || 1.0;
  const score = Math.min(10, Math.round(baseRisk * condMult * actMult * 2)) / 2;
  return {
    score, maxScore: 10,
    avgPm25: avgPm25.toFixed(1),
    advice: generateAdvice(score, profile, avgPm25),
    color: scoreToColor(score),
    label: scoreToLabel(score),
  };
};

// ── ONBOARDING MODAL ──
function OnboardingModal({ onSave }) {
  const [step, setStep]             = useState(1);
  const [conditions, setConditions] = useState([]);
  const [activity, setActivity]     = useState('');
  const [name, setName]             = useState('');

  const conditionOptions = [
    { id: 'asthma',       label: 'Asthma',        icon: '🫁' },
    { id: 'copd',         label: 'COPD',          icon: '💨' },
    { id: 'heartDisease', label: 'Heart Disease', icon: '❤️' },
    { id: 'elderly',      label: 'Age 65+',       icon: '👴' },
    { id: 'child',        label: 'Child Under 12',icon: '👶' },
    { id: 'pregnant',     label: 'Pregnant',      icon: '🤰' },
    { id: 'none',         label: 'None of these', icon: '✅' },
  ];

  const activityOptions = [
    { id: 'walking',  label: 'Walking',        icon: '🚶' },
    { id: 'cycling',  label: 'Cycling',        icon: '🚴' },
    { id: 'transit',  label: 'Public Transit', icon: '🚌' },
    { id: 'driving',  label: 'Driving',        icon: '🚗' },
  ];

  const toggleCondition = (id) => {
    if (id === 'none') { setConditions(['none']); return; }
    setConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev.filter(c => c !== 'none'), id]
    );
  };

  const handleSave = () => {
    const profile = { name: name || 'You', conditions, activity };
    localStorage.setItem('airguardian_profile', JSON.stringify(profile));
    onSave(profile);
  };

  const btnStyle = (active) => ({
    padding: '10px 14px',
    background: active ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: active ? '#34d399' : '#9ca3af',
    fontSize: 13, fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s',
  });

  const primaryBtn = (disabled) => ({
    flex: 2, padding: 13,
    background: !disabled ? 'linear-gradient(135deg, #34d399, #059669)' : 'rgba(255,255,255,0.08)',
    border: 'none', borderRadius: 10,
    color: !disabled ? '#022c22' : '#4b5563',
    fontWeight: 700, fontSize: 14,
    cursor: !disabled ? 'pointer' : 'not-allowed',
    fontFamily: 'DM Sans, sans-serif',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(6,8,15,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'rgba(15,20,35,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20, padding: '32px 28px',
        maxWidth: 460, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'fadeIn 0.35s ease',
      }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: s <= step ? 24 : 8, height: 8, borderRadius: 4,
              background: s <= step ? '#34d399' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }}/>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>👋 Welcome to AirGuardian</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
              Tell us about yourself so we can calculate your
              <strong style={{ color: '#34d399' }}> personal daily risk score</strong> — not just generic PM2.5 numbers.
            </div>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>What should we call you?</label>
            <input
              placeholder="Your name (e.g. Elena)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(2)}
              style={{
                width: '100%', padding: '12px 14px', marginBottom: 20,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, color: '#fff', fontSize: 14,
                fontFamily: 'DM Sans, sans-serif', outline: 'none',
              }}
            />
            <button onClick={() => setStep(2)} style={primaryBtn(false)}>Next →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Any health conditions?</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>Select all that apply — this weights your personal risk score.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {conditionOptions.map(opt => (
                <button key={opt.id} onClick={() => toggleCondition(opt.id)} style={btnStyle(conditions.includes(opt.id))}>
                  <span>{opt.icon}</span><span>{opt.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...btnStyle(false), flex: 1, justifyContent: 'center' }}>← Back</button>
              <button onClick={() => setStep(3)} disabled={conditions.length === 0} style={primaryBtn(conditions.length === 0)}>Next →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>How do you usually commute?</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>Cyclists breathe 50% more deeply than drivers — this changes your score.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {activityOptions.map(opt => (
                <button key={opt.id} onClick={() => setActivity(opt.id)}
                  style={{ ...btnStyle(activity === opt.id), justifyContent: 'center', padding: '16px 14px', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ ...btnStyle(false), flex: 1, justifyContent: 'center' }}>← Back</button>
              <button onClick={handleSave} disabled={!activity} style={primaryBtn(!activity)}>🌬️ See My Risk Score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── RISK BADGE ──
function RiskBadge({ riskData, profile, onReset }) {
  const [expanded, setExpanded] = useState(true);
  if (!riskData) return null;
  const { score, maxScore, advice, color, label, avgPm25 } = riskData;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 20, zIndex: 1500,
      width: expanded ? 280 : 'auto',
      background: 'rgba(6,8,15,0.92)', backdropFilter: 'blur(16px)',
      border: `1px solid ${color}40`, borderRadius: 16,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}20`,
      overflow: 'hidden', transition: 'all 0.3s ease',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div onClick={() => setExpanded(!expanded)} style={{
        padding: expanded ? '14px 16px 10px' : '12px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: `${color}20`, border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {profile?.name || 'Your'} Risk Today
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
        </div>
        <div style={{ fontSize: 12, color: '#4b5563' }}>{expanded ? '▼' : '▲'}</div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563', marginBottom: 4 }}>
              <span>Safe</span>
              <span style={{ color: '#6b7280' }}>City avg: {avgPm25} μg/m³</span>
              <span>Dangerous</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
              <div style={{
                height: '100%', width: `${(score / maxScore) * 100}%`,
                background: `linear-gradient(90deg, #22c55e, ${color})`,
                borderRadius: 3, transition: 'width 0.8s ease',
              }}/>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color, marginTop: 3 }}>{score} / {maxScore}</div>
          </div>
          <div style={{
            background: `${color}10`, border: `1px solid ${color}25`,
            borderRadius: 10, padding: '10px 12px',
            fontSize: 12, color: '#d1d5db', lineHeight: 1.55, marginBottom: 10,
          }}>
            {advice}
          </div>
          <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 10 }}>
            Profile: {profile?.conditions?.filter(c => c !== 'none').join(', ') || 'No conditions'} · {profile?.activity}
          </div>
          <button onClick={onReset} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, color: '#4b5563', fontSize: 11, padding: '6px 10px',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            ✎ Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default function HealthProfile({ stations, profile, onProfileSave }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('airguardian_profile');
    if (saved) {
      try { onProfileSave(JSON.parse(saved)); }
      catch (e) { setShowOnboarding(true); }
    } else {
      const t = setTimeout(() => setShowOnboarding(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSave = (p) => { onProfileSave(p); setShowOnboarding(false); };
  const handleReset = () => { localStorage.removeItem('airguardian_profile'); onProfileSave(null); setShowOnboarding(true); };

  const riskData = profile && stations.length > 0 ? calculatePersonalRisk(stations, profile) : null;

  return (
    <>
      {showOnboarding && !profile && <OnboardingModal onSave={handleSave} />}
      {profile && !showOnboarding && <RiskBadge riskData={riskData} profile={profile} onReset={handleReset} />}
    </>
  );
}