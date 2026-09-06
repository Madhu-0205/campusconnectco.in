"use client"

import { motion, AnimatePresence } from"framer-motion"
import { X, Send, Sparkles, StopCircle } from"lucide-react"
import React, { useEffect, useRef } from"react"
import ReactMarkdown from 'react-markdown'

import { Button } from"@/components/ui/Button"
import { UserAvatar } from"@/components/v2/UserAvatar"

import { useCopilot } from"./CopilotProvider"

export const CopilotChat = () => {
 const { isOpen, setIsOpen, messages, input, handleInputChange, handleSubmit, isLoading, stop, promptChat } = useCopilot()
 const messagesEndRef = useRef<HTMLDivElement>(null)
 const chatPanelRef = useRef<HTMLDivElement>(null)
 const inputRef = useRef<HTMLTextAreaElement>(null)
 
 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior:"smooth" })
 }

 useEffect(() => {
 scrollToBottom()
 }, [messages])

 useEffect(() => {
 if (isOpen) {
 // Focus trap logic
 const focusableElements = chatPanelRef.current?.querySelectorAll(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 )
 
 const firstElement = focusableElements?.[0] as HTMLElement
 const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

 const handleTabKey = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 setIsOpen(false)
 return
 }
 
 if (e.key !== 'Tab') return

 if (e.shiftKey) {
 if (document.activeElement === firstElement) {
 e.preventDefault()
 lastElement?.focus()
 }
 } else {
 if (document.activeElement === lastElement) {
 e.preventDefault()
 firstElement?.focus()
 }
 }
 }

 document.addEventListener('keydown', handleTabKey)
 // Focus input when opened
 setTimeout(() => inputRef.current?.focus(), 100)

 return () => {
 document.removeEventListener('keydown', handleTabKey)
 }
 }
 }, [isOpen, setIsOpen])

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsOpen(false)}
 className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
 />
 <motion.div
 ref={chatPanelRef}
 initial={{ x:"100%" }}
 animate={{ x: 0 }}
 exit={{ x:"100%" }}
 transition={{ type:"spring", damping: 25, stiffness: 200 }}
 className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 flex flex-col shadow-2xl"
 >
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-md">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
 <Sparkles size={20} />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-bold text-foreground leading-tight">Career Copilot</h3>
 <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Puter AI</span>
 </div>
 <p className="text-xs text-muted-foreground font-medium">CampusConnect Intelligence</p>
 </div>
 </div>
 <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close Chat" className="text-muted-foreground hover:text-foreground">
 <X size={20} />
 </Button>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
 {messages.length === 0 && (
 <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
 <Sparkles size={48} className="text-muted-foreground mb-4" />
 <p className="text-sm font-medium text-muted-foreground max-w-62.5">
 Ask me anything about your career, resume, or upcoming interviews.
 </p>
 <div className="flex flex-col gap-2 w-full max-w-62.5 mt-8">
 <button onClick={() => promptChat("Review my resume")} className="text-xs font-bold bg-surface-2 p-3 rounded-xl hover:bg-surface-2/80 transition-colors text-left">Review my resume</button>
 <button onClick={() => promptChat("Find me remote React internships")} className="text-xs font-bold bg-surface-2 p-3 rounded-xl hover:bg-surface-2/80 transition-colors text-left">Find me remote React internships</button>
 </div>
 </div>
 )}

 {messages.map((m) => (
 <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
 {m.role === 'user' ? (
 <div className="flex justify-end gap-3 items-end">
 <div className="bg-primary text-primary-foreground px-4 py-3 rounded-3xl rounded-br-sm max-w-[85%] text-sm">
 {m.content}
 </div>
 <UserAvatar fallback="M" size="sm" alt="User" className="shrink-0 mb-1" />
 </div>
 ) : (
 <div className="flex justify-start gap-3 items-start">
 <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
 <Sparkles size={16} />
 </div>
 <div className="bg-surface-2 px-4 py-3 rounded-3xl rounded-bl-sm max-w-[85%] text-sm">
 <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-background prose-pre:border prose-pre:border-border">
 <ReactMarkdown>
 {m.content}
 </ReactMarkdown>
 </div>
 </div>
 </div>
 )}
 </div>
 ))}
 
 {isLoading && messages[messages.length - 1]?.role === 'user' && (
 <div className="flex justify-start">
 <div className="flex gap-3 max-w-[85%]">
 <div className="shrink-0 mt-1">
 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
 <Sparkles size={14} />
 </div>
 </div>
 <div className="px-4 py-3 rounded-2xl bg-surface-2 text-foreground rounded-tl-sm flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
 <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
 <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
 </div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-4 bg-background border-t border-border">
 <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
 <textarea
 ref={inputRef}
 value={input}
 onChange={handleInputChange}
 placeholder="Ask your career copilot..."
 className="w-full bg-surface-2 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-13 max-h-32 custom-scrollbar"
 rows={1}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 if (input.trim() && !isLoading) {
 const form = e.currentTarget.form;
 if (form) form.requestSubmit();
 }
 }
 }}
 />
 <div className="absolute right-2 bottom-2">
 {isLoading ? (
 <Button type="button" size="icon" variant="ghost" onClick={stop} aria-label="Stop generation" className="w-9 h-9 text-muted-foreground hover:text-destructive">
 <StopCircle size={18} />
 </Button>
 ) : (
 <Button type="submit" size="icon" variant="default" disabled={!input.trim()} aria-label="Send message" className="w-9 h-9 rounded-xl shadow-glow-primary">
 <Send size={16} className="ml-0.5" />
 </Button>
 )}
 </div>
 </form>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mt-3 px-1 font-medium">
            <span>AI Copilot can make mistakes. Verify info.</span>
            <a
              href="https://developer.puter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors inline-flex items-center gap-1 font-semibold"
            >
              Powered by Puter
            </a>
          </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 )
}
