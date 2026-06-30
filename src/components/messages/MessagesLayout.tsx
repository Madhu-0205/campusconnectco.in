'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import NextImage from 'next/image'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Send, Plus, MoreVertical, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Image as ImageIcon, Paperclip, Smile,
  Check, CheckCheck, Loader2, Phone, Video,
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowLeft, Users, ShieldCheck, Sparkles, UserCircle, MessageSquare
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { notify } from '@/lib/toast'

interface ConversationUser {
  id: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  image?: string;
}

interface Conversation {
  id: string;
  user1: ConversationUser;
  user2: ConversationUser;
  last_message?: string;
  last_message_at?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  status?: string;
}

interface MessagesLayoutProps {
  initialConversations: Conversation[]
  currentUserId: string
  initialActiveId?: string | null
}

export function MessagesLayout({ initialConversations, currentUserId, initialActiveId }: MessagesLayoutProps) {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(initialActiveId || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // For presence mapping
  const [presence, setPresence] = useState<Record<string, unknown>>({})
  
  const msgRetryCount = useRef(0)
  const presenceRetryCount = useRef(0)
  const MAX_RETRIES = 5
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
     
    setMounted(true)
  }, [])

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId), 
  [conversations, activeId])

  // Get recipient info from conversation
  const recipient = useMemo(() => {
    if (!activeConversation) return null
    return activeConversation.user1.id === currentUserId ? activeConversation.user2 : activeConversation.user1
  }, [activeConversation, currentUserId])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Subscriptions for Real-time
  useEffect(() => {
    if (!activeId || !currentUserId) return

     
    setLoadingMessages(true)
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
      setLoadingMessages(false)
      
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', activeId)
        .neq('sender_id', currentUserId)
        .is('read_at', null)
    }
    fetchMessages()

    const channel = supabase
      .channel(`conv:${activeId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${activeId}`
      }, (payload: { new: Message, old: Message, eventType: string }) => {
        setMessages(prev => [...prev, payload.new])
        if (payload.new.sender_id !== currentUserId) {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', payload.new.id)
        }
      })
      
    const subscribeWithRetry = () => {
      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          msgRetryCount.current = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (msgRetryCount.current < MAX_RETRIES) {
            msgRetryCount.current++;
            setTimeout(() => {
              supabase.removeChannel(channel);
              subscribeWithRetry();
            }, Math.min(1000 * Math.pow(2, msgRetryCount.current), 10000));
          } else {
            notify.error("Chat connection lost. Please refresh the page.");
          }
        }
      });
    }
    
    subscribeWithRetry();

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, currentUserId])

  // Presence Subscription
  useEffect(() => {
    if (!currentUserId) return // Block anonymous presence connections — prevents Supabase Realtime reconnect loop
    
    const presenceChannel = supabase.channel('presence-sync', {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        setPresence(state)
      })
      
    const subscribePresenceWithRetry = () => {
      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          presenceRetryCount.current = 0;
          await presenceChannel.track({
            userId: currentUserId,
            online_at: new Date().toISOString(),
          })
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (presenceRetryCount.current < MAX_RETRIES) {
            presenceRetryCount.current++;
            setTimeout(() => {
              supabase.removeChannel(presenceChannel);
              subscribePresenceWithRetry();
            }, Math.min(1000 * Math.pow(2, presenceRetryCount.current), 10000));
          }
        }
      })
    }
    
    subscribePresenceWithRetry();

    return () => { supabase.removeChannel(presenceChannel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || !activeId) return

    const content = inputText.trim()
    setInputText('')

    // OPTIMISTIC UPDATE
    const tempId = Math.random().toString()
    const optimisticMsg = {
      id: tempId,
      conversation_id: activeId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      status: 'sending'
    }
    setMessages(prev => [...prev, optimisticMsg])

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: currentUserId,
        content
      })
      .select()
      .single()

    if (error) {
      notify.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } else {
      setMessages(prev => prev.map(m => m.id === tempId ? (data as Message) : m))
      // Update last message and re-sort list
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === activeId ? { ...c, last_message: content, last_message_at: data.created_at } : c
        );
        return [...updated].sort((a, b) => 
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );
      });
    }
  }

  const filteredConversations = conversations.filter(c => {
    const r = c.user1.id === currentUserId ? c.user2 : c.user1
    return (r.full_name || r.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Return SSR-friendly skeleton until mounted
  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] bg-background border border-white/5 rounded-5xl overflow-hidden animate-pulse">
        <aside className="hidden md:flex w-96 bg-(--surface) border-white/5 flex-col p-8 gap-6">
          <div className="h-8 w-32 bg-(--surface-2) rounded-lg" />
          <div className="h-10 bg-(--surface-2) rounded-2xl" />
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-(--surface-2) rounded-2xl" />)}
        </aside>
        <main className="bg-background flex flex-col items-center justify-center">
           <div className="w-16 h-16 bg-(--surface-2) rounded-2xl mb-4" />
           <div className="h-4 w-48 bg-(--surface-2) rounded-lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] bg-background border border-white/5 rounded-5xl overflow-hidden shadow-3xl">
      
      {/* Sidebar - Conversations List */}
      <aside className={cn(
        "w-full md:w-96 bg-(--surface) border-r border-white/5 flex flex-col md:flex",
        activeId && "hidden md:flex"
      )}>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="font-black text-white tracking-tight">Messages</h2>
             <button className="w-10 h-10 rounded-2xl bg-(--surface-2) border border-white/10 flex items-center justify-center text-indigo-400 hover:text-white transition-all">
                <Plus size={20} />
             </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/2 border border-white/10 rounded-2xl py-3 pl-12 pr-4 font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1 scrollbar-hide">
          {filteredConversations.map((conv) => {
            const r = conv.user1.id === currentUserId ? conv.user2 : conv.user1
            const isActive = activeId === conv.id
            const isOnline = presence[r.id]
            
            return (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-3xl transition-all group relative",
                  isActive ? "bg-indigo-600 shadow-xl shadow-indigo-600/20" : "hover:bg-(--surface-2)"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-white/5 group-hover:scale-105 transition-transform">
                    {(r.avatar_url || r.image) ? (
                      <NextImage src={(r.avatar_url || r.image) as string} alt={r.name || 'User'} className="w-full h-full object-cover" width={56} height={56} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-indigo-400">
                        {(r.name as string)?.charAt(0) ?? 'U'}
                      </div>
                    )}
                  </div>
                  {Boolean(isOnline) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[#111116] animate-in zoom-in" />
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("text-sm font-black truncate", isActive ? "text-white" : "text-white")}>
                      {r.full_name || r.name}
                    </p>
                    <span className={cn("text-[9px] font-black uppercase tracking-tight", isActive ? "text-white/60" : "text-slate-500")}>
                      {conv.last_message_at ? format(new Date(conv.last_message_at), 'H:mm') : ''}
                    </span>
                  </div>
                  <p className={cn("text-xs truncate font-medium", isActive ? "text-white/80" : "text-slate-400")}>
                    {conv.last_message || 'Start a conversation'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className={cn(
        "flex-1 flex flex-col bg-[#0d0d12] relative",
        !activeId && "hidden md:flex"
      )}>
        {activeConversation ? (
          <>
            {/* Header */}
            <header className="h-24 px-8 border-white/5 flex items-center justify-between bg-(--surface)/50 backdrop-blur-3xl">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveId(null)} className="md:hidden p-2 text-slate-400 hover:text-white">
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-white/10">
                    {(recipient?.avatar_url || recipient?.image) ? (
                      <NextImage src={(recipient.avatar_url || recipient.image) as string} alt="Recipient" className="w-full h-full object-cover" width={48} height={48} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center font-black text-indigo-400">
                         {(recipient?.name as string)?.charAt(0) ?? 'U'}
                       </div>
                    )}
                  </div>
                  {Boolean(presence[recipient?.id ?? '']) && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[#111116]" />}
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight leading-tight">
                    {recipient?.full_name || recipient?.name}
                  </h3>
                  <p className="font-black uppercase tracking-widest text-emerald-500 opacity-80">
                    {presence[recipient?.id ?? ''] ? 'Online Now' : 'Last seen recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="p-3 rounded-2xl bg-(--surface-2) border border-white/5 text-slate-400 hover:text-white transition-all"><Phone size={18} /></button>
                 <button className="p-3 rounded-2xl bg-(--surface-2) border border-white/5 text-slate-400 hover:text-white transition-all"><Video size={18} /></button>
                 <button className="p-3 rounded-2xl bg-(--surface-2) border border-white/5 text-slate-400 hover:text-white transition-all"><MoreVertical size={18} /></button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/5"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isMe ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-6 py-4 rounded-4xl text-sm font-bold shadow-xl",
                        isMe 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10" 
                          : "bg-(--surface-2) text-slate-200 border border-white/5 rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <span className="font-bold text-slate-600 uppercase tracking-tight">
                          {format(new Date(msg.created_at), 'H:mm')}
                        </span>
                        {isMe && (
                           msg.read_at 
                            ? <CheckCheck className="w-3 h-3 text-indigo-400" />
                            : <Check className="w-3 h-3 text-slate-700" />
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-8 bg-(--surface)/80 backdrop-blur-3xl border-white/5">
              <form onSubmit={handleSendMessage} className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full group-focus-within:bg-indigo-500/10 transition-all" />
                <div className="relative flex items-center bg-[#18181F] border border-white/5 group-focus-within:border-indigo-500/30 rounded-3xl p-1.5 shadow-2xl transition-all">
                  <button type="button" className="p-3 text-slate-500 hover:text-indigo-400 transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent px-3 py-4 text-sm font-bold placeholder-slate-600 focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-3 text-slate-500 hover:text-indigo-400 transition-colors hidden sm:block">
                      <Smile size={20} />
                    </button>
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      <Send size={18} fill="white" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full" />
                <div className="relative w-24 h-24 rounded-4xl bg-(--surface) border border-white/10 flex items-center justify-center shadow-2xl">
                   <MessageSquare size={40} className="text-indigo-400" />
                </div>
             </div>
             <h3 className="font-black text-white tracking-tight mb-4">Select a Conversation</h3>
             <p className="max-w-xs text-slate-500 font-medium leading-relaxed">
               Pick a connection from the left to start collaborating on your next big project.
             </p>
             <div className="mt-10 flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-(--surface-2) border border-white/10 rounded-xl font-black text-slate-400 uppercase tracking-widest">
                   <ShieldCheck size={14} className="text-emerald-500" />
                   End-to-End Encrypted
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-(--surface-2) border border-white/10 rounded-xl font-black text-slate-400 uppercase tracking-widest">
                   <Sparkles size={14} className="text-indigo-400" />
                   AI Assisted Gigs
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
