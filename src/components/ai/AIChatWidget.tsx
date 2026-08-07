'use client';

import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface ChatContext {
  gigTitle?: string;
  gigDescription?: string;
  gigSkills?: string;
  gigBudget?: number;
  studentSkills?: string;
  studentName?: string;
  mode: 'gig-help' | 'career-advice' | 'general';
}

interface AIChatWidgetProps {
  context?: Partial<ChatContext>;
  initialMessage?: string;
  className?: string;
}

const QUICK_PROMPTS = [
  'Write my cover letter',
  'What skills should I highlight?',
  'How do I estimate the timeline?',
  'Help me negotiate the budget',
];

export function AIChatWidget({ context, initialMessage, className }: AIChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialMessage || "Hi! I'm your CampusConnect AI assistant. I can help you write a cover letter, understand gig requirements, estimate timelines, or plan your career. What would you like help with?",
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || streaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
    };

    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    try {
      const chatContext: ChatContext = {
        mode: context?.gigTitle ? 'gig-help' : 'career-advice',
        ...context,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: chatContext,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              fullContent += text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, content: fullContent } : m
                )
              );
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all text-sm ${className}`}
      >
        <Bot className="w-4 h-4" />
        AI Assistant
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[380px] ${className}`}>
      <div className="bg-[#0e0e12] border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-border bg-linear-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-(--accent)/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black">CampusConnect AI</p>
              <p className="text-muted-foreground">
                {streaming ? (
                  <span className="text-amber-400 animate-pulse">Typing...</span>
                ) : 'Ask me anything'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] min-h-[200px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-(--accent)/20 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Bot className="w-3 h-3 text-amber-400" />
                    </div>
                  )}
                  <div className={`p-3 max-w-[85%] ${msg.role === 'user' ? 'bg-linear-to-r from-orange-500 to-amber-500 ml-auto' : 'bg-accent border border-white/5 text-foreground rounded-tl-[4px]'}`}>
                    {msg.content || (
                      <span className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="px-3 py-1.5 bg-(--surface-2) hover:bg-accent border border-border rounded-full text-muted-foreground hover:text-foreground transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-border">
              <div className="flex gap-2 items-end bg-(--surface-2) rounded-xl border border-border px-3 py-2 focus-within:border-amber-500/30 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about this gig..."
                  rows={1}
                  className="flex-1 bg-transparent text-foreground focus:outline-none resize-none placeholder:text-muted-foreground max-h-24"
                  style={{ fieldSizing: 'content' } as any}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="w-10 h-10 rounded-xl bg-foreground text-background hover:bg-orange-600 text-foreground flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
