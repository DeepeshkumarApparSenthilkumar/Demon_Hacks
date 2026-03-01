import React from 'react';

export default function Card({ children, style }) {
  return (
    <div style={{
      background: 'rgba(10,10,22,0.82)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      padding: '40px 36px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 0 0 1px rgba(79,110,247,0.07), 0 24px 60px rgba(0,0,0,0.7)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Subtle top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(79,110,247,0.5), rgba(124,92,252,0.3), transparent)',
      }} />
      {children}
    </div>
  );
}
