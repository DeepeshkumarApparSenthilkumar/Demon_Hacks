import { useEffect, useState } from 'react';
import type { BusinessProfile } from '../services/store';
import { fetchDemandPrediction, generateMorningBrief } from '../services/aiService';
import { AlertTriangle, Clock, RefreshCw, TrendingDown, TrendingUp, Zap, Wind, ThermometerSun, MapPin, User } from 'lucide-react';

export default function DashboardScreen({ profile }: { profile: BusinessProfile | null }) {
    const [demand, setDemand] = useState<Record<string, any> | null>(null);
    const [brief, setBrief] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            loadForecast();
        }
    }, [profile]);

    const loadForecast = async () => {
        setLoading(true);
        setDemand(null);
        setBrief(null);
        try {
            const demandData = await fetchDemandPrediction(profile!);
            setDemand(demandData);

            const briefData = await generateMorningBrief(profile!, demandData);
            setBrief(briefData);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-20 text-slate-400 bg-secondary/30 rounded-3xl border border-glassBorder backdrop-blur-md animate-fade-in shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/50 relative border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[20px] animate-pulse"></div>
                    <AlertTriangle size={32} className="text-slate-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2 font-display">Oracle Sleeping</h2>
                <p className="text-slate-400 max-w-xs">No profile footprint found. Please initialize your business protocol via the Assistant.</p>
            </div>
        );
    }

    const getTierColor = (score: number) => {
        if (score <= 30) return 'from-rose-500 to-red-600 shadow-red-500/20 shadow-xl border-red-500/30';
        if (score <= 50) return 'from-amber-400 to-orange-500 shadow-orange-500/20 shadow-xl border-orange-500/30';
        if (score <= 70) return 'from-emerald-400 to-green-600 shadow-teal-500/20 shadow-xl border-emerald-500/30';
        return 'from-purple-500 to-blue-600 shadow-blue-500/20 shadow-xl border-blue-500/30';
    };

    const getNeonColor = (score: number) => {
        if (score <= 30) return 'text-rose-400';
        if (score <= 50) return 'text-amber-400';
        if (score <= 70) return 'text-emerald-400';
        return 'text-cyan-400';
    }

    return (
        <div className="flex flex-col xl:grid xl:grid-cols-12 flex-1 gap-6 md:gap-8 pb-10 w-full animate-fade-in">
            {/* Left Column: Metrics Engine */}
            <div className="xl:col-span-5 flex flex-col gap-6">

                {/* Main Prediction Core */}
                <div className={`rounded-[2rem] p-8 text-white text-center relative min-h-[300px] flex flex-col justify-center items-center transition-all duration-700 overflow-hidden bg-gradient-to-br border
                    ${!demand ? 'from-secondary to-primary shadow-2xl shadow-black/40 border-glassBorder' : getTierColor(demand.score)}`}
                >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-color-burn"></div>

                    {/* Animated Light Sweep */}
                    <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-[sweep_2s_ease-in-out_infinite_alternate]" style={{ animationDelay: '3s' }}></div>

                    {loading && !demand ? (
                        <div className="relative z-10 flex flex-col items-center justify-center w-full animate-pulse-slow">
                            <RefreshCw className="animate-spin text-slate-400 mb-6" size={40} />
                            <h2 className="text-slate-400/80 text-sm font-bold tracking-[0.3em] uppercase mb-4 shadow-sm">Syncing with Grid</h2>
                            <div className="text-[96px] font-black leading-none select-none text-slate-700/50 drop-shadow-xl blur-sm tracking-tighter">--</div>
                        </div>
                    ) : demand && (
                        <div className="relative z-10 w-full animate-slide-up flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-6 shadow-inner">
                                <Zap size={14} className="text-yellow-400 animate-pulse" />
                                <span className="text-white/90 font-bold tracking-[0.2em] text-xs uppercase">Demand Oracle Active</span>
                            </div>

                            <div className="relative">
                                {/* Glow behind text */}
                                <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full scale-150"></div>
                                <div className="text-[120px] md:text-[140px] font-black leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none tracking-tighter relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                    {demand.score}
                                </div>
                            </div>

                            <div className="bg-black/40 backdrop-blur-xl border border-white/20 text-white px-6 py-2.5 rounded-2xl mt-8 font-black text-sm tracking-[0.2em] uppercase shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                                {demand.tier} EXTREMES
                            </div>
                        </div>
                    )}
                </div>

                {/* Sub-Metrics Cards Row 1 */}
                {demand && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/60 backdrop-blur-lg rounded-2xl shadow-xl border border-glassBorder p-5 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 bg-accent/5 w-24 h-24 rounded-full blur-xl group-hover:bg-accent/10 transition-colors"></div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Clock size={16} className="text-accent" />
                                <span className="font-semibold text-[11px] uppercase tracking-wider">Projected Peak</span>
                            </div>
                            <div className="text-xl font-bold text-slate-100 animate-fade-in">{demand.peakHour}</div>
                        </div>

                        <div className="bg-secondary/60 backdrop-blur-lg rounded-2xl shadow-xl border border-glassBorder p-5 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 bg-blue-500/5 w-24 h-24 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <User size={16} className="text-blue-400" />
                                <span className="font-semibold text-[11px] uppercase tracking-wider">Staff Rec</span>
                            </div>
                            <div className="text-xl font-bold text-slate-100 animate-fade-in">{demand.staffRec} Personnel</div>
                        </div>
                    </div>
                )}

                {/* AI Extracted Parameters Row 2 */}
                {demand && demand.insights && (
                    <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-secondary/60 backdrop-blur-lg rounded-2xl shadow-xl border border-glassBorder p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Target Margin</span>
                            <span className="text-emerald-400 font-bold text-lg">{demand.insights.marginOfError}%</span>
                        </div>
                        <div className="bg-secondary/60 backdrop-blur-lg rounded-2xl shadow-xl border border-glassBorder p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Est Dropoff</span>
                            <span className="text-rose-400 font-bold text-lg">{demand.insights.dropoffTime}</span>
                        </div>
                        <div className="bg-secondary/60 backdrop-blur-lg rounded-2xl shadow-xl border border-glassBorder p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Confidence</span>
                            <span className="text-cyan-400 font-bold text-lg">{demand.insights.confidenceLevel}%</span>
                        </div>
                    </div>
                )}

                {/* Environmental Context Ribbon */}
                {demand && demand.weather && (
                    <div className="bg-secondary/40 backdrop-blur-md rounded-2xl shadow-md border border-glassBorder p-4 flex items-center justify-between z-10 text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                                <ThermometerSun size={16} className="text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Temperature</p>
                                <p className="text-slate-200 font-semibold">{demand.weather.temp}°F</p>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-700"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                                <Wind size={16} className="text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Wind Speed</p>
                                <p className="text-slate-200 font-semibold">{demand.weather.wind} mph</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Strategic Brief & Horizon */}
            <div className="xl:col-span-7 flex flex-col gap-6 h-full">

                {loading && !brief && (
                    <div className="flex-1 bg-secondary/40 backdrop-blur-md rounded-3xl border border-glassBorder flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-2 border-4 border-b-blue-500 border-r-transparent border-t-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
                        </div>
                        <h3 className="text-slate-300 font-bold tracking-widest text-sm uppercase">Synthesizing Strategy Matrix</h3>
                        <p className="text-slate-500 text-xs mt-2 w-64 text-center">Crunching grid endpoints, CTA scans, and hyper-local meteorology arrays...</p>
                    </div>
                )}

                {/* Morning Brief Section */}
                {brief && (
                    <div className="bg-secondary/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-glassBorder overflow-hidden animate-slide-up flex-1 flex flex-col relative z-20">
                        {/* Header */}
                        <div className="bg-primary/50 px-6 py-5 border-b border-glassBorder flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-blue-500 to-purple-500"></div>
                            <h3 className="font-black text-slate-100 tracking-widest text-xs md:text-sm flex items-center gap-3 uppercase">
                                <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center border border-accent/30"><Zap size={12} className="text-accent" /></div>
                                Tactical Matrix
                            </h3>
                            <button onClick={loadForecast} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all bg-black/20 border border-white/5 shadow-inner" disabled={loading}>
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
                            {/* Decorative background logo/icon */}
                            <MapPin size={200} className="absolute right-[-40px] bottom-[-40px] text-slate-800/20 rotate-12 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                                    Primary Directive
                                </div>
                                <h4 className={`font-black text-2xl md:text-3xl mb-4 leading-tight ${demand ? getNeonColor(demand.score) : 'text-slate-200'}`}>{brief.headline}</h4>
                                <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 font-light border-l-2 border-slate-700 pl-4">
                                    {brief.whyParagraph}
                                </p>

                                <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <TrendingUp size={14} className="text-blue-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-200 uppercase tracking-widest text-sm">
                                        Execution Protocols
                                    </h4>
                                </div>

                                <ul className="space-y-4 relative">
                                    <div className="absolute left-3 top-2 bottom-4 w-[1px] bg-slate-800"></div>
                                    {brief.actions.map((action: string, i: number) => (
                                        <li key={i} className="flex gap-4 items-start text-slate-300 relative group animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                                            <div className="w-6 h-6 shrink-0 rounded-full bg-secondary border-2 border-slate-700 flex items-center justify-center relative z-10 mt-0.5 group-hover:border-accent transition-colors shadow-lg">
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full group-hover:bg-accent transition-colors"></div>
                                            </div>
                                            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex-1 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-default shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                                                {action}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3 Day Outlook Cards - Sleek Dark variants */}
                {brief && brief.outlook && (
                    <div className="mt-2 animate-fade-in z-20" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-400 text-xs tracking-[0.2em] uppercase pl-2">System Horizon [72H]</h4>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-700/50 to-transparent ml-4"></div>
                        </div>
                        <div className="flex gap-4 justify-between overflow-x-auto pb-2 custom-scrollbar">
                            {brief.outlook.map((day: any, i: number) => {
                                const isUp = day.trend === 'up';
                                return (
                                    <div key={i} className="flex-1 min-w-[110px] bg-secondary/60 backdrop-blur-md rounded-2xl p-5 border border-glassBorder shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:bg-slate-800 hover:border-slate-600 group relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">{day.day}</span>
                                        <span className={`text-3xl font-black my-2 relative z-10 ${isUp ? 'text-slate-100' : 'text-slate-300'}`}>{day.score}</span>
                                        <div className={`mt-1 p-1.5 rounded-full relative z-10 ${isUp ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-rose-400 border border-red-500/20'}`}>
                                            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
