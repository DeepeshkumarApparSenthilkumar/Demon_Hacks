'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, MapPin, Train, Coffee, Building2, Trees } from 'lucide-react'
import clsx from 'clsx'

const COMMUTE_OPTIONS = [
    "The Loop (Downtown)",
    "Fulton Market / West Loop",
    "Hyde Park (UChicago)",
    "O'Hare (Need Blue Line access)",
    "Medical District",
    "100% Remote (Need good coffee shops)"
]

const VIBE_OPTIONS = [
    { label: "Lakefront access & running paths", icon: <Trees className="w-4 h-4" /> },
    { label: "Bustling cocktail bars & dining", icon: <Coffee className="w-4 h-4" /> },
    { label: "Quiet, tree-lined vintage streets", icon: <Building2 className="w-4 h-4" /> },
    { label: "Gritty arts, music, and thrift scene", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Heavy CTA transit focus", icon: <Train className="w-4 h-4" /> }
]

const MUST_HAVE_OPTIONS = [
    "Under 10 min walk to CTA Train",
    "In-unit Washer/Dryer",
    "High Safety / Walkable at night",
    "Covered or Zoned Parking",
    "Very Pet Friendly (Parks nearby)"
]

export default function MatchmakerPage() {
    const [step, setStep] = useState(1)
    const [profile, setProfile] = useState({ commuteTo: '', vibe: '', budget: '', mustHaves: '' })
    const [loading, setLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any>(null)

    const handleMatch = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ai/matchmaker', {
                method: 'POST',
                body: JSON.stringify({ profile })
            })
            const data = await res.json()
            setResults(data)
            setStep(5) // Results step
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const setField = (field: keyof typeof profile, val: string) => {
        // Toggle if already exists in a comma list, or just append
        setProfile(prev => {
            const current = prev[field]
            if (current.includes(val)) {
                return { ...prev, [field]: current.replace(val, '').replace(/,\s*,/g, ',').trim().replace(/^,|,$/g, '') }
            } else {
                return { ...prev, [field]: current ? `${current}, ${val}` : val }
            }
        })
    }

    return (
        <div className="h-full w-full bg-background flex items-center justify-center p-4 relative overflow-y-auto">
            {/* Background decorative elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-4xl relative mt-16 md:mt-0 z-10 my-auto">
                <Card className="w-full shadow-2xl border-primary/20 backdrop-blur-md bg-card/90 text-card-foreground">
                    <CardHeader className="text-center pb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/40 to-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">CHI Matchmaker</CardTitle>
                        <CardDescription className="text-base mt-2">Let our AI scan 50+ Chicago neighborhoods to find your perfect fit.</CardDescription>

                        {/* Progress Bar */}
                        <div className="w-full bg-secondary h-2 rounded-full mt-6 overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-500 ease-in-out" style={{ width: `${(step / 5) * 100}%` }} />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold">1. Where is your center of gravity?</h3>
                                    <p className="text-sm text-muted-foreground">Select common destinations or type your own commute.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {COMMUTE_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setField('commuteTo', opt)}
                                            className={clsx(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                profile.commuteTo.includes(opt) ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Or type specific location (e.g. Evanston, Navy Pier)"
                                    value={profile.commuteTo}
                                    onChange={(e) => setProfile({ ...profile, commuteTo: e.target.value })}
                                    className="bg-background/50"
                                />
                                <Button className="w-full mt-4" size="lg" onClick={() => setStep(2)}>Next Step</Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold">2. What&apos;s your ideal neighborhood vibe?</h3>
                                    <p className="text-sm text-muted-foreground">Select the energy you want right outside your door.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {VIBE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setField('vibe', opt.label)}
                                            className={clsx(
                                                "flex items-center gap-3 p-3 rounded-xl text-left border transition-all",
                                                profile.vibe.includes(opt.label) ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary" : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <div className={clsx("p-2 rounded-lg", profile.vibe.includes(opt.label) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                                                {opt.icon}
                                            </div>
                                            <span className="text-sm font-medium leading-tight">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Other vibes? (e.g. Needs a great local bookstore)"
                                    value={profile.vibe}
                                    onChange={(e) => setProfile({ ...profile, vibe: e.target.value })}
                                    className="bg-background/50"
                                />
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep(1)}>Back</Button>
                                    <Button size="lg" className="w-2/3" onClick={() => setStep(3)}>Next Step</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold">3. What is your realistic monthly budget?</h3>
                                    <p className="text-sm text-muted-foreground">This helps us filter out deeply incompatible areas.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                    <Input
                                        type="number"
                                        placeholder="2000"
                                        className="pl-8 text-lg py-6 bg-background/50 font-bold"
                                        value={profile.budget}
                                        onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    {['1200', '1800', '2500', '3500+'].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setProfile({ ...profile, budget: amt })}
                                            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-transparent"
                                        >
                                            ~ ${amt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep(2)}>Back</Button>
                                    <Button size="lg" className="w-2/3" onClick={() => setStep(4)}>Next Step</Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold">4. What are your absolute dealbreakers?</h3>
                                    <p className="text-sm text-muted-foreground">What must this neighborhood have to earn your signature?</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {MUST_HAVE_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setField('mustHaves', opt)}
                                            className={clsx(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                profile.mustHaves.includes(opt) ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Anything else? (e.g. Ground floor only, no high-rises)"
                                    value={profile.mustHaves}
                                    onChange={(e) => setProfile({ ...profile, mustHaves: e.target.value })}
                                    className="bg-background/50"
                                />
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep(3)}>Back</Button>
                                    <Button
                                        size="lg"
                                        className="w-2/3 relative overflow-hidden group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0"
                                        onClick={handleMatch}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Analyzing Chicago Data...</span>
                                        ) : (
                                            <span className="flex items-center gap-2 font-bold"><Sparkles className="w-4 h-4" /> Generate AI Matches</span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 5 && results && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95">
                                <div className="text-center space-y-2 pb-4 border-b">
                                    <h3 className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Your Chicago Matches</h3>
                                    <p className="text-sm text-muted-foreground">Based on your unique lifestyle profile.</p>
                                </div>

                                <div className="space-y-5 max-h-[400px] overflow-y-auto no-scrollbar pr-2 pb-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {results.matches?.map((match: any, i: number) => (
                                        <div key={i} className="bg-card p-5 rounded-2xl space-y-4 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all -mr-10 -mt-10 pointer-events-none" />

                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-2xl text-foreground flex items-center gap-1.5">
                                                        <MapPin className="w-5 h-5 text-primary" />
                                                        {match.neighborhoodName}
                                                    </h4>
                                                    {match.estimatedRentText && (
                                                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-1 pl-6">
                                                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Est Rent: {match.estimatedRentText}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="bg-gradient-to-br from-primary to-purple-500 text-white px-3 py-1.5 rounded-full text-lg font-black shadow-md flex items-center gap-1">
                                                    {match.matchScore}%
                                                </div>
                                            </div>

                                            {match.lifestyleTags && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {match.lifestyleTags.map((tag: any, idx: number) => (
                                                        <span key={idx} className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs font-bold border">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-sm text-foreground leading-relaxed bg-background/50 p-3 rounded-lg border-l-2 border-primary">
                                                {match.reasoning}
                                            </p>

                                            {match.metrics && (
                                                <div className="mt-4 pt-4 border-t space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                            <span>Commute Match</span>
                                                            <span className={match.metrics.commuteScore > 80 ? 'text-green-500' : ''}>{match.metrics.commuteScore}%</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-blue-500 h-full" style={{ width: `${match.metrics.commuteScore}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                            <span>Budget Alignment</span>
                                                            <span className={match.metrics.budgetScore > 80 ? 'text-green-500' : ''}>{match.metrics.budgetScore}%</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-green-500 h-full" style={{ width: `${match.metrics.budgetScore}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                            <span>Vibe / Lifestyle Fit</span>
                                                            <span className={match.metrics.vibeScore > 80 ? 'text-green-500' : ''}>{match.metrics.vibeScore}%</span>
                                                        </div>
                                                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-purple-500 h-full" style={{ width: `${match.metrics.vibeScore}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button variant="outline" size="lg" className="w-1/2" onClick={() => { setStep(1); setProfile({ commuteTo: '', vibe: '', budget: '', mustHaves: '' }) }}>Start Another Search</Button>
                                    <Button size="lg" className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const matcherNeighborhoods = results.matches?.map((m: any) => m.neighborhoodName).join(', ') || ''
                                        const query = `Budget up to ${profile.budget}. Must haves: ${profile.mustHaves}. Vibe: ${profile.vibe}. Near ${matcherNeighborhoods}`
                                        window.location.href = `/?query=${encodeURIComponent(query)}`
                                    }}>
                                        List Houses with this filter
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

