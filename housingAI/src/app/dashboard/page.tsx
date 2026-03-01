"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, TrendingUp, AlertTriangle, Map, BrainCircuit, FileText, ArrowRight, Search, BarChart3, TrendingDown, Building2 } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line, Cell
} from 'recharts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock Data for charts
const rentForecastData = [
    { month: 'Jan 2025', rent: 2100 },
    { month: 'Feb 2025', rent: 2120 },
    { month: 'Mar 2025', rent: 2150 },
    { month: 'Apr 2025', rent: 2180 },
    { month: 'May 2025', rent: 2200 },
    { month: 'Jun 2025', rent: 2250 },
    { month: 'Jul 2025', rent: 2280 },
    { month: 'Aug 2025', rent: 2300, forecast: 2300 }, // Connection point
    { month: 'Sep 2025', forecast: 2320 },
    { month: 'Oct 2025', forecast: 2350 },
    { month: 'Nov 2025', forecast: 2380 },
    { month: 'Dec 2025', forecast: 2400 },
    { month: 'Jan 2026', forecast: 2450 },
]

const rentChangeData = [
    { neighborhood: 'Avondale', change: 10.5 },
    { neighborhood: 'West Loop', change: 8.5 },
    { neighborhood: 'Logan Square', change: 5.2 },
    { neighborhood: 'Lake View', change: 2.1 },
    { neighborhood: 'Lincoln Park', change: -1.5 },
    { neighborhood: 'South Loop', change: -3.2 },
    { neighborhood: 'Streeterville', change: -5.4 },
]

const growingTownsData = [
    { town: 'Avondale', growth: 12.5 },
    { town: 'Bridgeport', growth: 9.8 },
    { town: 'Humboldt Park', growth: 7.2 },
    { town: 'Pilsen', growth: 6.1 },
    { town: 'Uptown', growth: 4.5 },
]

const areaProfiles: Record<string, Record<string, number>> = {
    'Logan Square': { Safety: 75, Transit: 90, Nightlife: 95, Affordability: 65, Quietness: 60 },
    'River North': { Safety: 85, Transit: 100, Nightlife: 90, Affordability: 35, Quietness: 40 },
    'Bridgeport': { Safety: 80, Transit: 70, Nightlife: 60, Affordability: 85, Quietness: 85 },
    'Avondale': { Safety: 70, Transit: 80, Nightlife: 85, Affordability: 75, Quietness: 65 },
}
const areas = Object.keys(areaProfiles)

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const [compArea1, setCompArea1] = useState('Logan Square')
    const [compArea2, setCompArea2] = useState('River North')

    // Generate comparison data dynamically based on selection
    const comparisonData = useMemo(() => {
        const metrics = ['Safety', 'Transit', 'Nightlife', 'Affordability', 'Quietness']
        return metrics.map(metric => ({
            metric,
            [compArea1]: areaProfiles[compArea1][metric],
            [compArea2]: areaProfiles[compArea2][metric],
            fullMark: 100
        }))
    }, [compArea1, compArea2])

    // Modulate forecast slightly based on search query just for visual effect
    const displayForecast = useMemo(() => {
        if (!searchQuery) return rentForecastData
        const modifier = searchQuery.length % 2 === 0 ? 1.05 : 0.95
        return rentForecastData.map(d => ({
            ...d,
            rent: d.rent ? Math.round(d.rent * modifier) : undefined,
            forecast: d.forecast ? Math.round(d.forecast * modifier) : undefined,
        }))
    }, [searchQuery])

    return (
        <div className="p-8 space-y-8 h-full overflow-y-auto bg-background/95">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">CHI Command Center</h1>
                    <p className="text-muted-foreground mt-2">Your central hub for Chicago housing intelligence and tools.</p>
                </div>
                <div className="flex gap-2 text-sm text-primary items-center bg-primary/10 px-3 py-1.5 rounded-full font-medium">
                    <Sparkles className="w-4 h-4" /> AI Data Models Active
                </div>
            </div>

            {/* Feature Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-primary/20 hover:border-primary/50 transition-all flex flex-col">
                    <CardHeader className="pb-2">
                        <Map className="w-8 h-8 text-primary mb-2" />
                        <CardTitle>Interactive Map Search</CardTitle>
                        <CardDescription>Explore Chicago properties with rich spatial intelligence overlays.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-4">
                        <Link href="/">
                            <Button className="w-full gap-2">Explore Map <ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-card border-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col">
                    <CardHeader className="pb-2">
                        <BrainCircuit className="w-8 h-8 text-purple-500 mb-2" />
                        <CardTitle>AI Matchmaker</CardTitle>
                        <CardDescription>Let our AI find the perfect Chicago neighborhood based on your exact lifestyle.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-4">
                        <Link href="/matchmaker">
                            <Button variant="secondary" className="w-full gap-2 text-purple-500 hover:text-purple-600">Find Matches <ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-card border-blue-500/20 hover:border-blue-500/50 transition-all flex flex-col">
                    <CardHeader className="pb-2">
                        <FileText className="w-8 h-8 text-blue-500 mb-2" />
                        <CardTitle>Lease Analyzer</CardTitle>
                        <CardDescription>Upload a lease to catch hidden fees, risks, and RLTO violations instantly.</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-4">
                        <Link href="/lease-analyzer">
                            <Button variant="outline" className="w-full gap-2 text-blue-500 border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500">Analyze Lease <ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Live Market Insights Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mt-12 mb-6 gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Live Market Intelligence
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Real-time macro trends and hyper-local forecasting</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search a location (e.g. Logan Square)..."
                        className="pl-9 bg-background shadow-inner border-primary/20 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 1. Rent Trend & Forecast */}
                <Card className="col-span-1 shadow-md border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Rent Trend & 1-Year Forecast
                        </CardTitle>
                        <CardDescription>
                            {searchQuery ? `Projected rental prices for "${searchQuery}"` : 'Projected median rental prices across Chicago'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} domain={['dataMin - 100', 'auto']} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`$${value}`, 'Price']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="rent" name="Historical Rent" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="forecast" name="AI Forecast (Next 6 Mo)" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Rent Increasing vs Decreasing */}
                <Card className="col-span-1 shadow-md border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-destructive" />
                            Rent Rate Velocity
                        </CardTitle>
                        <CardDescription>Neighborhoods with fastest increasing vs decreasing rents (MoM %)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rentChangeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="neighborhood" stroke="#888888" fontSize={11} tickLine={false} axisLine={true} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <RechartsTooltip
                                    cursor={{ fill: '#2a2a2a' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`${value}%`, 'Rent Change']}
                                />
                                <Bar dataKey="change" radius={[4, 4, 4, 4]}>
                                    {rentChangeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.change > 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Area Profile Comparison */}
                <Card className="col-span-1 shadow-md border-primary/10">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Map className="w-5 h-5 text-indigo-500" />
                                    Area Profile Comparison
                                </CardTitle>
                                <CardDescription>Compare lifestyle metrics between two neighborhoods</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-muted text-xs border border-border p-1.5 rounded-md focus:ring-primary focus:border-primary outline-none"
                                    value={compArea1}
                                    onChange={(e) => setCompArea1(e.target.value)}
                                >
                                    {areas.map(a => <option key={`1-${a}`} value={a}>{a}</option>)}
                                </select>
                                <span className="text-muted-foreground text-xs font-bold">VS</span>
                                <select
                                    className="bg-muted text-xs border border-border p-1.5 rounded-md focus:ring-primary focus:border-primary outline-none"
                                    value={compArea2}
                                    onChange={(e) => setCompArea2(e.target.value)}
                                >
                                    {areas.map(a => <option key={`2-${a}`} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={comparisonData}>
                                <PolarGrid stroke="#444" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#888888', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name={compArea1} dataKey={compArea1} stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                                <Radar name={compArea2} dataKey={compArea2} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                <Legend wrapperStyle={{ fontSize: '12px', color: '#888', paddingTop: '10px' }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 4. Growing Towns */}
                <Card className="col-span-1 shadow-md border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                            Emerging Markets / Growing Towns
                        </CardTitle>
                        <CardDescription>Areas experiencing the highest rapid development and gentrification</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growingTownsData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
                                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <YAxis dataKey="town" type="category" stroke="#e5e7eb" fontSize={13} fontWeight={500} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#2a2a2a' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`+${value}%`, 'Growth Rate']}
                                />
                                <Bar dataKey="growth" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-destructive/10 border-destructive/20 mt-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/20 rounded-full blur-3xl -mr-10 -mt-10" />
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Active Eviction Risk Alerts</CardTitle>
                    <CardDescription className="text-destructive/80">The system has flagged a surge in corporate evictions</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-medium">Multiple properties managed by <strong>&quot;South Loop Realty Group&quot;</strong> have filed mass evictions in the past 14 days. We strongly advise using the <strong>Lease Analyzer</strong> before signing any new agreements in that zip code.</p>
                </CardContent>
            </Card>

        </div>
    )
}
