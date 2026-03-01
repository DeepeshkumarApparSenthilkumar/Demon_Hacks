import { useState, useEffect } from 'react';
import { getProfile } from '../services/store';
import type { BusinessProfile } from '../services/store';
import { fetchAdvancedInsights, fetchCompetitorAnalysis, fetchDemandPrediction } from '../services/aiService';
import { Brain, Users, Target, Zap, Lightbulb, BarChart3, Shield, Rocket, DollarSign, AlertTriangle } from 'lucide-react';

export default function InsightsScreen() {
    const [profile] = useState<BusinessProfile | null>(getProfile());
    const [insights, setInsights] = useState<any>(null);
    const [competitors, setCompetitors] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');

    useEffect(() => {
        if (profile) {
            loadAllData();
        }
    }, [profile]);

    const loadAllData = async () => {
        if (!profile) return;
        
        setLoading(true);
        try {
            console.log('Loading AI insights for profile:', profile);
            
            // Load demand data first
            const demand = await fetchDemandPrediction(profile);
            console.log('Demand data received:', demand);
            
            // Load insights and competitors in parallel
            const [insightsData, competitorsData] = await Promise.all([
                fetchAdvancedInsights(profile, demand),
                fetchCompetitorAnalysis(profile)
            ]);
            
            console.log('Insights data received:', insightsData);
            console.log('Competitors data received:', competitorsData);
            
            setInsights(insightsData);
            setCompetitors(competitorsData);
        } catch (error) {
            console.error('Failed to load insights:', error);
            // Show error message to user
            setInsights({
                error: true,
                message: "Failed to load AI insights. Please check your connection and try again."
            });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-20 text-slate-400 bg-secondary/30 rounded-3xl border border-glassBorder backdrop-blur-md animate-fade-in shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/50 relative border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-[20px] animate-pulse"></div>
                    <Brain size={32} className="text-slate-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2 font-display">AI Insights Offline</h2>
                <p className="text-slate-400 max-w-xs mb-4">Complete onboarding to unlock advanced AI business intelligence.</p>
                <button 
                    onClick={() => {
                        // Create test profile for debugging
                        const testProfile = {
                            name: "Tony's Deli",
                            type: "Restaurant",
                            address: "Chicago Loop, IL",
                            staffCount: 4,
                            peakHours: "11am-2pm",
                            primaryPainPoint: "Predicting customer demand"
                        };
                        localStorage.setItem('looppulse_profile', JSON.stringify(testProfile));
                        window.location.reload();
                    }}
                    className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                    Create Test Profile
                </button>
            </div>
        );
    }

    if (insights?.error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-20 text-slate-400 bg-secondary/30 rounded-3xl border border-glassBorder backdrop-blur-md animate-fade-in shadow-2xl max-w-lg mx-auto">
                <div className="w-20 h-20 bg-red-500/20 relative border border-red-500/30 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2 font-display">AI Insights Error</h2>
                <p className="text-slate-400 max-w-xs mb-4">{insights.message}</p>
                <button 
                    onClick={loadAllData}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Analyzing business intelligence...</p>
            </div>
        );
    }

    const renderBusinessHealth = () => {
        if (!insights?.businessHealth) return null;
        
        const health = insights.businessHealth;
        const gradeColor = health.grade === 'A' ? 'text-green-400' : health.grade === 'B' ? 'text-blue-400' : 'text-yellow-400';
        
        return (
            <div className="bg-gradient-to-br from-green-950/20 to-emerald-950/20 border border-green-800/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="text-green-400" size={20} />
                        Business Health Score
                    </h3>
                    <div className={`text-3xl font-black ${gradeColor}`}>{health.grade}</div>
                </div>
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Overall Score</span>
                        <span className="text-white font-bold">{health.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${health.score}%` }}
                        ></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-slate-300 font-medium">Key Factors:</p>
                    <div className="flex flex-wrap gap-2">
                        {health.factors.map((factor: string, i: number) => (
                            <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-xs font-medium border border-green-500/30">
                                {factor}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderRevenueOptimization = () => {
        if (!insights?.revenueOptimization) return null;
        
        return (
            <div className="bg-secondary/60 border border-glassBorder rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <DollarSign className="text-green-400" size={20} />
                    Revenue Optimization
                </h3>
                <div className="space-y-4">
                    {insights.revenueOptimization.map((strategy: any, i: number) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-medium">{strategy.strategy}</h4>
                                <span className="text-green-400 font-bold text-sm">{strategy.potentialIncrease}</span>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="text-blue-300">Implementation: {strategy.implementation}</span>
                                <span className="text-purple-300">Timeframe: {strategy.timeframe}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCompetitorAnalysis = () => {
        if (!competitors) return null;
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border border-blue-800/30 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <BarChart3 className="text-blue-400" size={20} />
                        Market Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{competitors.marketOverview?.totalMarketSize}</div>
                            <div className="text-xs text-slate-400">Market Size</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{competitors.marketOverview?.growthRate}</div>
                            <div className="text-xs text-slate-400">Growth Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{competitors.marketOverview?.competitorCount}</div>
                            <div className="text-xs text-slate-400">Competitors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{competitors.marketOverview?.marketSaturation}</div>
                            <div className="text-xs text-slate-400">Saturation</div>
                        </div>
                    </div>
                </div>

                <div className="bg-secondary/60 border border-glassBorder rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Target className="text-red-400" size={20} />
                        Competitive Positioning
                    </h3>
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400">Your Rank</span>
                            <span className="text-white font-bold">#{competitors.competitivePositioning?.yourRank} of {competitors.competitivePositioning?.totalCompetitors}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-accent to-orange-400 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${(competitors.competitivePositioning?.yourRank / competitors.competitivePositioning?.totalCompetitors) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-300 text-sm mb-2"><strong>Positioning:</strong> {competitors.competitivePositioning?.positioning}</p>
                        <p className="text-accent text-sm"><strong>Unique Value:</strong> {competitors.competitivePositioning?.uniqueValue}</p>
                    </div>
                </div>

                <div className="bg-secondary/60 border border-glassBorder rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Users className="text-purple-400" size={20} />
                        Top Competitors
                    </h3>
                    <div className="space-y-3">
                        {competitors.competitors?.slice(0, 3).map((competitor: any, i: number) => (
                            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-medium">{competitor.name}</h4>
                                        <p className="text-slate-400 text-xs">{competitor.type} • {competitor.distance}</p>
                                    </div>
                                    <span className="text-red-400 font-bold text-sm">{competitor.marketShare}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-green-300">Strengths:</span>
                                        <ul className="text-slate-400 mt-1">
                                            {competitor.strengths.map((s: string, j: number) => (
                                                <li key={j}>• {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="text-red-300">Weaknesses:</span>
                                        <ul className="text-slate-400 mt-1">
                                            {competitor.weaknesses.map((w: string, j: number) => (
                                                <li key={j}>• {w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderGrowthOpportunities = () => {
        if (!insights?.growthOpportunities) return null;
        
        return (
            <div className="bg-secondary/60 border border-glassBorder rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Rocket className="text-purple-400" size={20} />
                    Growth Opportunities
                </h3>
                <div className="space-y-4">
                    {insights.growthOpportunities.map((opp: any, i: number) => (
                        <div key={i} className="bg-gradient-to-r from-purple-950/30 to-pink-950/30 rounded-xl p-4 border border-purple-800/30">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-medium">{opp.opportunity}</h4>
                                <span className="text-purple-400 font-bold text-sm">{opp.roi}</span>
                            </div>
                            <div className="flex gap-4 text-xs mb-2">
                                <span className="text-blue-300">Market: {opp.marketSize}</span>
                                <span className="text-green-300">Investment: {opp.investment}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTechRecommendations = () => {
        if (!insights?.techRecommendations) return null;
        
        return (
            <div className="bg-secondary/60 border border-glassBorder rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Lightbulb className="text-yellow-400" size={20} />
                    Technology Recommendations
                </h3>
                <div className="space-y-4">
                    {insights.techRecommendations.map((tech: any, i: number) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <h4 className="text-white font-medium mb-2">{tech.technology}</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-red-400 font-bold">{tech.cost}</div>
                                    <div className="text-xs text-slate-400">Cost</div>
                                </div>
                                <div>
                                    <div className="text-green-400 font-bold">{tech.savings}</div>
                                    <div className="text-xs text-slate-400">Savings</div>
                                </div>
                                <div>
                                    <div className="text-blue-400 font-bold">{tech.payback}</div>
                                    <div className="text-xs text-slate-400">Payback</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-transparent p-4 md:p-6 relative max-w-6xl mx-auto w-full animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-glassBorder pb-6">
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-wider">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center border border-purple-500/30">
                        <Brain size={20} className="text-white" />
                    </div>
                    AI BUSINESS INTELLIGENCE
                </h2>
                <button
                    onClick={loadAllData}
                    className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                >
                    <Zap size={16} /> REFRESH
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['insights', 'competitors', 'growth', 'technology'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                            activeTab === tab
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        {renderBusinessHealth()}
                        {renderRevenueOptimization()}
                    </div>
                )}
                
                {activeTab === 'competitors' && renderCompetitorAnalysis()}
                
                {activeTab === 'growth' && renderGrowthOpportunities()}
                
                {activeTab === 'technology' && renderTechRecommendations()}
            </div>
        </div>
    );
}
