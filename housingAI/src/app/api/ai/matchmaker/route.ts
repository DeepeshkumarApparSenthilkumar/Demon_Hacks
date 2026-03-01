import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { profile } = await req.json()
        // profile contains { commuteTo, vibe, budget, mustHaves }

        // Ideally, we fetch summary stats of neighborhoods here to feed the LLM context,
        // but GPT-4o has deep enough knowledge of Chicago neighborhoods for a prototype.
        const allHoods = await prisma.neighborhood.findMany({ select: { name: true } })
        const hoodNames = allHoods.map(h => h.name).join(', ')

        const openAiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert Chicago real estate agent and data scientist engine. You are given a user profile. Analyze their profile and recommend the top 3 best matching Chicago neighborhoods from this list: ${hoodNames}. 
                        
                        Return ONLY valid JSON in the following format:
                        {
                          "matches": [
                            {
                              "neighborhoodName": "String", 
                              "matchScore": 95, 
                              "reasoning": "A paragraph explaining exactly why this neighborhood is a good choice for this unique profile (e.g. CTA routes, local parks, nightlife centers).",
                              "estimatedRentText": "$1,800 - $2,200",
                              "lifestyleTags": ["Tree-Lined", "Foodie Heaven", "Suburban Feel"],
                              "metrics": {
                                "commuteScore": 90,
                                "budgetScore": 85,
                                "vibeScore": 98
                              }
                            }
                          ]
                        }`
                    },
                    {
                        role: 'user',
                        content: `User Profile:\nCommute to: ${profile.commuteTo}\nVibe preference: ${profile.vibe}\nMonthly budget: $${profile.budget}\nMust haves: ${profile.mustHaves}\n\nStrictly reply with valid JSON conforming to the schema.`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        })

        if (!openAiRes.ok) {
            throw new Error(`Groq API failed with status ${openAiRes.status}`)
        }

        const data = await openAiRes.json()
        let content = data.choices[0].message.content

        // Strip markdown codeblocks if Groq hallucinates them around the JSON
        if (content.includes('```')) {
            const matches = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (matches && matches[1]) {
                content = matches[1];
            }
        }

        const object = JSON.parse(content)

        return NextResponse.json(object)
    } catch (error) {
        console.error('Matchmaker Error:', error)
        return NextResponse.json({ error: 'Failed to generate matches' }, { status: 500 })
    }
}
