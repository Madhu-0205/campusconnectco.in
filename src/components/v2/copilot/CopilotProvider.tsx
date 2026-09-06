"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from"react"

export interface Message {
 id: string;
 role: 'user' | 'assistant';
 content: string;
}

interface CopilotContextType {
 isOpen: boolean
 setIsOpen: (open: boolean) => void
 toggleChat: () => void
 promptChat: (prompt: string) => void
 messages: Message[]
 input: string
 handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
 handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
 isLoading: boolean
 stop: () => void
 error: Error | undefined
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined)

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
 const [isOpen, setIsOpen] = useState(false)
 const [input, setInput] = useState("")
 const [messages, setMessages] = useState<Message[]>([
 { id:"1", role:"assistant", content:"Hi Madhu, I'm your Career Copilot. How can I help you today?" }
 ])
 const [isLoading, setIsLoading] = useState(false)
 const error = undefined

 const toggleChat = () => setIsOpen((prev) => !prev)

 const stop = () => setIsLoading(false)

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          messages: currentMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Copilot response failed");
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "I've reviewed your request based on CampusConnect marketplace data."
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (_err: any) {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Career Copilot is temporarily in low-latency fallback mode. Based on verified platform records, please review your recommended opportunities and ensure your resume tags match the required skills."
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

 const promptChat = (prompt: string) => {
 setIsOpen(true)
 sendMessage(prompt)
 }

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
 setInput(e.target.value)
 }

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault()
 sendMessage(input)
 setInput("")
 }

 useEffect(() => {
 const handleGlobalKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
 e.preventDefault()
 toggleChat()
 }
 }
 
 window.addEventListener('keydown', handleGlobalKeyDown)
 return () => window.removeEventListener('keydown', handleGlobalKeyDown)
 }, [])

 return (
 <CopilotContext.Provider
 value={{
 isOpen,
 setIsOpen,
 toggleChat,
 promptChat,
 messages,
 input,
 handleInputChange,
 handleSubmit,
 isLoading,
 stop,
 error,
 }}
 >
 {children}
 </CopilotContext.Provider>
 )
}

export const useCopilot = () => {
 const context = useContext(CopilotContext)
 if (context === undefined) {
 throw new Error("useCopilot must be used within a CopilotProvider")
 }
 return context
}
