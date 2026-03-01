import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParseLib = require('pdf-parse')
const pdfParse = pdfParseLib.default || pdfParseLib

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const pdfData = await pdfParse(buffer)
        const text = pdfData.text

        // If PDF is too large, we might need to truncate or chunk it.
        // For this prototype, we'll try to process the first ~15k characters
        const truncatedText = text.substring(0, 15000)

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
                        content: `You are an expert tenant rights lawyer in Chicago. Analyze the provided residential lease agreement text. Extract the key terms, carefully calculate the total move-in cost, and extensively flag any risky, unusual, or illegal clauses. Pay special attention to compliance with the Chicago Residential Landlord and Tenant Ordinance (RLTO). Return ONLY valid JSON in this format: {"summary": "String", "monthlyRent": 2000, "securityDeposit": 500, "totalMoveInCost": 2500, "leaseStart": "2024-01-01", "leaseEnd": "2025-01-01", "fees": [{"name": "Pet form", "amount": 100, "isOneTime": true}], "riskyClauses": [{"quote": "...", "explanation": "...", "severity": "low|medium|high"}], "responsibilities": {"tenantPays": ["electricity", "internet"], "landlordPays": ["water", "trash"]}, "policies": {"petsAllowed": false, "petDetails": "String", "subletting": "String", "earlyTerminationInfo": "String"}, "renewalTerms": "String"}`
                    },
                    {
                        role: 'user',
                        content: `Analyze this lease document: \n\n${truncatedText}`
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
        const content = data.choices[0].message.content
        const object = JSON.parse(content)

        return NextResponse.json(object)

    } catch (error) {
        console.error('Lease Analyzer Error:', error)
        return NextResponse.json({ error: 'Failed to analyze lease document' }, { status: 500 })
    }
}
