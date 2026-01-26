"use client";

import {
    Search, Phone, Video, Info, Send, Smile, Paperclip, CheckCheck
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const convos = [
    { id: 1, name: "Sarah Smith", msg: "Can we schedule a call?", time: "2m", active: true, unread: 2 },
    { id: 2, name: "David Chen", msg: "Thanks for the swift reply!", time: "1h", active: false, unread: 0 },
    { id: 3, name: "Project Alpha Team", msg: "Alice: The repo is updated.", time: "Yesterday", active: false, unread: 5 },
    { id: 4, name: "Emily Cart", msg: "Sent the invoice.", time: "Dec 20", active: false, unread: 0 },
];

const initialMessages = [
    { fromMe: true, text: "Hey Sarah! I saw your post about the UX project.", time: "10:23 AM" },
    { fromMe: false, text: "Hi! Yes, we are still looking for a frontend developer. Are you interested?", time: "10:25 AM" },
    { fromMe: true, text: "Absolutely! I have experience with Next.js and Tailwind.", time: "10:26 AM" },
    { fromMe: false, text: "That sounds perfect. Can we schedule a call?", time: "10:30 AM" },
];

export default function Messages() {
    const [selectedId, setSelectedId] = useState(1);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(initialMessages);

    const chatEndRef = useRef<HTMLDivElement>(null);

    /* Auto scroll on new message */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!message.trim()) return;

        setMessages(prev => [
            ...prev,
            { fromMe: true, text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        setMessage("");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-140px)]">
            <div className="glass-card rounded-xl h-full flex overflow-hidden">

                {/* Conversations */}
                <div className="w-full md:w-80 border-r border-slate-700/50 flex flex-col">
                    <div className="p-4 border-b border-slate-700/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                placeholder="Search messages..."
                                className="w-full bg-slate-800/50 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:ring-1 focus:ring-electric placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {convos.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`p-4 flex gap-3 cursor-pointer transition border-l-2 ${selectedId === c.id ? "bg-white/5 border-electric" : "hover:bg-white/5 border-transparent"}`}
                            >
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-slate-700" />
                                    {c.active && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-midnight" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                                        <span className="text-xs text-gray-400">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{c.msg}</p>
                                </div>

                                {c.unread > 0 && (
                                    <span className="h-5 w-5 bg-electric text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {c.unread}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="hidden md:flex flex-1 flex-col bg-slate-900/30">

                    {/* Header */}
                    <div className="h-16 border-b border-slate-700/50 flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-700" />
                            <div>
                                <h3 className="text-white font-semibold">Sarah Smith</h3>
                                <span className="text-green-500 text-xs flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                    Online
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 text-gray-400">
                            <button className="hover:text-electric"><Phone size={20} /></button>
                            <button className="hover:text-electric"><Video size={20} /></button>
                            <button className="hover:text-white"><Info size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.fromMe ? "justify-end" : "gap-3"}`}>
                                {!msg.fromMe && <div className="h-8 w-8 rounded-full bg-slate-700 mt-auto" />}

                                <div className={`${msg.fromMe ? "bg-electric text-white rounded-tr-sm" : "bg-slate-700/50 text-gray-200 rounded-tl-sm"} px-4 py-2 rounded-2xl max-w-[70%] text-sm`}>
                                    <p>{msg.text}</p>
                                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.fromMe ? "justify-end text-blue-200" : "text-gray-400"}`}>
                                        {msg.time}
                                        {msg.fromMe && <CheckCheck size={12} />}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700/50">
                        <div className="bg-slate-800/50 rounded-xl flex items-center px-4 py-2 gap-3">
                            <button className="text-gray-400 hover:text-white"><Paperclip size={20} /></button>

                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:ring-0"
                            />

                            <button className="text-gray-400 hover:text-white"><Smile size={20} /></button>

                            <button
                                onClick={handleSend}
                                className="p-2 bg-electric hover:bg-blue-600 rounded-lg text-white transition"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
