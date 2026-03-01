import React from 'react';
import { getPasswordStrength } from '../utils/passwordStrength';

export default function PasswordStrengthMeter({ password, show }) {
  if (!show || !password) return null;

  const { score, label, color, checks } = getPasswordStrength(password);

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '999px',
            background: score >= i ? color : '#e0e0e8',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Label */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '8px',
      }}>
        <span style={{ fontSize: '11.5px', color: '#999', fontWeight: 500 }}>
          Password strength
        </span>
        <span style={{ fontSize: '11.5px', fontWeight: 600, color }}>
          {label}
        </span>
      </div>

      {/* Checklist */}
      <div style={{
        background: '#f8f8fb', borderRadius: '8px',
        padding: '10px 12px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px',
      }}>
        {checks.map(({ label: cl, pass }) => (
          <div key={cl} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11.5px',
            color: pass ? '#22c55e' : '#aaa',
            fontWeight: pass ? 500 : 400,
            transition: 'color 0.2s',
          }}>
            <span style={{ fontSize: '10px' }}>{pass ? '✓' : '○'}</span>
            {cl}
          </div>
        ))}
      </div>
    </div>
  );
}
