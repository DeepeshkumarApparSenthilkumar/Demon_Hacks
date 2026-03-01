import { useState } from 'react';
import { clearProfile, clearAlerts, saveProfile } from '../services/store';
import type { BusinessProfile } from '../services/store';
import { Settings, LogOut, Code, User, MapPin, Target, Clock, Zap, Save, Edit3, X } from 'lucide-react';

export default function ProfileScreen({ profile, onUpdate }: { profile: BusinessProfile | null; onUpdate: (p: BusinessProfile | null) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<BusinessProfile | null>(profile);

    if (!profile || !formData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center mt-20 text-slate-400 bg-secondary/30 rounded-3xl border border-glassBorder backdrop-blur-md animate-fade-in shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/50 relative border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[20px] animate-pulse"></div>
                    <Settings size={32} className="text-slate-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2 font-display">System Uninitialized</h2>
                <p className="text-slate-400 max-w-xs">Run the onboarding protocol via the Assistant tab to register your footprint.</p>
            </div>
        );
    }

    const handleReset = () => {
        if (confirm("WARNING: This will purge all local matrix data and reset your Grid connection. Proceed?")) {
            clearProfile();
            clearAlerts();
            onUpdate(null);
        }
    };

    const handleSave = () => {
        if (formData) {
            saveProfile(formData);
            onUpdate(formData);
        }
        setIsEditing(false);
    };

    const handleChange = (field: keyof BusinessProfile, value: string | number) => {
        if (formData) {
            setFormData({ ...formData, [field]: value });
        }
    };

    return (
        <div className="flex flex-col flex-1 p-4 md:p-8 w-full animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-white tracking-wider">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-lg border border-slate-700 shrink-0">
                        <Settings className="text-slate-400" size={20} />
                    </div>
                    NODE CONFIGURATION
                </h2>

                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-accent/20 text-accent px-4 py-2.5 rounded-xl hover:bg-accent/30 transition-all border border-accent/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex-1 md:flex-none justify-center">
                            <Edit3 size={14} /> Modify Data
                        </button>
                    ) : (
                        <>
                            <button onClick={() => { setFormData(profile); setIsEditing(false); }} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl hover:bg-slate-700 hover:text-slate-200 transition-all border border-slate-600 shadow-lg flex-1 md:flex-none justify-center">
                                <X size={14} /> Cancel
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl hover:bg-emerald-500/30 transition-all border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-1 md:flex-none justify-center">
                                <Save size={14} /> Save Config
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-secondary/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-glassBorder p-6 md:p-10 space-y-8 relative overflow-hidden group">
                {/* Visual Flair */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
                {!isEditing && (
                    <div className="absolute right-10 top-10 pointer-events-none opacity-5 rotate-12 transition-opacity duration-500">
                        <Code size={120} className="text-slate-500" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors shadow-inner flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <User size={14} className="text-accent" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registered Entity</h3>
                        </div>
                        {isEditing ? (
                            <input value={formData.name} onChange={e => handleChange('name', e.target.value)} className="bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-white font-bold tracking-wide focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all w-full" placeholder="e.g. The Daily Bean" />
                        ) : (
                            <p className="font-black text-2xl text-slate-100">{profile.name}</p>
                        )}
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors shadow-inner flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <Target size={14} className="text-blue-400" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classification</h3>
                        </div>
                        {isEditing ? (
                            <input value={formData.type} onChange={e => handleChange('type', e.target.value)} className="bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-white font-bold tracking-wide focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all w-full" placeholder="e.g. Coffee Shop" />
                        ) : (
                            <p className="font-bold text-xl text-slate-300">{profile.type}</p>
                        )}
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors shadow-inner md:col-span-2 flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <MapPin size={14} className="text-rose-400" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grid Coordinates (Address)</h3>
                        </div>
                        {isEditing ? (
                            <input value={formData.address} onChange={e => handleChange('address', e.target.value)} className="bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-white font-bold tracking-wide focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all w-full" placeholder="e.g. 123 Main St, Chicago, IL" />
                        ) : (
                            <p className="font-bold text-xl text-slate-300">{profile.address}</p>
                        )}
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors shadow-inner flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <Settings size={14} className="text-emerald-400" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Parameter: Staffing</h3>
                        </div>
                        {isEditing ? (
                            <input type="number" value={formData.staffCount} onChange={e => handleChange('staffCount', parseInt(e.target.value) || 0)} className="bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-white font-bold tracking-wide focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-full" placeholder="e.g. 5" />
                        ) : (
                            <p className="font-bold text-xl text-slate-300">{profile.staffCount} <span className="text-sm font-normal text-slate-500">Personnel Units</span></p>
                        )}
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors shadow-inner flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <Clock size={14} className="text-amber-400" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Historical Load Zone</h3>
                        </div>
                        {isEditing ? (
                            <input value={formData.peakHours} onChange={e => handleChange('peakHours', e.target.value)} className="bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-white font-bold tracking-wide focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all w-full" placeholder="e.g. 8AM - 11AM" />
                        ) : (
                            <p className="font-bold text-xl text-slate-300">{profile.peakHours}</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-1">
                        <Zap size={14} className="text-orange-400" />
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Optimization Target (Pain Point)</h3>
                    </div>
                    {isEditing ? (
                        <textarea value={formData.primaryPainPoint} onChange={e => handleChange('primaryPainPoint', e.target.value)} rows={3} className="bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white font-bold tracking-wide focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all w-full resize-none mt-2" placeholder="What is the hardest part of managing your demand?" />
                    ) : (
                        <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-xl mt-2 shadow-inner group-hover:bg-orange-500/20 transition-colors duration-500">
                            <p className="text-orange-400 text-sm font-bold tracking-wide">{profile.primaryPainPoint}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <button
                    onClick={handleReset}
                    className="w-full bg-slate-900/50 backdrop-blur-md text-slate-400 font-bold py-4 rounded-2xl border border-red-500/20 hover:bg-red-500/10 hover:text-rose-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] shadow-lg group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEditing}
                >
                    <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <LogOut size={14} className="relative z-10 group-hover:-translate-x-1 transition-transform" />
                    <span className="relative z-10">Purge Node Data</span>
                </button>
            </div>

            <p className="text-center text-[10px] font-mono text-slate-600 mt-10 tracking-[0.2em] uppercase relative z-10">LoopPulse Core Protocol v1.0 • System Life Status: Nominal</p>
        </div>
    );
}
