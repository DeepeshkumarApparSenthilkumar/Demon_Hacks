import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, CalendarCheck, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import BookingForm from '@/components/BookingForm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BookingPage({ params }: any) {
    const { id } = params

    // Fetch property 
    const property = await prisma.listing.findUnique({
        where: { id },
        include: {
            neighborhood: true,
            landlord: true
        }
    })

    if (!property) {
        notFound()
    }

    const nbhd = property.neighborhood

    return (
        <div className="flex flex-col h-screen overflow-y-auto bg-background p-6 lg:p-12 space-y-8">
            <Link href={`/property/${property.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Property
            </Link>

            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Secure Your New Home</h1>
                    <p className="text-muted-foreground text-lg">Book a viewing or start your direct application for {property.address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Property Summary Card */}
                    <Card className="shadow-lg border-primary/20 bg-accent/5 h-fit">
                        <CardHeader>
                            <CardTitle className="text-2xl">Property Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="w-full h-48 rounded-xl overflow-hidden shadow-sm border border-border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={property.images[0]} alt={property.address} className="w-full h-full object-cover" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">{property.address}</h3>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {nbhd?.name || 'Chicago'}, IL • {property.bedrooms} Bed • {property.bathrooms} Bath
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between font-medium">
                                    <span className="text-muted-foreground">Monthly Rent</span>
                                    <span>${property.price}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-muted-foreground">Move-in Fee (Est.)</span>
                                    <span>$450</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t text-primary">
                                    <span>Total Due at Signing</span>
                                    <span>${property.price + 450}</span>
                                </div>
                            </div>

                            <div className="bg-primary/10 p-4 rounded-lg flex items-start gap-3 mt-4">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-primary">Booking directly through HousingAI waives standard agent broker fees.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Form Card */}
                    <Card className="shadow-xl border-primary/20 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <CalendarCheck className="w-6 h-6 text-primary" /> Schedule & Apply
                            </CardTitle>
                            <CardDescription>Lock in your rate by scheduling a tour today.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <BookingForm propertyId={property.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
