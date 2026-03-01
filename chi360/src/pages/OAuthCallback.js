import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useUser();

  useEffect(() => {
    const token = params.get('token');
    const rawNew = params.get('new');
    const isNew = rawNew === 'true' || rawNew === '1';
    console.log('OAuthCallback debug:', { rawNew, isNew, token: !!token });
    const error = params.get('error');

    if (error || !token) {
      navigate('/?error=' + (error || 'oauth_failed'));
      return;
    }

    // Decode user from JWT payload (no verify needed — backend already verified)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = { id: payload.sub, email: payload.email, name: payload.name, area: '', totpEnabled: false };
      login(user, token);
      // Small delay to ensure context + sessionStorage are set before navigating
      setTimeout(() => {
        navigate((isNew || !user.name) ? '/profile-setup' : '/welcome');
      }, 100);
    } catch {
      navigate('/');
    }
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#04060e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid #4f6ef7', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Signing you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}