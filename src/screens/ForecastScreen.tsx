import { useState } from 'react';
import { getProfile } from '../services/store';
import type { BusinessProfile } from '../services/store';
import { Calendar as CalendarIcon, MapPin, Users, Activity } from 'lucide-react';

export default function ForecastScreen() {
    const [profile] = useState<BusinessProfile | null>(getProfile());

    // Hardcode 3-day details for demo polish
    const days = [
        {
            date: 'Feb 28',
            day: 'Friday',
            score: 28,
            tier: 'CRITICAL',
            color: 'from-rose-500 to-red-600 shadow-red-500/20 border-red-500/30 text-rose-400',
            bgClass: 'bg-rose-950/20',
            border: 'border-rose-900/50',
            glow: 'bg-rose-500/10',
            driver: 'CTA ridership tracking 22% below historical average. Wind chills of 18°F driving down foot traffic.',
            tip: 'Cut standard prep by 40%. Release one front-of-house staff member after 1:00 PM to save on labor.'
        },
        {
            date: 'Mar 01',
            day: 'Saturday',
            score: 71,
            tier: 'NORMAL',
            color: 'from-emerald-400 to-green-600 shadow-emerald-500/20 border-emerald-500/30 text-emerald-400',
            bgClass: 'bg-emerald-950/20',
            border: 'border-emerald-900/50',
            glow: 'bg-emerald-500/10',
            driver: 'Standard weekend baseline. Weather improving to 45°F. No major events in immediate 0.5mi radius.',
            tip: 'Standard operating procedure. Standard prep volume. Typical 3-person staff needed.'
        },
        {
            date: 'Mar 02',
            day: 'Sunday',
            score: 84,
            tier: 'BUSY',
            color: 'from-blue-400 to-indigo-600 shadow-blue-500/20 border-blue-500/30 text-blue-400',
            bgClass: 'bg-blue-950/20',
            border: 'border-blue-900/50',
            glow: 'bg-blue-500/10',
            driver: 'Sold-out matinee show at nearby theater discharging 2,800 people at 3:30PM along your block.',
            tip: 'Prepare grab-n-go items for the post-theater rush. Keep extra staff on clock until 4:30PM.'
        }
    ];

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-20 text-slate-400 bg-secondary/30 rounded-3xl border border-glassBorder backdrop-blur-md animate-fade-in shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/50 relative border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[20px] animate-pulse"></div>
                    <CalendarIcon size={32} className="text-slate-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2 font-display">Forecast Offline</h2>
                <p className="text-slate-400 max-w-xs">Initialize your business protocol via the Assistant to unlock long-term intelligence.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 p-4 md:p-6 w-full animate-fade-in">
            <h2 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-3 text-white tracking-wider">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                    <CalendarIcon className="text-white" size={20} />
                </div>
                72-HOUR AI PROJECTION
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-10">
                {days.map((d, i) => (
                    <div key={i} className={`rounded-[2rem] border ${d.border} ${d.bgClass} p-1 backdrop-blur-md shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col h-full overflow-hidden relative group animate-slide-up`} style={{ animationDelay: `${i * 150}ms` }}>
                        {/* Glow Background */}
                        <div className={`absolute inset-0 ${d.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>

                        <div className="bg-secondary/80 rounded-[1.8rem] p-6 h-full flex flex-col relative z-10 border border-white/5 shadow-inner">
                            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 relative">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{d.day}</h3>
                                    <span className="text-slate-200 font-bold tracking-wider">{d.date}</span>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`text-4xl font-black ${d.color.split(' ').pop()} drop-shadow-[0_0_10px_currentColor] leading-none`}>
                                        {d.score}
                                    </div>
                                    <div className={`bg-gradient-to-r ${d.color} rounded-md text-white px-2.5 py-1 font-black text-[9px] uppercase tracking-[0.2em]`}>
                                        {d.tier}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 space-y-5 flex-1 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-900/80 transition-colors">
                                <div className="absolute -right-4 -top-4 text-slate-800/20 pointer-events-none rotate-12">
                                    <Activity size={100} />
                                </div>

                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-bold text-slate-500 mb-2.5 flex items-center gap-2 uppercase tracking-widest">
                                        <div className="p-1 rounded bg-slate-800 border border-slate-700">
                                            <MapPin size={10} className="text-white" />
                                        </div>
                                        Key Driver
                                    </h4>
                                    <p className="text-[13px] text-slate-300 leading-relaxed font-light">{d.driver}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
                                    <h4 className="text-[10px] font-bold text-slate-500 mb-2.5 flex items-center gap-2 uppercase tracking-widest">
                                        <div className="p-1 rounded bg-accent/20 border border-accent/20">
                                            <Users size={10} className="text-accent" />
                                        </div>
                                        AI Recommendation
                                    </h4>
                                    <p className="text-[13px] text-slate-200 font-medium leading-relaxed">{d.tip}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                }
            </div >
        </div >
    );
}
