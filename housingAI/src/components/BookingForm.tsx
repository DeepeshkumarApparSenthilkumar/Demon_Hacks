'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function BookingForm({ propertyId }: { propertyId: string }) {
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate a booking flow
        alert('Your tour request has been submitted! Our agent will contact you shortly.')
        router.push('/') // Redirect back to map or dashboard
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input type="hidden" name="propertyId" value={propertyId} />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" required />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="john@example.com" required />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input type="tel" placeholder="(555) 123-4567" required />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Tour Date</label>
                <Input type="date" required className="cursor-pointer" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Target Move-in Date</label>
                <Input type="date" required className="cursor-pointer" />
            </div>

            <Button className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg text-lg h-12" size="lg" type="submit">
                Request Tour & Hold Unit
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
                By clicking this button, you agree to our Terms of Service and Privacy Policy. No payment is required to schedule a viewing.
            </p>
        </form>
    )
}
