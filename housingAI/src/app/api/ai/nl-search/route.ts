import { NextResponse } from 'next/server'
export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

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
                        content: `You are a real estate search assistant. Your job is to extract search queries and filters from natural language input. Return a structured JSON object representing the user's desired search filters for a Chicago apartment. Only use the following keys if specified: "minPrice" (number), "maxPrice" (number), "beds" (number), "petFriendly" (boolean), "parkingIncluded" (boolean). Output ONLY VALID JSON. Example: {"minPrice": 1000, "beds": 2}`
                    },
                    {
                        role: 'user',
                        content: `Extract search parameters from this user query: "${prompt}"`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0
            })
        })

        if (!openAiRes.ok) {
            throw new Error(`OpenAI API failed with status ${openAiRes.status}`)
        }

        const data = await openAiRes.json()
        const content = data.choices[0].message.content
        const object = JSON.parse(content)

        return NextResponse.json({ filters: object })

    } catch (error) {
        console.error('AI Error:', error)
        return NextResponse.json({ error: 'Failed to process natural language search' }, { status: 500 })
    }
}
