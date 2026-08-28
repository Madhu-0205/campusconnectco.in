"use client"

import { Search, Phone, Video, MoreVertical, Paperclip, Send, Mic, Check, CheckCheck, Smile, Image as ImageIcon, Lock } from"lucide-react"
import { useState, type FormEvent } from"react"

import { Button } from"@/components/ui/Button"

// Types
type Contact = {
 id: number
 name: string
 avatar: string
 status:"online" |"offline"
 lastMessage: string
 time: string
 unread: number
 verified?: boolean
 isGroup?: boolean
}

type Message = {
 id: number
 sender_id: number
 text: string
 time: string
 status:"read" |"delivered" |"sent"
}

// Dummy Data
const contacts: Contact[] = [
 { id: 1, name:"Alice Freeman", avatar:"AF", status:"online", lastMessage:"Hey, are we still on for the meeting?", time:"10:30 AM", unread: 2 },
 { id: 2, name:"CampusConnect Support", avatar:"CC", status:"offline", lastMessage:"Your gig application has been approved!", time:"Yesterday", unread: 0, verified: true },
 { id: 3, name:"David Chen", avatar:"DC", status:"online", lastMessage:"I'll send the files over shortly.", time:"Yesterday", unread: 0 },
 { id: 4, name:"Sarah Wilson", avatar:"SW", status:"offline", lastMessage:"Thanks for the help!", time:"Tue", unread: 0 },
 { id: 5, name:"Project Alpha Team", avatar:"PA", status:"online", lastMessage:"New task assigned: UI Design", time:"Mon", unread: 5, isGroup: true },
]

const initialMessages: Message[] = [
 { id: 1, sender_id: 1, text:"Hi there! I saw your profile and thought you'd be great for our new project.", time:"10:00 AM", status:"read" },
 { id: 2, sender_id: 0, text:"Hello! Thanks for reaching out. I'd love to hear more about it.", time:"10:05 AM", status:"read" },
 { id: 3, sender_id: 1, text:"It's a fintech app focused on student loans. We need a React expert.", time:"10:07 AM", status:"read" },
 { id: 4, sender_id: 1, text:"Are you available for a quick call?", time:"10:07 AM", status:"read" },
 { id: 5, sender_id: 0, text:"Sure, I'm free this afternoon. Does 2 PM work?", time:"10:10 AM", status:"delivered" },
]

export default function MessagesPage() {
 const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0])
 const [messages, setMessages] = useState<Message[]>(initialMessages)
 const [newMessage, setNewMessage] = useState("")
 const [isMobileOverview, setIsMobileOverview] = useState(true)

 const handleSendMessage = (e: FormEvent) => {
 e.preventDefault()
 if (!newMessage.trim()) return

 const msg: Message = {
 id: messages.length + 1,
 sender_id: 0, // Me
 text: newMessage,
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 status:"sent"
 }
 setMessages([...messages, msg])
 setNewMessage("")

 // Simulate reply
 setTimeout(() => {
 const reply: Message = {
 id: messages.length + 2,
 sender_id: selectedContact?.id || 1,
 text:"That sounds great! Let's lock it in.",
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 status:"read"
 }
 setMessages(prev => [...prev, reply])
 }, 2000)
 }

 return (
 <div className="flex h-[calc(100vh-8rem)] bg-[#111116] rounded-3xl overflow-hidden shadow-sm border border-white/10">
 {/* Sidebar - Contact List */}
 <div className={`w-full md:w-80 lg:w-96 border-white/10 bg-[#111116] flex flex-col ${selectedContact && !isMobileOverview ? 'hidden md:flex' : 'flex'}`}>
 {/* Header */}
 <div className="p-4 border-white/10 flex justify-between items-center bg-[#111116] sticky top-0 z-10">
 <h2 className="font-bold text-white">Chats</h2>
 <div className="flex gap-2">
 <Button variant="ghost" size="icon" className="text-slate-500" suppressHydrationWarning>
 <MoreVertical size={20} />
 </Button>
 </div>
 </div>

 {/* Search */}
 <div className="p-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input
 type="text"
 placeholder="Search or start new chat"
 className="w-full bg-white/5 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-400"
 suppressHydrationWarning
 />
 </div>
 </div>

 {/* Contact List */}
 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {contacts.map(contact => (
 <div
 key={contact.id}
 onClick={() => { setSelectedContact(contact); setIsMobileOverview(false); }}
 className={`flex gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-500/10' : 'hover:bg-white/5' }`}
 >
 <div className="relative shrink-0">
 <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-primary-light flex items-center justify-center font-bold text-lg">
 {contact.avatar}
 </div>
 {contact.status === 'online' && (
 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[#111116]"></div>
 )}
 </div>
 <div className="min-w-0 flex flex-col justify-center">
 <div className="flex justify-between items-baseline">
 <h3 className="font-semibold text-white truncate flex items-center gap-1">
 {contact.name}
 {contact.verified && <CheckCheck size={14} className="text-blue-500" />}
 </h3>
 <span className={`text-[10px] whitespace-nowrap ${contact.unread > 0 ? 'text-green-500 font-bold' : 'text-slate-400'}`}>
 {contact.time}
 </span>
 </div>
 <div className="flex justify-between items-center mt-0.5">
 <p className="text-slate-400 truncate pr-2">
 {contact.lastMessage}
 </p>
 {contact.unread > 0 && (
 <span className="bg-green-500 text-[10px] font-bold px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center">
 {contact.unread}
 </span>
 )}
 </div>
 </div>
 </div>
 ))}

 <div className="mt-8 px-6 pb-6 text-center">
 <div className="flex items-center justify-center gap-1.5 text-slate-400 font-medium">
 <Lock size={10} />
 Your personal messages are end-to-end encrypted
 </div>
 </div>
 </div>
 </div>

 {/* Main Chat Area */}
 {selectedContact ? (
 <div className={`flex flex-col bg-[#0a0a0f] relative ${!isMobileOverview ? 'flex' : 'hidden md:flex'}`}>
 {/* Chat Header */}
 <div className="h-16 px-4 py-2 border-white/10 bg-[#111116] flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3">
 <Button
 variant="ghost"
 size="icon"
 className="md:hidden mr-1 -ml-2"
 onClick={() => setIsMobileOverview(true)}
 suppressHydrationWarning
 >
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
 <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </Button>
 <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-primary-light flex items-center justify-center font-bold text-sm">
 {selectedContact.avatar}
 </div>
 <div>
 <h3 className="font-bold text-white leading-tight">{selectedContact.name}</h3>
 <p className="text-slate-400">
 {selectedContact.status === 'online' ? 'Online' : 'Last seen recently'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1">
 <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-white/5 rounded-full" suppressHydrationWarning>
 <Video size={20} />
 </Button>
 <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-white/5 rounded-full" suppressHydrationWarning>
 <Phone size={18} />
 </Button>
 <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
 <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-white/5 rounded-full" suppressHydrationWarning>
 <Search size={18} />
 </Button>
 <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-white/5 rounded-full" suppressHydrationWarning>
 <MoreVertical size={18} />
 </Button>
 </div>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0a0a0f] space-y-4">
 {/* Date Separator */}
 <div className="flex justify-center mb-6">
 <span className="bg-white/5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
 Today
 </span>
 </div>

 {/* Encryption Notice */}
 <div className="flex justify-center mb-4">
 <div className="bg-yellow-500/10 px-4 py-2 rounded-lg text-center shadow-sm max-w-sm flex items-center gap-2">
 <Lock size={12} className="shrink-0" />
 <span>Messages are end-to-end encrypted. No one outside of this chat, not even CampusConnect, can read or listen to them.</span>
 </div>
 </div>

 {messages.map((msg) => (
 <div
 key={msg.id}
 className={`flex ${msg.sender_id === 0 ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 relative shadow-sm group ${msg.sender_id === 0 ? 'bg-linear-to-br from-blue-600 to-primary-light shadow-lg shadow-blue-500/10' : 'bg-white/5 text-white rounded-tl-none border border-white/5'}`}>
 <p className="leading-relaxed">{msg.text}</p>
 <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender_id === 0 ? 'text-blue-100' : 'text-slate-400'}`}>
 <span>{msg.time}</span>
 {msg.sender_id === 0 && (
 msg.status === 'read'
 ? <CheckCheck size={12} className="text-blue-200" />
 : <Check size={12} className="text-blue-200" />
 )}
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Chat Input */}
 <div className="p-3 bg-[#111116] border-white/10 shrink-0">
 <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
 <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 mb-1" suppressHydrationWarning>
 <ImageIcon size={20} />
 </Button>
 <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 mb-1" suppressHydrationWarning>
 <Paperclip size={20} />
 </Button>

 <div className="flex-1 bg-white/5 rounded-2xl flex items-center p-1">
 <input
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 placeholder="Type a message"
 className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 max-h-32 min-h-[40px] text-white placeholder:text-slate-500"
 suppressHydrationWarning
 />
 <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600" suppressHydrationWarning>
 <Smile size={20} />
 </Button>
 </div>

 {newMessage.trim() ? (
 <Button
 type="submit"
 className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
 suppressHydrationWarning
 >
 <Send size={20} className="ml-0.5" />
 </Button>
 ) : (
 <Button
 type="button"
 className="rounded-full w-12 h-12 flex items-center justify-center bg-white/5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
 suppressHydrationWarning
 >
 <Mic size={20} />
 </Button>
 )}
 </form>
 </div>
 </div>
 ) : (
 <div className="hidden md:flex flex-1 items-center justify-center bg-[#0a0a0f] border-white/10">
 <div className="text-center max-w-md p-4 md:p-8">
 <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
 <MessageCircle size={64} className="opacity-50" />
 </div>
 <h2 className="font-bold text-white mb-2">CampusConnect Web</h2>
 <p className="text-slate-400 mb-6">Send and receive messages without keeping your phone online.<br />Use CampusConnect on up to 4 linked devices and 1 phone.</p>
 <div className="flex items-center justify-center gap-2 text-slate-400">
 <Lock size={12} />
 End-to-end encrypted
 </div>
 </div>
 </div>
 )}
 </div>
 )
}

function MessageCircle({ size, className }: { size?: number, className?: string }) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 width={size || 24}
 height={size || 24}
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
 </svg>
 )
}
