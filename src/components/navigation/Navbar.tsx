import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

import { MobileTabBar } from './MobileTabBar'
import { NavbarClient } from './NavbarClient'

export default async function Navbar() {
  const headersList = await headers()
  const isPrerender = !headersList.has('x-request-id')

  if (isPrerender) {
    return (
      <>
        <NavbarClient 
          userRole={null} 
          userId={null} 
          userName={null} 
          userAvatar={null} 
          unreadMessages={0} 
          pendingApplications={0} 
        />
        <MobileTabBar userRole={null} />
      </>
    )
  }

  const supabase = await createClient()

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <>
        <NavbarClient 
          userRole={null} 
          userId={null} 
          userName={null} 
          userAvatar={null} 
          unreadMessages={0} 
          pendingApplications={0} 
        />
        <MobileTabBar userRole={null} />
      </>
    )
  }

  // Fetch real-time user role and base info from 'User' table in Supabase
  const { data: userData } = await supabase
    .from('User')
    .select('role, full_name, name, avatar_url, image')
    .eq('id', user.id)
    .single()

  const userRole = userData?.role || 'STUDENT'
  const userName = userData?.full_name || userData?.name || user.email?.split('@')[0]
  const userAvatar = userData?.avatar_url || userData?.image

  // Fetch unread messages count
  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('read_at', null)
    .neq('sender_id', user.id)

  // Fetch pending applications count for startups
  // Fetch pending applications count for any gigs posted by this user
  let pendingApps = 0
  const { count } = await supabase
    .from('applications')
    .select('*, gig:gigs!inner(posted_by)', { count: 'exact', head: true })
    .eq('status', 'PENDING')
    .eq('gig.posted_by', user.id)
  
  pendingApps = count || 0

  return (
    <>
      <NavbarClient 
        userRole={userRole}
        userId={user.id}
        userName={userName}
        userAvatar={userAvatar}
        unreadMessages={unreadMessages || 0}
        pendingApplications={pendingApps}
      />
      <MobileTabBar userRole={userRole} />
    </>
  )
}

