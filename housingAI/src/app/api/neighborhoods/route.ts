import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    try {
        let neighborhoods
        if (q) {
            neighborhoods = await prisma.neighborhood.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                take: 10,
                include: { demographics: true, crimeStats: true }
            })
        } else {
            neighborhoods = await prisma.neighborhood.findMany({ take: 50 })
        }

        return NextResponse.json(neighborhoods)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch neighborhoods' }, { status: 500 })
    }
}
