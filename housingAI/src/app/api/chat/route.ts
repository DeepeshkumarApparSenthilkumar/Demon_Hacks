import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({ apiKey: process.env.OPENAI_API_KEY })

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, context } = await req.json();
    // context could include the current neighborhood they are viewing, listings, etc.

    const systemMessage = `You are a helpful Chicago real estate and neighborhood expert assistant.
  Help the user understand the Chicago market, evaluate neighborhoods, and navigate renting.
  Be concise, knowledgeable, and friendly. 
  
  Context about what the user is currently looking at:
  ${context ? JSON.stringify(context) : 'General map view'}`

    try {
        const result = await streamText({
            model: groq('llama-3.1-8b-instant'),
            system: systemMessage,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error(error)
        return new Response('Error in chat stream', { status: 500 })
    }
}
