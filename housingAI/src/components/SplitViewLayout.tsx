'use client'

import { useState } from 'react'
import MapView from '@/components/MapView'
import ListingsSidebar from '@/components/ListingsSidebar'

export default function SplitViewLayout() {
    // State for active listings, hovering, selected neighborhood, etc.
    const [listings, setListings] = useState([])
    const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)

    return (
        <div className="flex h-full w-full">
            {/* Sidebar - Listings (Left side on desktop, bottom overlay on mobile ideally) */}
            <div className="w-full md:w-[400px] lg:w-[500px] h-full border-r bg-card flex flex-col z-10 shadow-xl overflow-hidden shadow-black/5">
                <ListingsSidebar
                    listings={listings}
                    onHover={setHoveredListingId}
                    setListings={setListings}
                />
            </div>

            {/* Main Map Area */}
            <div className="flex-1 h-full relative z-0">
                <MapView
                    listings={listings}
                    hoveredId={hoveredListingId}
                />
            </div>
        </div>
    )
}
