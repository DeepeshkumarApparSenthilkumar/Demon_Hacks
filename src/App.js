import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Background from './components/Background';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import TwoFactor from './pages/TwoFactor';
import Welcome from './pages/Welcome';
import OAuthCallback from './pages/OAuthCallback';
import { UserProvider } from './context/UserContext';

function AppRoutes() {
  const location = useLocation();
  const showBackground = location.pathname !== '/welcome';

  return (
    <>
      {showBackground && <Background />}
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/profile-setup" element={<Profile />} />
        <Route path="/2fa" element={<TwoFactor />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}