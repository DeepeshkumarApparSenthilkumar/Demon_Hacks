import { useState, useRef, useEffect } from 'react';

const buildAirContext = (stations) => {
  if (!stations?.length) return 'No sensor data available.';
  const sorted = [...stations].sort((a, b) => parseFloat(b.pm25) - parseFloat(a.pm25));
  const worst5 = sorted.slice(0, 5).map(s => `${s.id}: ${s.pm25} μg/m³ (${s.label})`);
  const best5  = sorted.slice(-5).reverse().map(s => `${s.id}: ${s.pm25} μg/m³ (${s.label})`);
  const avg    = (stations.reduce((s, x) => s + parseFloat(x.pm25), 0) / stations.length).toFixed(1);
  const danger = stations.filter(s => s.risk >= 4).map(s => s.id);
  return `LIVE CHICAGO AIR QUALITY (right now):
- Active sensors: ${stations.length}
- City average PM2.5: ${avg} μg/m³
- Most polluted: ${worst5.join('; ')}
- Cleanest areas: ${best5.join('; ')}
- Dangerous zones (risk 4-5): ${danger.length > 0 ? danger.join(', ') : 'None currently'}`;
};

const buildProfileContext = (profile) => {
  if (!profile) return '';
  const conds = profile.conditions?.filter(c => c !== 'none').join(', ') || 'none';
  return `USER PROFILE: Name: ${profile.name}, Conditions: ${conds}, Commute: ${profile.activity}`;
};

const SYSTEM_PROMPT = `You are AirGuardian's AI assistant — a friendly, knowledgeable guide for Chicago residents navigating air quality.

You have access to REAL-TIME PM2.5 sensor data for the Chicago metro area. Use it to give specific, actionable advice.

Rules:
- Always reference specific Chicago neighborhoods in your answers
- Give concrete recommendations based on the live data you receive
- Keep responses SHORT — 2-4 sentences max
- Factor in the user's health profile when giving advice
- Use plain conversational language — no bullet lists or markdown headers
- Sound like a caring local guide, not a robot`;

export default function AirChat({ stations, profile }) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey${profile?.name ? ` ${profile.name}` : ''}! 👋 Ask me anything about Chicago's air quality right now — like "where should I run today?" or "is it safe to bike from Pilsen to the Loop?"`,
  }]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const context = `${buildAirContext(stations)}\n\n${buildProfileContext(profile)}\n\nUSER QUESTION: ${text}`;

      const apiMessages = newMessages.map((msg, idx) =>
        idx === newMessages.length - 1
          ? { role: 'user', content: context }
          : { role: msg.role, content: msg.content }
      );

        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: SYSTEM_PROMPT,
                messages: apiMessages,
            }),
        });

      const data = await response.json();
      const reply = data.content?.find(b => b.type === 'text')?.text || "Sorry, couldn't get a response. Try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Check your internet and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Where should I walk my dog today?",
    "Is it safe to cycle from Pilsen to the Loop?",
    "Which areas have the worst air right now?",
    "Should I wear a mask outside today?",
  ];

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: open ? 420 : 28, left: 20, zIndex: 1600,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          border: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          cursor: 'pointer', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'bottom 0.3s ease, transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Green dot when closed */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 64, left: 56, zIndex: 1700,
          width: 10, height: 10, borderRadius: '50%',
          background: '#34d399', border: '2px solid #06080f',
          boxShadow: '0 0 6px rgba(52,211,153,0.8)',
        }}/>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, left: 20, zIndex: 1500,
          width: 340, height: 380,
          background: 'rgba(6,8,15,0.96)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeIn 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
            }}>🌬️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AirGuardian AI</div>
              <div style={{ fontSize: 10, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px rgba(52,211,153,0.8)' }}/>
                Live data · {stations.length} sensors
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 10, color: '#374151', fontFamily: 'Space Mono, monospace' }}>Claude AI</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.07)',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  fontSize: 12.5, lineHeight: 1.55,
                  color: msg.role === 'user' ? '#fff' : '#d1d5db',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px 14px 14px 4px',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `pulse 1s ${delay}ms infinite` }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion chips — only on first message */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: 10, color: '#4b5563', textAlign: 'center' }}>Try asking:</div>
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, padding: '7px 10px',
                    color: '#a5b4fc', fontSize: 11,
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Ask about Chicago air quality..."
              disabled={loading}
              style={{
                flex: 1, padding: '9px 12px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10, color: '#fff', fontSize: 12,
                fontFamily: 'DM Sans, sans-serif', outline: 'none',
              }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)',
              color: input.trim() && !loading ? '#fff' : '#4b5563',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}