import { useState, useRef, useEffect } from 'react';
import { sendOracleMessage } from '../services/aiService';
import type { BusinessProfile } from '../services/store';
import { Send, Sparkles, Bot } from 'lucide-react';

export default function AssistantChatScreen({ profile }: { profile: BusinessProfile }) {
    const [messages, setMessages] = useState<{ id: string; role: 'ai' | 'user'; text: string }[]>([
        {
            id: 'msg-1',
            role: 'ai',
            text: `Welcome back to the Oracle Grid. I am analyzing data for ${profile.name} at ${profile.address}. How can I assist you with staffing or strategy today?`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), role: 'user' as const, text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        const apiHistory = messages.map(m => ({ role: m.role, text: m.text }));

        try {
            const resp = await sendOracleMessage(apiHistory, input.trim(), profile);
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: resp.text }]);
        } catch (e) {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: 'Error connecting to the Oracle grid. Please try again.' }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative animate-fade-in w-full max-w-4xl mx-auto rounded-[2rem] border border-glassBorder bg-secondary/30 backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="py-6 px-6 md:px-8 border-b border-glassBorder flex items-center gap-4 bg-primary/40 backdrop-blur-xl shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    <Sparkles size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-wider">Oracle Chat</h2>
                    <p className="text-slate-400 text-sm">{profile.name} Strategic Advisor</p>
                </div>
                <div className="ml-auto px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                        {msg.role === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-secondary/80 border border-slate-700 flex items-center justify-center mr-3 shrink-0 mt-auto mb-2">
                                <Bot size={16} className="text-cyan-400" />
                            </div>
                        )}
                        <div
                            className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-lg text-[15px] leading-relaxed backdrop-blur-md border 
                ${msg.role === 'ai'
                                    ? 'bg-secondary/60 text-slate-200 border-slate-700/50 rounded-bl-sm'
                                    : 'bg-gradient-to-r from-blue-600/80 to-indigo-600/90 text-white border-blue-400/30 rounded-br-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-secondary/80 border border-slate-700 flex items-center justify-center mr-3 shrink-0 mt-auto mb-2">
                            <Bot size={16} className="text-cyan-400" />
                        </div>
                        <div className="bg-secondary/60 border border-slate-700/50 rounded-2xl rounded-bl-sm p-4 shadow-lg flex gap-2 items-center backdrop-blur-md">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_5px_#6366f1]"></div>
                            <div className="w-2 h-2 bg-indigo-500/70 rounded-full animate-pulse delay-100 shadow-[0_0_5px_#6366f1]"></div>
                            <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-pulse delay-200 shadow-[0_0_5px_#6366f1]"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-6 border-t border-glassBorder bg-primary/60 backdrop-blur-2xl shrink-0">
                <div className="relative max-w-4xl mx-auto flex items-center gap-3 bg-secondary/80 border border-slate-700 rounded-full p-2 pl-6 shadow-inner focus-within:border-indigo-500/50 focus-within:bg-secondary transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask the Oracle about demand, staffing, or strategy..."
                        className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-slate-500 text-sm md:text-base"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                        className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        <Send size={18} className="translate-x-[1px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
