import type { BusinessProfile } from './store';

// We try to fetch real data from our Node.js backend proxy.
// If the backend isn't running (e.g., standard demo mode), we seamlessly fallback to local mocks.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function extractBusinessProfile(
    input: string
): Promise<{ profile?: BusinessProfile }> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
        });
        if (!res.ok) throw new Error("Backend offline");
        const data = await res.json();
        return {
            profile: data.isComplete ? data.extractedData : undefined
        };
    } catch (e) {
        // Fallback Mock
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    profile: { name: "Tony's Deli", type: "Sandwich Shop", address: "Chicago Loop", staffCount: 4, peakHours: "11am - 2pm", primaryPainPoint: "Predicting demand" }
                });
            }, 1000);
        });
    }
}

export async function fetchDemandPrediction(profile: BusinessProfile) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/demand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile })
        });
        if (!res.ok) throw new Error("Backend offline");
        return await res.json();
    } catch (e) {
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    score: 28,
                    tier: 'SLOW',
                    peakHour: '12:30',
                    reasoning: "CTA ridership at Clark/Lake is tracking 22% below average. Wind chills of 18°F are forecast during your 11am-2pm peak window. Fridays are already your weakest day.",
                    staffRec: 2,
                    prepReduction: 35
                });
            }, 1500);
        });
    }
}

export async function generateMorningBrief(profile: BusinessProfile, demandJson: any) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/brief`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, demandData: demandJson })
        });
        if (!res.ok) throw new Error("Backend offline");
        return await res.json();
    } catch (e) {
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    headline: "🔴 SLOW DAY AHEAD",
                    whyParagraph: "CTA ridership at Clark/Lake is tracking 22% below average. Wind chills of 18°F are forecast during your 11am–2pm peak window. No events within walking distance. Fridays are already your weakest day.",
                    actions: [
                        "Call in 2 staff instead of 4. Estimated savings: $160 today.",
                        "Reduce bread and protein prep by 35% to minimize waste.",
                        "Text your regulars a Friday Flash Deal ($2 off) — recovers ~15% of lost volume.",
                        "Plan to close at 1:30pm instead of 2:30pm if traffic is below 20 by noon."
                    ],
                    outlook: [
                        { day: 'Friday', date: '28', score: 28, trend: 'down', color: 'bg-red-500' },
                        { day: 'Saturday', date: '01', score: 71, trend: 'up', color: 'bg-green-500' },
                        { day: 'Sunday', date: '02', score: 79, trend: 'up', color: 'bg-blue-500' }
                    ]
                });
            }, 1000);
        });
    }
}

export async function sendOracleMessage(
    history: { role: string; text: string }[],
    newMessage: string,
    profile: BusinessProfile | null
): Promise<{ text: string }> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMessage, context: history, profile })
        });
        if (!res.ok) throw new Error("Backend offline");
        const data = await res.json();
        return { text: data.reply };
    } catch (e) {
        // Fallback Mock
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ text: "Based on my analysis, I recommend trimming 2 hours of labor on Friday afternoon by releasing a front-of-house employee at 1:30 PM." });
            }, 1000);
        });
    }
}

export async function fetchRealTimeAlerts(profile: BusinessProfile) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile })
        });
        if (!res.ok) throw new Error("Backend offline");
        return await res.json();
    } catch (e) {
        // Fallback Mock
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    alerts: [
                        {
                            id: "alert_1",
                            type: "weather",
                            severity: "medium",
                            title: "Cold Weather Impact",
                            message: "Current temperature of 35°F with wind chill may reduce foot traffic by 15-20% during peak hours.",
                            action: "Consider reducing staff by 1 person and running a hot drink promotion.",
                            timestamp: new Date().toISOString()
                        },
                        {
                            id: "alert_2", 
                            type: "transit",
                            severity: "low",
                            title: "CTA Delays",
                            message: "Red Line experiencing 10-minute delays due to signal problems at Clark/Division.",
                            action: "Expect reduced customer flow from north side neighborhoods.",
                            timestamp: new Date().toISOString()
                        }
                    ]
                });
            }, 800);
        });
    }
}

export async function fetchAdvancedInsights(profile: BusinessProfile, demandData: any) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/insights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, demandData })
        });
        if (!res.ok) throw new Error("Backend offline");
        return await res.json();
    } catch (e) {
        // Fallback Mock
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    businessHealth: {
                        score: 85,
                        grade: "A",
                        factors: ["Strong location", "Good staffing", "Weather resilience"]
                    },
                    revenueOptimization: [
                        {
                            strategy: "Dynamic pricing during peak hours",
                            potentialIncrease: "15-20%",
                            implementation: "Easy",
                            timeframe: "1-2 weeks"
                        }
                    ],
                    competitiveAdvantages: [
                        {
                            advantage: "Prime CTA location",
                            impact: "High",
                            leverage: "Transit-focused marketing"
                        }
                    ],
                    growthOpportunities: [
                        {
                            opportunity: "Delivery partnership",
                            marketSize: "$2.5M local market",
                            investment: "Low",
                            roi: "250%"
                        }
                    ],
                    riskMitigation: [
                        {
                            risk: "Weather dependency",
                            probability: "Medium",
                            impact: "Revenue fluctuation",
                            mitigation: "Weather-based promotions"
                        }
                    ],
                    techRecommendations: [
                        {
                            technology: "AI-powered inventory management",
                            cost: "$200/month",
                            savings: "$800/month",
                            payback: "3 months"
                        }
                    ],
                    customerExperience: [
                        {
                            enhancement: "Mobile ordering app",
                            satisfaction: "+35%",
                            retention: "+25%",
                            cost: "$5,000 setup"
                        }
                    ],
                    marketTrends: [
                        {
                            trend: "Contactless payment adoption",
                            relevance: "High",
                            action: "Implement NFC payments"
                        }
                    ],
                    actionPlan: {
                        immediate: ["Weather-based staffing adjustments"],
                        shortTerm: ["Delivery partnership setup"],
                        longTerm: ["Mobile app development"]
                    }
                });
            }, 1200);
        });
    }
}

export async function fetchCompetitorAnalysis(profile: BusinessProfile) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/competitors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile })
        });
        if (!res.ok) throw new Error("Backend offline");
        return await res.json();
    } catch (e) {
        // Fallback Mock
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    marketOverview: {
                        totalMarketSize: "$15.2M",
                        growthRate: "8.5%",
                        competitorCount: 12,
                        marketSaturation: "Medium"
                    },
                    competitors: [
                        {
                            name: "Competitor A",
                            type: "Similar Business",
                            distance: "0.3 miles",
                            strengths: ["Established brand", "Lower prices"],
                            weaknesses: ["Poor location", "Limited hours"],
                            marketShare: "22%"
                        },
                        {
                            name: "Competitor B", 
                            type: "Chain Restaurant",
                            distance: "0.5 miles",
                            strengths: ["Marketing budget", "Brand recognition"],
                            weaknesses: ["Generic quality", "Poor service"],
                            marketShare: "18%"
                        }
                    ],
                    competitivePositioning: {
                        yourRank: 3,
                        totalCompetitors: 12,
                        positioning: "Premium quality leader",
                        uniqueValue: "AI-powered operations"
                    },
                    swotAnalysis: {
                        strengths: ["Prime location", "AI integration", "Quality focus"],
                        weaknesses: ["New brand", "Limited marketing", "Higher prices"],
                        opportunities: ["Delivery expansion", "Tech adoption", "Tourism growth"],
                        threats: ["Competition increase", "Economic downturn", "Regulations"]
                    },
                    strategicRecommendations: [
                        {
                            recommendation: "Differentiate through AI-powered personalization",
                            priority: "High",
                            impact: "Market leadership",
                            effort: "Medium"
                        }
                    ],
                    marketGaps: [
                        {
                            gap: "Late-night delivery service",
                            opportunity: "High",
                            investment: "Low"
                        }
                    ]
                });
            }, 1000);
        });
    }
}
