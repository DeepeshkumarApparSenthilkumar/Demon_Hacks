import { useState, useEffect } from 'react';
import { MessageSquare, Home, Bell, Calendar, User, Brain } from 'lucide-react';
import DashboardScreen from './screens/DashboardScreen';
import ChatScreen from './screens/ChatScreen';
import AlertsScreen from './screens/AlertsScreen';
import ForecastScreen from './screens/ForecastScreen';
import ProfileScreen from './screens/ProfileScreen';
import InsightsScreen from './screens/InsightsScreen';
import { getProfile } from './services/store';
import { runAlertPoller } from './services/alertService';

import AssistantChatScreen from './screens/AssistantChatScreen';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(getProfile());
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    // If no profile, default to Chat (Onboarding)
    if (!profile) {
      setActiveTab('chat');
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const interval = runAlertPoller(profile, () => {
        // Increment unread mock
        setUnreadAlerts(prev => prev + 1);
      });
      return () => clearInterval(interval);
    }
  }, [profile]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'chat':
        if (!profile) return <ChatScreen onProfileComplete={(p) => { setProfile(p); setActiveTab('dashboard'); }} />;
        return <AssistantChatScreen profile={profile} />;
      case 'dashboard':
        return <DashboardScreen profile={profile} />;
      case 'alerts':
        return <AlertsScreen onRead={() => setUnreadAlerts(0)} />;
      case 'forecast':
        return <ForecastScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'profile':
        return <ProfileScreen profile={profile} onUpdate={setProfile} />;
      default:
        return <DashboardScreen profile={profile} />;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-background text-slate-100 font-sans overflow-hidden relative">

      {/* Dynamic Animated Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-accent/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-primary/80 backdrop-blur-xl border-r border-white/5 flex-col hidden md:flex shadow-2xl z-20 relative shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <span className="text-white text-sm font-bold">⚡</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">LOOPPULSE</h1>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarButton icon={<Home size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarButton icon={<Bell size={20} />} label="Live Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} badge={unreadAlerts} />
          <SidebarButton icon={<Calendar size={20} />} label="Forecast" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} />
          <SidebarButton icon={<Brain size={20} />} label="AI Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <SidebarButton icon={<MessageSquare size={20} />} label="Assistant" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <SidebarButton icon={<User size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden w-full">

        {/* Mobile Header */}
        <header className="bg-primary/90 backdrop-blur-md border-b border-white/5 text-white p-4 flex justify-between items-center md:hidden z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shadow-md shadow-accent/20">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <h1 className="text-xl font-bold tracking-wider">LOOPPULSE</h1>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <main className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
          <div className="min-h-full w-full max-w-7xl mx-auto md:p-8 animate-fade-in relative z-10">
            {renderScreen()}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden w-full bg-primary/95 backdrop-blur-xl border-t border-white/10 flex justify-between px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-safe">
          <NavButton icon={<Home size={22} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton icon={<Bell size={22} />} label="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} badge={unreadAlerts > 0 ? unreadAlerts : undefined} />
          <NavButton icon={<Calendar size={22} />} label="Forecast" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} />
          <NavButton icon={<Brain size={22} />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <NavButton icon={<MessageSquare size={22} />} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        </nav>
      </div>

    </div>
  );
}

function SidebarButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden relative ${active ? 'bg-accent/10 border border-accent/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}
    >
      {/* Active Indicator Line */}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_#F97316]"></div>}

      <div className={`relative transition-colors duration-300 ${active ? 'text-accent' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-primary shadow-lg animate-pulse">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={`font-medium transition-colors duration-300 ${active ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
    </button>
  );
}

function NavButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center relative transition-colors duration-300 ${active ? 'text-accent drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <div className="relative">
        <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>
          {icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-primary shadow-lg animate-pulse">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] mt-1 transition-all duration-300 ${active ? 'font-bold opacity-100' : 'font-medium opacity-0 translate-y-2 absolute bottom-[-15px]'}`}>{label}</span>
    </button>
  );
}

export default App;
