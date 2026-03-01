import React from 'react';

export default function Logo({ small }) {
  const size = small ? 28 : 34;
  const fontSize = small ? 13 : 16;
  const textSize = small ? 14 : 17;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <div style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #4f6ef7 0%, #7c5cfc 100%)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: fontSize,
        color: '#fff',
        letterSpacing: '-0.5px',
        flexShrink: 0,
        boxShadow: '0 0 16px rgba(79,110,247,0.35)',
      }}>
        χ
      </div>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: textSize,
        letterSpacing: '-0.3px',
        color: '#e8eaf6',
      }}>
        chi<span style={{ color: '#4f6ef7' }}>360</span>
      </span>
    </div>
  );
}
