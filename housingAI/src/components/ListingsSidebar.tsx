import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ListingsSidebar({ listings, onHover, setListings }: any) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [nlQuery, setNlQuery] = useState('')
    const [nlLoading, setNlLoading] = useState(false)

    const [filters, setFilters] = useState({
        petFriendly: false,
        parkingIncluded: false,
        utilitiesIncluded: false,
        section8Accepted: false,
    })
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [beds, setBeds] = useState('')

    const initialQueryProcessed = useRef(false)

    // Initial load
    useEffect(() => {
        if (!initialQueryProcessed.current && typeof window !== 'undefined') {
            initialQueryProcessed.current = true
            const urlParams = new URLSearchParams(window.location.search)
            const initQuery = urlParams.get('query')

            if (initQuery) {
                setNlQuery(initQuery)
                performNlSearch(initQuery)
                return
            }
        }
        fetchListings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, minPrice, maxPrice, beds])

    const fetchListings = () => {
        setLoading(true)
        const queryParams = new URLSearchParams()
        if (minPrice) queryParams.append('minPrice', minPrice)
        if (maxPrice) queryParams.append('maxPrice', maxPrice)
        if (beds) queryParams.append('beds', beds)
        if (filters.petFriendly) queryParams.append('petFriendly', 'true')
        if (filters.parkingIncluded) queryParams.append('parkingIncluded', 'true')
        if (filters.utilitiesIncluded) queryParams.append('utilitiesIncluded', 'true')
        if (filters.section8Accepted) queryParams.append('section8Accepted', 'true')

        fetch(`/api/listings/search?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                setListings(data)
                setLoading(false)
            })
    }

    const performNlSearch = async (queryToSearch: string) => {
        if (!queryToSearch) return

        setNlLoading(true)
        setLoading(true)
        try {
            // 1. Convert natural language to structured filters
            const filterRes = await fetch('/api/ai/nl-search', {
                method: 'POST',
                body: JSON.stringify({ prompt: queryToSearch })
            })

            if (!filterRes.ok) {
                console.error("AI filter extraction failed", filterRes.status)
                return
            }

            const { filters: aiFilters } = await filterRes.json()

            // 2. Query the actual database with the structured filters
            const queryParams = new URLSearchParams()
            if (aiFilters?.minPrice) queryParams.append('minPrice', aiFilters.minPrice)
            if (aiFilters?.maxPrice) queryParams.append('maxPrice', aiFilters.maxPrice)
            if (aiFilters?.beds) queryParams.append('beds', aiFilters.beds)
            // Note: Currently just updating text fields, but we could also toggle UI state here
            if (aiFilters?.minPrice) setMinPrice(aiFilters.minPrice.toString())
            if (aiFilters?.maxPrice) setMaxPrice(aiFilters.maxPrice.toString())
            if (aiFilters?.beds) setBeds(aiFilters.beds.toString())

            // Don't setListings(dbData) manually here IF it's going to trigger useEffect anyway.
            // But since useEffect catches state changes, we can just let it fetch!
            // Wait, we still need to fetch once if no state changed, in case the query didn't update bounds
            // but might do something else? Actually, if it updates beds/minPrice/maxPrice, useEffect will fetch.
            // If it doesn't update them, we still want to fetch with the ai filters?
            // Actually aiFilters ARE the beds/minPrice/maxPrice! So we can just set state and let it fetch.
            // Let's just do it directly.
            const dbRes = await fetch(`/api/listings/search?${queryParams.toString()}`)
            const dbData = await dbRes.json()

            setListings(dbData)
        } catch (err) {
            console.error(err)
        } finally {
            setNlLoading(false)
            setLoading(false)
        }
    }

    const handleNlSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        await performNlSearch(nlQuery)
    }

    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-md">
            {/* Search Header */}
            <div className="p-4 border-b space-y-4">
                <form onSubmit={handleNlSearch} className="relative group">
                    <Input
                        value={nlQuery}
                        onChange={(e) => setNlQuery(e.target.value)}
                        placeholder="Type '2 beds under $1500 near Logan Square...'"
                        className="w-full pl-10 pr-10 py-6 text-base bg-card border-primary/20 hover:border-primary/50 transition-colors shadow-inner"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
                    <button
                        type="submit"
                        disabled={nlLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                        {nlLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                </form>

                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <Input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>

                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                    <Badge variant={filters.petFriendly ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleFilter('petFriendly')}>Pet Friendly</Badge>
                    <Badge variant={filters.parkingIncluded ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleFilter('parkingIncluded')}>Parking Included</Badge>
                    <Badge variant={filters.utilitiesIncluded ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleFilter('utilitiesIncluded')}>Utilities Included</Badge>
                    <Badge variant={filters.section8Accepted ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleFilter('section8Accepted')}>Section 8</Badge>
                </div>
            </div>

            {/* Results List */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="w-full h-40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">No listings found. Adjust your search.</div>
                ) : (
                    <div className="space-y-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {listings.map((l: any) => (
                            <Card
                                key={l.id}
                                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group"
                                onMouseEnter={() => onHover(l.id)}
                                onMouseLeave={() => onHover(null)}
                                onClick={() => router.push(`/property/${l.id}`)}
                            >
                                <div className="w-full h-48 bg-muted relative overflow-hidden">
                                    {/* Placeholder for real images */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={l.images[0]} alt={l.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                                        ${l.price}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg truncate" title={l.address}>{l.address}</h3>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                                        <span>{l.neighborhood?.name || 'Unknown'}</span>
                                        <span>{l.bedrooms} Bed • {l.bathrooms} Bath</span>
                                    </div>

                                    {/* AI Insights Chip */}
                                    <div className="mt-4 pt-3 border-t text-xs flex items-center gap-2 text-primary">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Price is 5% below area average</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
