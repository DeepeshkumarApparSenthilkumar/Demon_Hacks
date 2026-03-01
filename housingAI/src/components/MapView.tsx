import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import Map, { Marker } from 'react-map-gl/mapbox'
import { useRouter } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapView({ listings, hoveredId }: { listings: any[], hoveredId: string | null }) {
    const router = useRouter()
    const [viewState, setViewState] = useState({
        longitude: -87.6298, // Chicago Center
        latitude: 41.8781,
        zoom: 11
    })

    const getRentColor = (price: number) => {
        if (price > 2500) return 'bg-red-500 text-white border-red-600'
        if (price >= 1500) return 'bg-yellow-400 text-black border-yellow-500'
        return 'bg-blue-500 text-white border-blue-600' // < 1500
    }

    return (
        <Map
            {...viewState}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMove={(evt: any) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
        >
            {listings.map((listing) => (
                <Marker
                    key={listing.id}
                    longitude={listing.lng}
                    latitude={listing.lat}
                    anchor="bottom"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        router.push(`/property/${listing.id}`)
                    }}
                >
                    <div
                        className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold border transition-all ${getRentColor(listing.price)} ${hoveredId === listing.id
                            ? 'scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-50'
                            : 'shadow-md z-10 hover:z-40'
                            }`}
                    >
                        ${listing.price}
                    </div>
                </Marker>
            ))}

            {/* Example Heatmap or Polygon Layer for Neighborhood Data could go here */}
        </Map>
    )
}
