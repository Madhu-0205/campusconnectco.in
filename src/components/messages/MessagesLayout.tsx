'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  Search, Send, Plus, MoreVertical, 
  Paperclip, Smile,
  Check, CheckCheck, Loader2, Phone, Video,
  ArrowLeft, ShieldCheck, Sparkles, MessageSquare
} from 'lucide-react'
import NextImage from 'next/image'
import { useState, useEffect, useRef, useMemo } from 'react'

import { createClient } from '@/lib/supabase/client'
import { notify } from '@/lib/toast'
import { cn } from '@/lib/utils'

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
      channel.subscribe((status) => {
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
    if (!currentUserId) return

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
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: activeId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      status: 'sending'
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeId,
          content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

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
    } catch {
      notify.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const filteredConversations = conversations.filter(c => {
    const r = c.user1.id === currentUserId ? c.user2 : c.user1
    const name = r.full_name || r.name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Return SSR-friendly skeleton until mounted
  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-8rem)] min-h-[580px] bg-card border border-border rounded-3xl overflow-hidden shadow-card animate-pulse">
        <aside className="hidden md:flex w-96 bg-card border-r border-border flex-col p-6 gap-4">
          <div className="h-8 w-32 bg-surface-2 rounded-lg" />
          <div className="h-10 bg-surface-2 rounded-xl" />
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-2 rounded-2xl" />)}
        </aside>
        <main className="flex-1 bg-surface flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-surface-2 rounded-2xl mb-4" />
          <div className="h-4 w-48 bg-surface-2 rounded-lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[580px] bg-card border border-border rounded-3xl overflow-hidden shadow-card">
      
      {/* Sidebar - Conversations List */}
      <aside className={cn(
        "w-full md:w-96 bg-card border-r border-border flex flex-col",
        activeId && "hidden md:flex"
      )}>
        <div className="p-6 pb-4 space-y-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground tracking-tight">Messages</h2>
            <button 
              type="button"
              aria-label="New conversation"
              className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-all shadow-xs"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs font-medium">
              {searchQuery ? "No matching conversations found." : "No conversations yet."}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const r = conv.user1.id === currentUserId ? conv.user2 : conv.user1
              const displayName = r.full_name?.trim() || r.name?.trim() || 'Campus Member'
              const isActive = activeId === conv.id
              const isOnline = Boolean(presence[r.id])
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all group relative text-left",
                    isActive 
                      ? "bg-primary/10 border-l-4 border-l-primary text-foreground shadow-xs font-medium" 
                      : "hover:bg-surface-2/80 text-foreground"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-border group-hover:scale-105 transition-transform flex items-center justify-center">
                      {(r.avatar_url || r.image) ? (
                        <NextImage 
                          src={(r.avatar_url || r.image) as string} 
                          alt={displayName} 
                          className="w-full h-full object-cover" 
                          width={48} 
                          height={48} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-foreground text-base bg-surface-2">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={cn("text-sm font-bold truncate", isActive ? "text-primary-dark dark:text-primary" : "text-foreground")}>
                        {displayName}
                      </p>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {conv.last_message_at ? format(new Date(conv.last_message_at), 'H:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs truncate font-medium text-muted-foreground">
                      {conv.last_message || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className={cn(
        "flex-1 flex flex-col bg-surface relative",
        !activeId && "hidden md:flex"
      )}>
        {activeConversation ? (
          <>
            {/* Header */}
            <header className="h-20 px-6 border-b border-border flex items-center justify-between bg-card/90 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <button 
                  onClick={() => setActiveId(null)} 
                  className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
                    {(recipient?.avatar_url || recipient?.image) ? (
                      <NextImage 
                        src={(recipient.avatar_url || recipient.image) as string} 
                        alt="Recipient" 
                        className="w-full h-full object-cover" 
                        width={44} 
                        height={44} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-foreground bg-surface-2">
                        {(recipient?.full_name || recipient?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {Boolean(presence[recipient?.id ?? '']) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground tracking-tight leading-tight text-base">
                    {recipient?.full_name || recipient?.name || 'Campus Member'}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {presence[recipient?.id ?? ''] ? 'Online Now' : 'Active recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  aria-label="Audio call"
                  className="p-2.5 rounded-xl bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-all shadow-xs"
                >
                  <Phone size={16} />
                </button>
                <button 
                  type="button" 
                  aria-label="Video call"
                  className="p-2.5 rounded-xl bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-all shadow-xs"
                >
                  <Video size={16} />
                </button>
                <button 
                  type="button" 
                  aria-label="Conversation options"
                  className="p-2.5 rounded-xl bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-all shadow-xs"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-2/25"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare size={32} className="text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium">No messages yet. Send a greeting to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex flex-col max-w-[75%]",
                        isMe ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-xs break-words leading-relaxed",
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-surface border border-border text-foreground rounded-tl-none shadow-xs"
                      )}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {format(new Date(msg.created_at), 'H:mm')}
                        </span>
                        {isMe && (
                          msg.read_at 
                            ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                            : <Check className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-center bg-surface border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-1.5 shadow-xs transition-all">
                  <button 
                    type="button" 
                    aria-label="Attach file"
                    className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-surface-2"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button 
                      type="button" 
                      aria-label="Insert emoji"
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block rounded-xl hover:bg-surface-2"
                    >
                      <Smile size={18} />
                    </button>
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      aria-label="Send message"
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground p-2.5 rounded-xl shadow-xs active:scale-95 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-surface">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-xs">
              <MessageSquare size={36} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Select a Conversation</h3>
            <p className="max-w-sm text-muted-foreground font-medium text-sm leading-relaxed mb-8">
              Pick a connection from the left to start collaborating on your next campus project.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border rounded-xl font-bold text-xs text-foreground shadow-xs">
                <ShieldCheck size={16} className="text-primary" />
                Verified Campus Messaging
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border rounded-xl font-bold text-xs text-foreground shadow-xs">
                <Sparkles size={16} className="text-primary" />
                Collaborative Network
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
