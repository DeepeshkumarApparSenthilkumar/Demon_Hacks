'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context: "The user is using the global CHI Assistant for Chicago housing questions."
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
                    // Basic cleanup for vercel AI stream chunks
                    const chunk = text.replace(/^[0-9]+:/gm, '').replace(/"/g, '').replace(/\\n/g, '\n')

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

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all z-50 p-0 flex items-center justify-center"
            >
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </Button>
        )
    }

    return (
        <Card className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col shadow-2xl z-50 border-primary/20 animate-in slide-in-from-bottom-10">
            <CardHeader className="p-4 border-b bg-card flex flex-row items-center justify-between space-y-0 relative">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <CardTitle className="text-sm font-bold">CHI Assistant</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-4 top-4" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50 mt-10">
                            <MessageCircle className="w-10 h-10" />
                            <p className="text-sm">Ask me about any Chicago neighborhood, lease term, or rental trend.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div key={m.id} className={clsx("flex flex-col max-w-[85%]", m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className={clsx(
                                        "px-3 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap",
                                        m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
                                    )}>
                                        {m.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-1 opacity-50">{m.role === 'user' ? 'You' : 'AI'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-card">
                <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-background border-primary/20"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!input || isLoading}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
