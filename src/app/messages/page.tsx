import { redirect } from 'next/navigation'

import { MessagesLayout } from '@/components/messages/MessagesLayout'
import prisma, { withRetry } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
 searchParams: Promise<{ with?: string }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()
 const params = await searchParams

 if (!user) redirect('/auth/sign-in')

 // Fetch all conversations where user is a participant using Prisma (more stable)
 
 let conversations: any[] = []
 try {
 conversations = await withRetry(async () => {
 const results = await prisma.conversation.findMany({
 where: {
 OR: [
 { participant_1: user.id },
 { participant_2: user.id }
 ]
 },
 include: {
 user1: true,
 user2: true,
 messages: {
 orderBy: { created_at: 'desc' },
 take: 1
 }
 },
 orderBy: { last_message_at: 'desc' }
 })
 return results
 })
 } catch (error) {
 console.error('Error fetching conversations via Prisma:', error)
 }

 // Handle"Start Chat" from profile
 let initialActiveId = null
 if (params.with && params.with !== user.id) {
 // Check if conversation exists
 try {
 const existing = await prisma.conversation.findFirst({
 where: {
 OR: [
 { participant_1: user.id, participant_2: params.with },
 { participant_1: params.with, participant_2: user.id }
 ]
 }
 })

 if (existing) {
 initialActiveId = existing.id
 } else {
 // Create NEW conversation
 const created = await prisma.conversation.create({
 data: {
 participant_1: user.id < params.with ? user.id : params.with,
 participant_2: user.id < params.with ? params.with : user.id,
 last_message_at: new Date()
 }
 })
 if (created) initialActiveId = created.id
 }
 } catch (err) {
 console.error('Error initializing chat:', err)
 }
 }

 return (
 <div className="min-h-screen bg-background pt-24 pb-12 px-6">
 <div className="max-w-7xl mx-auto">
 <MessagesLayout 
 
 initialConversations={(conversations || []) as any[]}
 currentUserId={user.id}
 initialActiveId={initialActiveId}
 />
 </div>
 </div>
 )
}
