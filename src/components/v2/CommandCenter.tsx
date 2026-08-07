"use client"

import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Compass, FileText, User, Settings, ArrowRight, Sparkles, Building2, Shield, Plus, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { springSmooth } from "@/lib/motion"
import { createClient } from "@/lib/supabase/client"

export const CommandCenter = () => {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch user role on mount
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setRole(user.user_metadata?.role || null)
      } else {
        setRole(null)
      }
    }
    
    fetchUserRole()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setRole(session.user.user_metadata?.role || null)
      } else {
        setRole(null)
      }
    })

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    const openCenter = () => setOpen(true)
    
    document.addEventListener("keydown", down)
    document.addEventListener("open-command-center", openCenter)
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("open-command-center", openCenter)
      subscription.unsubscribe()
    }
  }, [supabase])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const isStudent = role === 'STUDENT'
  const isEmployer = role === 'CLIENT' || role === 'STARTUP'
  const isFounder = role === 'FOUNDER'

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
          label="Global Command Menu"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={springSmooth}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-card-hover backdrop-blur-2xl"
          >
            <Command className="w-full flex flex-col">
              <div className="flex items-center border-b border-border px-4" cmdk-input-wrapper="">
                <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="What do you need?"
                  className="flex h-16 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground"
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-surface-2 px-2 text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">ESC</span>
                </kbd>
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-none">
                <Command.Empty className="py-12 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>
                
                {/* ── Public / Common Opportunities ── */}
                <Command.Group heading="Opportunities" className="px-2 py-3 text-xs font-medium text-muted-foreground **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:px-2">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/gigs/find"))}
                    className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                  >
                    <Compass className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                    <span>Browse Campus Gigs</span>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/internships"))}
                    className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                  >
                    <FileText className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                    <span>Find Internships</span>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                </Command.Group>
                
                <Command.Separator className="h-px w-full bg-border" />
                
                {/* ── Student Tools ── */}
                {isStudent && (
                  <>
                    <Command.Group heading="Student Tools" className="px-2 py-3 text-xs font-medium text-muted-foreground **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:px-2">
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/dashboard/student/career-copilot"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <Sparkles className="mr-3 h-4 w-4 text-emerald-500" />
                        <span>AI Career Copilot</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/dashboard/student/resume-analyzer"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <FileText className="mr-3 h-4 w-4 text-blue-500" />
                        <span>Resume Analyzer</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/dashboard/student/applications"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <GraduationCap className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                        <span>My Applications</span>
                      </Command.Item>
                    </Command.Group>
                    <Command.Separator className="h-px w-full bg-border" />
                  </>
                )}

                {/* ── Employer Tools ── */}
                {isEmployer && (
                  <>
                    <Command.Group heading="Employer Tools" className="px-2 py-3 text-xs font-medium text-muted-foreground **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:px-2">
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/post-gig"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <Plus className="mr-3 h-4 w-4 text-primary" />
                        <span>Post a new Gig</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/employer/talent-search"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <Search className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                        <span>Talent Search</span>
                      </Command.Item>
                    </Command.Group>
                    <Command.Separator className="h-px w-full bg-border" />
                  </>
                )}

                {/* ── Founder Hub ── */}
                {isFounder && (
                  <>
                    <Command.Group heading="Founder Hub" className="px-2 py-3 text-xs font-medium text-muted-foreground **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:px-2">
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/dashboard/founder"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <Shield className="mr-3 h-4 w-4 text-rose-500" />
                        <span>Admin Dashboard</span>
                      </Command.Item>
                      <Command.Item
                        onSelect={() => runCommand(() => router.push("/dashboard/founder/approvals"))}
                        className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                      >
                        <Building2 className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                        <span>Review Approvals</span>
                      </Command.Item>
                    </Command.Group>
                    <Command.Separator className="h-px w-full bg-border" />
                  </>
                )}

                {/* ── Personal / Settings ── */}
                <Command.Group heading="Workspace" className="px-2 py-3 text-xs font-medium text-muted-foreground **:[[cmdk-group-heading]]:mb-2 **:[[cmdk-group-heading]]:px-2">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push(role === 'STUDENT' ? "/dashboard/student/profile" : "/dashboard"))}
                    className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                  >
                    <User className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                    <span>My Profile</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push(role === 'STUDENT' ? "/dashboard/student/settings" : role === 'FOUNDER' ? "/dashboard/founder/settings" : "/dashboard"))}
                    className="flex cursor-pointer items-center rounded-lg px-3 py-3 text-sm aria-selected:bg-surface-2 aria-selected:text-foreground transition-colors group"
                  >
                    <Settings className="mr-3 h-4 w-4 text-muted-foreground group-aria-selected:text-foreground transition-colors" />
                    <span>Settings</span>
                  </Command.Item>
                </Command.Group>

              </Command.List>
            </Command>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  )
}
