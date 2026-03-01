'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, Sparkles, UserCircle } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PropertyCoach({ property }: { property: any }) {

    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 'system-welcome',
            role: 'assistant',
            content: `Hi there! I'm your AI Relocation Coach. I see you're looking at **${property.address}**. It's a great spot in ${property.neighborhood?.name || 'Chicago'}. What questions do you have about the neighborhood, move-in costs, or securing this lease?`
        }
    ])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const contextMsg = {
                role: 'system',
                content: `CONTEXT: The user is currently viewing the property at ${property.address} in ${property.neighborhood?.name}. Price: $${property.price}/mo. Beds/Baths: ${property.bedrooms}/${property.bathrooms}. Your role is to act as a Relocation Coach helping them decide if they should move here, guiding them on next steps like touring, budgeting move-in costs, or neighborhood advice.`
            }

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context: contextMsg.content
                })
            })

            if (!res.ok) throw new Error('Network response was not ok')

            const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }
            setMessages(prev => [...prev, aiMsg])

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const text = decoder.decode(value, { stream: true })
                    // Remove numeric stream formatting artifacts often found in Vercel SDK defaults
                    const chunk = text.replace(/^[0-9]+:/gm, '').replace(/"/g, '')

                    setMessages(prev => prev.map(m =>
                        m.id === aiMsg.id ? { ...m, content: m.content + chunk } : m
                    ))
                }
            }
        } catch (error) {
            console.error('Error fetching chat:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="shadow-md h-[500px] flex flex-col border-primary/20 bg-accent/5">
            <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5 text-primary" /> AI Relocation Coach
                </CardTitle>
                <CardDescription>Get instant guidance on moving to this property</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="mt-1">
                                        {m.role === 'user' ?
                                            <UserCircle className="w-6 h-6 text-muted-foreground" /> :
                                            <Sparkles className="w-6 h-6 text-primary p-1 bg-primary/10 rounded-full" />
                                        }
                                    </div>
                                    <div className={`p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-border shadow-sm'}`}>
                                        <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%] flex-row">
                                    <div className="mt-1">
                                        <Sparkles className="w-6 h-6 text-primary p-1 bg-primary/10 rounded-full" />
                                    </div>
                                    <div className="p-3 rounded-xl text-sm bg-muted/50 border border-border shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-3 bg-background border-t border-border">
                    <form onSubmit={handleSubmit} className="relative flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about deposits, commutes..."
                            className="pr-12 text-sm"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="absolute right-1 top-1 bottom-1 h-auto"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}

