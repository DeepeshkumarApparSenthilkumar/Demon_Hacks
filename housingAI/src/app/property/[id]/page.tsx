import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, MapPin, Building2, ShieldAlert, Waves, Hospital, GraduationCap, Volume2, ArrowLeft, Train, ShoppingCart, Briefcase, Footprints, Bike, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PropertyCoach from '@/components/PropertyCoach'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function PropertyDetailsPage({ params }: any) {
    const { id } = params

    // Fetch property with its neighborhood and crime stats relation
    const property = await prisma.listing.findUnique({
        where: { id },
        include: {
            neighborhood: {
                include: {
                    crimeStats: true
                }
            },
            landlord: true
        }
    })

    if (!property) {
        notFound()
    }

    const nbhd = property.neighborhood

    // Synthetic specific indicators for the dashboard since they aren't fully modeled in the DB schema for each point
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        // Very rough mock distance in miles
        const p = 0.017453292519943295; // Math.PI / 180
        const c = Math.cos;
        const a = 0.5 - c((lat2 - lat1) * p) / 2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((lon2 - lon1) * p)) / 2;
        return (12742 * Math.asin(Math.sqrt(a)) / 1.609).toFixed(1);
    }

    // distance to City is calculated but not rendered right now since we added Job Centers instead.
    // const distToCity = calculateDistance(property.lat, property.lng, 41.8781, -87.6298)
    const distToTransit = (Math.random() * 0.8 + 0.1).toFixed(1) // 0.1 - 0.9 miles
    const distToGrocery = (Math.random() * 1.5 + 0.1).toFixed(1)
    const distToJobs = calculateDistance(property.lat, property.lng, 41.8841, -87.6324)

    const mockHospitals = [
        { name: 'Northwestern Memorial', distance: (Math.random() * 3 + 0.5).toFixed(1) },
        { name: 'Rush University', distance: (Math.random() * 4 + 1).toFixed(1) }
    ]

    // Safety Score logic
    const score = nbhd?.crimeStats[0]?.crimeScore || 50
    const safetyIndex = Math.max(0, 100 - (score * 1.5))

    // Mock Data for the custom user requests
    const noiseLevel = Math.floor(Math.random() * 100)
    const complaints311 = Math.floor(Math.random() * 500) + 50
    const floodRisk = Math.random() > 0.8 ? 'High' : (Math.random() > 0.5 ? 'Moderate' : 'Low')
    const schoolRating = (Math.random() * 4 + 6).toFixed(1) // 6.0 to 10.0
    const walkScore = Math.floor(Math.random() * 30 + 70) // 70-100
    const bikeScore = Math.floor(Math.random() * 40 + 60) // 60-100

    return (
        <div className="flex flex-col h-screen overflow-y-auto bg-background p-6 lg:p-12 space-y-8">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Map Search
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{property.address}</h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground text-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        {nbhd?.name || 'Chicago'}, IL • {property.bedrooms} Bed • {property.bathrooms} Bath • {property.sqft} sqft
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Badge variant="outline" className="flex items-center gap-1.5"><Footprints className="w-3.5 h-3.5" /> Walk Score: {walkScore}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1.5"><Bike className="w-3.5 h-3.5" /> Bike Score: {bikeScore}</Badge>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-4xl font-black text-primary border-b-2 border-primary/20 pb-1">${property.price} <span className="text-xl text-muted-foreground font-medium">/mo</span></div>
                    <div className="flex items-center gap-2 mt-2">
                        {property.petFriendly && <Badge variant="secondary">Pet Friendly</Badge>}
                        <Link href={`/book/${property.id}`}>
                            <Button className="font-bold shadow-lg flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white">
                                <CalendarCheck className="w-4 h-4" /> Book This House
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    {/* Images */}
                    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-border flex gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={property.images[0]} alt={property.address} className="w-1/2 h-full object-cover" />
                        {property.images[1] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={property.images[1]} alt={`${property.address} secondary`} className="w-1/2 h-full object-cover" />
                        )}
                    </div>

                    <Card className="bg-card shadow-md">
                        <CardHeader>
                            <CardTitle>Neighborhood Intelligence: {nbhd?.name}</CardTitle>
                            <CardDescription>Deep analysis of {property.address} surroundings.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-emerald-500" /> Safety Index</span>
                                    <span>{safetyIndex.toFixed(0)}/100</span>
                                </div>
                                <Progress value={safetyIndex} className="h-2" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-1"><Volume2 className="w-4 h-4 text-orange-500" /> Noise & Nightlife Density</span>
                                    <span>{noiseLevel}/100</span>
                                </div>
                                <Progress value={noiseLevel} className="h-2 [&>div]:bg-orange-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-blue-500" /> School District Rating</span>
                                    <span>{schoolRating}/10</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-yellow-500" /> 311 Complaint Density</span>
                                    <span>{complaints311} active reports</span>
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2 pt-4 border-t">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="flex items-center gap-1"><Waves className="w-4 h-4 text-blue-400" /> Flood Zone Risk</span>
                                    <Badge variant={floodRisk === 'High' ? 'destructive' : (floodRisk === 'Moderate' ? 'default' : 'secondary')}>{floodRisk}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-md border-primary/20 bg-accent/5">
                        <CardHeader className="pb-2 text-center">
                            <CardTitle className="text-xl">AI Move-In Estimator</CardTitle>
                            <CardDescription>Projected costs to secure this unit</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">First Month Rent</span>
                                <span className="font-semibold">${property.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Security Deposit (Est)</span>
                                <span className="font-semibold">${property.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Move-in / Admin Fee</span>
                                <span className="font-semibold">$450</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Professional Movers (Local)</span>
                                <span className="font-semibold">$600</span>
                            </div>
                            <div className="pt-3 border-t flex justify-between items-center mt-2">
                                <span className="font-bold text-base">Total Estimated Cost</span>
                                <span className="font-black text-xl text-primary">${(property.price * 2) + 1050}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Distances & Proximity</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Train className="w-4 h-4" /> CTA Transit Stop</span>
                                    <span className="font-medium">{distToTransit} mi</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="flex items-center gap-2 text-muted-foreground"><ShoppingCart className="w-4 h-4" /> Nearest Grocery</span>
                                    <span className="font-medium">{distToGrocery} mi</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="w-4 h-4" /> Top Job Centers (Loop)</span>
                                    <span className="font-medium">{distToJobs} mi</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="flex items-center gap-2 text-muted-foreground"><Hospital className="w-4 h-4" /> Nearest Hospital</span>
                                    <span className="font-medium">{mockHospitals[0].distance} mi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Relocation Coach Element */}
                    <PropertyCoach property={property} />

                    <Card className="shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5" /> Landlord Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="space-y-2">
                                <p><span className="font-semibold">{property.landlord?.name || 'Private Owner'}</span></p>
                                <div className="flex items-center justify-between text-emerald-500 font-medium pt-2 border-t">
                                    <span>Eviction Risk</span>
                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500">Low Risk</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>                </div>
            </div>
        </div>
    )
}
