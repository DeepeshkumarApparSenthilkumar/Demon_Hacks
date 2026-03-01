'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, AlertOctagon, CheckCircle2, Loader2, DollarSign, Sparkles, ClipboardList, ShieldCheck, CalendarClock, Dog } from 'lucide-react'

export default function LeaseAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [analysis, setAnalysis] = useState<any>(null)

    const handleUpload = async () => {
        if (!file) return
        setAnalyzing(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/ai/lease-analyzer', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            setAnalysis(data)
        } catch (error) {
            console.error(error)
            alert("Failed to analyze lease.")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="h-full w-full bg-background overflow-y-auto p-8 relative">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">AI Lease Analyzer</h1>
                    <p className="text-muted-foreground text-lg">Upload your Chicago lease agreement. We&apos;ll scan for hidden fees, illegal clauses, and calculate true move-in costs.</p>
                </div>

                {!analysis && (
                    <Card className="max-w-md mx-auto border-dashed border-2 shadow-sm bg-card hover:border-primary/50 transition-colors">
                        <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Upload Lease PDF</h3>
                                <p className="text-sm text-muted-foreground">We&apos;ll extract the text and analyze the terms.</p>
                            </div>

                            <label className="cursor-pointer">
                                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                <Button variant="outline" asChild><span className="pointer-events-none">{file ? file.name : "Select PDF Document"}</span></Button>
                            </label>
                            {file && (
                                <Button onClick={handleUpload} disabled={!file || analyzing} className="w-full">
                                    {analyzing ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 w-4 h-4" /> Analyze Lease</>}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {analyzing && !analysis && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20 text-muted-foreground animate-pulse">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p>Scanning document against Chicago RLTO database...</p>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                        <Card className="bg-card shadow-lg border-primary/20">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="text-2xl flex items-center gap-2"><Sparkles className="w-6 h-6 text-primary" /> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 font-medium text-lg leading-relaxed">
                                {analysis.summary}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                            <Card className="col-span-full xl:col-span-2 shadow-md border-primary/20 bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Move-in Breakdown</CardTitle>
                                    <CardDescription>Estimated total cost to secure the apartment</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between items-center text-lg font-bold border-b pb-2">
                                            <span>Total Move-in Cost</span>
                                            <span className="text-2xl text-primary">${analysis.totalMoveInCost?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <h4 className="text-sm font-semibold mb-2">Additional Fees:</h4>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {analysis.fees?.map((f: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm py-1">
                                                <span className="text-muted-foreground">{f.name} {f.isOneTime && '(One-time)'}</span>
                                                <span className="font-mono">${f.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-full shadow-md border-destructive/20 bg-card">
                                <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                                    <CardTitle className="text-destructive flex items-center gap-2">
                                        <AlertOctagon className="w-5 h-5" /> High-Risk Clauses
                                    </CardTitle>
                                    <CardDescription>Checked against Chicago RLTO</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {analysis.riskyClauses?.length === 0 ? (
                                            <p className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="text-green-500 w-4 h-4" /> No high-risk clauses detected.</p>
                                        ) : (
                                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                            analysis.riskyClauses?.map((clause: any, i: number) => (
                                                <div key={i} className="bg-destructive/10 border-l-2 border-destructive p-3 space-y-2">
                                                    <p className="font-mono text-xs text-muted-foreground italic">&quot;{clause.quote}&quot;</p>
                                                    <p className="font-medium text-destructive">{clause.explanation}</p>
                                                    <span className="inline-block bg-destructive/20 text-destructive text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">Severity: {clause.severity}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Advanced Fields */}
                            {analysis.responsibilities && (
                                <Card className="col-span-full shadow-md border-primary/10 bg-card mt-6">
                                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                                        <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-500" /> Utility Responsibilities</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-muted-foreground uppercase">Tenant Pays</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {analysis.responsibilities.tenantPays?.length > 0 ? analysis.responsibilities.tenantPays.map((item: any, i: number) => (
                                                    <span key={i} className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">{item}</span>
                                                )) : <span className="text-sm text-muted-foreground italic">None specified</span>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-muted-foreground uppercase">Landlord Pays</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {analysis.responsibilities.landlordPays?.length > 0 ? analysis.responsibilities.landlordPays.map((item: any, i: number) => (
                                                    <span key={i} className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/20">{item}</span>
                                                )) : <span className="text-sm text-muted-foreground italic">None specified</span>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {analysis.policies && (
                                <Card className="col-span-full xl:col-span-2 shadow-md border-primary/10 bg-card mt-6">
                                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-500" /> Key Policies & Rules</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-start gap-3 border-b pb-4">
                                            <Dog className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <h4 className="font-bold">Pet Policy - {analysis.policies.petsAllowed ? <span className="text-emerald-500">Pet Friendly</span> : <span className="text-destructive">No Pets Allowed</span>}</h4>
                                                <p className="text-sm text-muted-foreground">{analysis.policies.petDetails}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 border-b pb-4">
                                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <h4 className="font-bold">Subletting & Airbnb</h4>
                                                <p className="text-sm text-muted-foreground">{analysis.policies.subletting}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <AlertOctagon className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <h4 className="font-bold">Early Termination Penalty</h4>
                                                <p className="text-sm text-muted-foreground">{analysis.policies.earlyTerminationInfo}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {analysis.renewalTerms && (
                                <Card className="col-span-1 shadow-md border-primary/10 bg-card mt-6">
                                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                                        <CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5 text-orange-500" /> Renewal Terms</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="text-base font-medium">{analysis.renewalTerms}</p>
                                        <p className="text-xs text-muted-foreground mt-4 italic">Always double-check Chicago RLTO limits on auto-renewals.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="flex justify-center mt-8">
                            <Button variant="outline" onClick={() => { setAnalysis(null); setFile(null) }}>Analyze Another Document</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
