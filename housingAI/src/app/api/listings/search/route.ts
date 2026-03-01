import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const radiusMiles = searchParams.get('radius') || '5'

    // Advanced filters
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const beds = searchParams.get('beds')

    // Boolean filters
    const petFriendly = searchParams.get('petFriendly')
    const parkingIncluded = searchParams.get('parkingIncluded')
    const utilitiesIncluded = searchParams.get('utilitiesIncluded')
    const section8Accepted = searchParams.get('section8Accepted')

    try {
        // If we have spatial parameters, use PostGIS
        if (latParam && lngParam) {
            const lat = parseFloat(latParam)
            const lng = parseFloat(lngParam)
            const radiusMeters = parseFloat(radiusMiles) * 1609.34

            // Vulnerable to SQL injection if we don't parameterize correctly, but Prisma raw queries are generally safe 
            // when using template variables or parameterized arrays. 
            // Because we need dynamic WHERE clauses alongside the spatial query, it's complex.
            // Let's do a simplified approach: fetch IDs within radius first, then use Prisma ORM for the rest.

            const spatialResults = await prisma.$queryRaw`
        SELECT id 
        FROM "Listing"
        WHERE ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      ` as Array<{ id: string }>

            const idsInRadius = spatialResults.map(r => r.id)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filters: any = { id: { in: idsInRadius } }
            if (minPrice) filters.price = { ...(filters.price || {}), gte: parseFloat(minPrice) }
            if (maxPrice) filters.price = { ...(filters.price || {}), lte: parseFloat(maxPrice) }
            if (beds) filters.bedrooms = { gte: parseInt(beds, 10) }
            if (petFriendly === 'true') filters.petFriendly = true
            if (parkingIncluded === 'true') filters.parkingIncluded = true
            if (utilitiesIncluded === 'true') filters.utilitiesIncluded = true
            if (section8Accepted === 'true') filters.section8Accepted = true

            const listings = await prisma.listing.findMany({
                where: filters,
                include: { neighborhood: true, landlord: true }
            })

            return NextResponse.json(listings)
        }

        // Default generic list
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filters: any = {}
        if (minPrice) filters.price = { ...(filters.price || {}), gte: parseFloat(minPrice) }
        if (maxPrice) filters.price = { ...(filters.price || {}), lte: parseFloat(maxPrice) }
        if (beds) filters.bedrooms = { gte: parseInt(beds, 10) }
        if (petFriendly === 'true') filters.petFriendly = true
        if (parkingIncluded === 'true') filters.parkingIncluded = true
        if (utilitiesIncluded === 'true') filters.utilitiesIncluded = true
        if (section8Accepted === 'true') filters.section8Accepted = true

        const listings = await prisma.listing.findMany({
            where: filters,
            include: { neighborhood: true, landlord: true },
            take: 3000
        })
        return NextResponse.json(listings)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to search listings' }, { status: 500 })
    }
}
