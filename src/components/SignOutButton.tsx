'use client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
 const supabase = createClient()
 const router = useRouter()

 const handleSignOut = async () => {
 await supabase.auth.signOut()
 router.push('/')
 router.refresh()
 }

 return (
 <button
 onClick={handleSignOut}
 className="flex items-center gap-3 px-5 py-3 font-black uppercase tracking-widest text-[#F43F5E] hover:bg-[#F43F5E]/5 transition-all w-full"
 >
 <LogOut size={16} />
 Sign Out
 </button>
 )
}
