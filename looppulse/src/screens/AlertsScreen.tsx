import { useState, useEffect } from 'react';
import { getAlerts, clearAlerts, getProfile } from '../services/store';
import type { Alert, BusinessProfile } from '../services/store';
import { triggerDemoAlert } from '../services/alertService';
import { fetchRealTimeAlerts } from '../services/aiService';
import { Trash2, AlertCircle, Radio, BrainCircuit, AlertTriangle, Zap, RefreshCw } from 'lucide-react';

export default function AlertsScreen({ onRead }: { onRead: () => void }) {
    const [alerts, setAlerts] = useState<Alert[]>(getAlerts());
    const [isLoading, setIsLoading] = useState(false);
    const profile = getProfile() as BusinessProfile;

    useEffect(() => {
        onRead();
    }, [onRead]);

    const loadRealTimeAlerts = async () => {
        if (!profile) return;
        
        setIsLoading(true);
        try {
            const realTimeData = await fetchRealTimeAlerts(profile);
            if (realTimeData.alerts && realTimeData.alerts.length > 0) {
                // Convert real-time alerts to the expected format
                const formattedAlerts = realTimeData.alerts.map((alert: any) => ({
                    id: alert.id,
                    type: alert.type,
                    severity: alert.severity,
                    title: alert.title,
                    message: alert.message,
                    action: alert.action,
                    timestamp: alert.timestamp
                }));
                
                setAlerts(formattedAlerts);
            }
        } catch (error) {
            console.error('Failed to load real-time alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlerts = () => {
        setAlerts(getAlerts());
    };

    const clearAll = () => {
        clearAlerts();
        setAlerts([]);
    };

    const handleDemoTrigger = () => {
        triggerDemoAlert(profile, loadAlerts);
    };

    return (
        <div className="flex flex-col h-full bg-transparent p-4 md:p-6 relative max-w-4xl mx-auto w-full animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-glassBorder pb-6">
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-wider">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Radio size={20} className="text-orange-400 animate-pulse" />
                    </div>
                    LIVE SIGNALS NETWORK
                </h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadRealTimeAlerts} 
                        disabled={isLoading}
                        className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300 transition-colors shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest group disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} /> 
                        <span className="hidden md:inline">REFRESH</span>
                    </button>
                    {alerts.length > 0 && (
                        <button onClick={clearAll} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest group">
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> <span className="hidden md:inline">PURGE</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pb-32">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center mt-10 text-slate-400 bg-secondary/30 rounded-[2rem] border border-glassBorder backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <AlertCircle size={64} className="mb-6 mx-auto opacity-30 group-hover:text-blue-400 group-hover:opacity-100 transition-colors" />
                            <h3 className="text-2xl font-bold text-slate-200 mb-2 font-display uppercase tracking-wider">Sector Clear</h3>
                            <p className="max-w-xs mx-auto text-slate-500">Monitoring real-time CTA anomaly feeds, hyper-local meteorological arrays, and foot traffic scanners.</p>
                        </div>
                    </div>
                ) : (
                    alerts.map((alert, i) => (
                        <div key={alert.id} className="bg-secondary/60 backdrop-blur-xl p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-glassBorder animate-slide-up relative overflow-hidden group hover:border-orange-500/30 transition-colors" style={{ animationDelay: `${i * 100}ms` }}>

                            {/* Color Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-red-600 shadow-[0_0_15px_#F97316]"></div>

                            {/* Glow background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>

                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-orange-500/20 shadow-inner border border-orange-500/30 text-orange-400 font-bold px-3 py-1.5 rounded-lg text-xs tracking-[0.2em] uppercase flex items-center gap-2">
                                        <AlertTriangle size={12} className="animate-pulse" /> {alert.type} INTERCEPT
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HRS
                                </span>
                            </div>

                            <p className="font-bold text-slate-100 text-lg mb-5 relative z-10 pl-2 border-l-2 border-slate-700">{alert.message}</p>

                            {alert.reasoning && (
                                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-inner relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BrainCircuit size={14} className="text-blue-400" />
                                        <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Oracle Reasoning Syntax</span>
                                    </div>
                                    <p className="text-sm text-slate-300 italic font-mono leading-relaxed">System output: {alert.reasoning}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={handleDemoTrigger}
                    className="relative group bg-gradient-to-r from-orange-500 to-red-600 border-none text-white px-8 py-4 rounded-full font-black text-sm tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.4)] hover:-translate-y-1 transition-all uppercase overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -left-[100%] top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-[sweep_1s_ease-in-out]"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        <Zap size={16} /> TRIGGER INJECTION
                    </span>
                </button>
            </div>
        </div >
    );
}
