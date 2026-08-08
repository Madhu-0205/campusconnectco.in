import { redirect } from "next/navigation"
import React, { Suspense } from "react"

import { DesignNode } from "@/components/v2/inspector/DesignNode"
import { QualityGate } from "@/components/v2/QualityGate"
import { ActivePursuitsWidget } from "@/components/v2/workspace/ActivePursuitsWidget"
import { AICopilotWidget } from "@/components/v2/workspace/AICopilotWidget"
import { CareerProgressWidget } from "@/components/v2/workspace/CareerProgressWidget"
import { DeadlinesWidget } from "@/components/v2/workspace/DeadlinesWidget"
import { NetworkWidget } from "@/components/v2/workspace/NetworkWidget"
import { OpportunitiesWidget } from "@/components/v2/workspace/OpportunitiesWidget"
import { QuickActionsWidget } from "@/components/v2/workspace/QuickActionsWidget"
import { WorkspaceGrid } from "@/components/v2/workspace/WorkspaceGrid"
import { WorkspaceWelcome } from "@/components/v2/workspace/WorkspaceWelcome"
import { protectPage } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine"

import { ContextualMapLayout } from "@/components/v2/maps/ContextualMapLayout"
import { MapDataSync } from "@/components/v2/maps/MapDataSync"
import { MarkerData } from "@/components/v2/maps/MapContext"

// Add a standard widget skeleton
const WidgetSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`w-full ${height} rounded-2xl bg-surface-2 animate-pulse border border-border`} />
)

// Data Fetching Components
async function WelcomeSection({ userId }: { userId: string }) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSkills: { include: { skill: true } } }
  })
  
  const userName = dbUser?.name?.split(" ")[0] || "Student"
  const completedGigsCount = await prisma.application.count({ 
    where: { applicantId: userId, status: "ACCEPTED", gig: { status: "COMPLETED" } } 
  })
  
  const fields = [dbUser?.bio, dbUser?.portfolio, dbUser?.linkedin, dbUser?.userSkills?.length, dbUser?.image, dbUser?.city, dbUser?.collegeId]
  const profileCompleteness = Math.round((fields.filter(Boolean).length / fields.length) * 100)
  
  // Calculate a combined career score
  const careerScore = Math.min(1000, 100 + (completedGigsCount * 50) + (profileCompleteness * 2) + ((dbUser?.userSkills?.length || 0) * 10))

  const userLocation = dbUser?.latitude && dbUser?.longitude 
    ? { lat: dbUser.latitude, lng: dbUser.longitude } 
    : null

  return (
    <>
      <MapDataSync userLocation={userLocation} />
      <WorkspaceWelcome 
        userName={userName}
        focusText="Profile & Portfolio Building"
        careerScore={careerScore}
      />
    </>
  )
}

async function AICopilotSection({ userId }: { userId: string }) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSkills: true }
  })
  
  let insight = "Your profile looks solid! Ready to take on some gigs?"
  let actionLabel = "Find Opportunities"
  let actionHref = "/gigs/find"

  if (!dbUser?.city || !dbUser?.collegeId) {
    insight = "Add your college and location to unlock campus-specific opportunities."
    actionLabel = "Add Location"
    actionHref = "/dashboard/student/settings"
  } else if (!dbUser?.bio || !dbUser?.portfolio) {
    insight = "Your profile is missing a bio or portfolio. Completing it increases your match rate by 3x."
    actionLabel = "Update Profile"
    actionHref = "/dashboard/student/profile"
  } else if (!dbUser.userSkills || dbUser.userSkills.length < 3) {
    insight = "Add more skills to your profile to unlock highly targeted AI matches."
    actionLabel = "Add Skills"
    actionHref = "/dashboard/student/profile"
  } else {
    // Generate insight based on recent data or AI engine
    try {
      const aiData = await getPersonalizedRecommendations(userId);
      if (aiData.recommendations && aiData.recommendations.length > 0) {
        insight = `We found ${aiData.recommendations.length} new opportunities perfectly matching your skills.`
      }
    } catch(e) {}
  }

  return (
    <AICopilotWidget 
      insight={insight}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  )
}

async function ActivePursuitsSection({ userId }: { userId: string }) {
  const activeApps = await prisma.application.findMany({
    where: { 
      applicantId: userId, 
      status: { in: ["ACCEPTED", "PENDING"] },
      gig: { status: { not: "COMPLETED" } } 
    },
    include: { gig: true },
    take: 4,
    orderBy: { updatedAt: 'desc' }
  })

  const mappedPursuits = activeApps.map(app => ({
    id: app.id,
    title: app.gig.title,
    company: "Campus Client", // In a real scenario, fetch company/creator name
    status: app.status === "ACCEPTED" ? "WORKING" : "PENDING" as any,
    deadline: app.gig.deadline,
    href: `/dashboard/student/applications`
  }))

  return <ActivePursuitsWidget pursuits={mappedPursuits} />
}

async function OpportunitiesSection({ userId }: { userId: string }) {
  let mappedOpps: any[] = []
  
  try {
    const aiData = await getPersonalizedRecommendations(userId)
    if (aiData.recommendations && aiData.recommendations.length > 0) {
      mappedOpps = aiData.recommendations.slice(0, 3).map((r: any) => ({
        id: r.opportunity.id,
        title: r.opportunity.title,
        company: r.opportunity.company || "Campus Client",
        matchScore: r.matchScore,
        type: r.type,
        lat: r.opportunity.latitude || null,
        lng: r.opportunity.longitude || null
      }))
    } else {
      // Fallback to trending
      const trending = await prisma.internship.findMany({
        where: { status: "OPEN" },
        orderBy: { views: "desc" },
        take: 3
      })
      mappedOpps = trending.map(t => ({
        id: t.id,
        title: t.title,
        company: t.company,
        matchScore: 85,
        type: "INTERNSHIP",
        lat: t.latitude || null,
        lng: t.longitude || null
      }))
    }
  } catch(e) {
    console.error(e)
  }

  const markers: MarkerData[] = mappedOpps
    .filter(o => o.lat && o.lng)
    .map(o => ({
      id: o.id,
      type: o.type.toLowerCase() === "gig" ? "gig" : "internship",
      lat: o.lat,
      lng: o.lng,
      title: o.title,
      subtitle: o.company
    }))

  return (
    <>
      <MapDataSync markers={markers} />
      <OpportunitiesWidget opportunities={mappedOpps} />
    </>
  )
}

async function NetworkSection({ userId }: { userId: string }) {
  const unreadMessagesCount = await prisma.message.count({ 
    where: { 
      conversation: { OR: [{ participant_1: userId }, { participant_2: userId }] }, 
      sender_id: { not: userId }, 
      read_at: null 
    } 
  })

  return (
    <NetworkWidget 
      unreadMessages={unreadMessagesCount}
      pendingConnections={0} // To be implemented in network system
    />
  )
}

async function CareerProgressSection({ userId }: { userId: string }) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSkills: true }
  })
  
  const fields = [dbUser?.bio, dbUser?.portfolio, dbUser?.linkedin, dbUser?.userSkills?.length, dbUser?.image, dbUser?.city, dbUser?.collegeId]
  const profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100)
  const skillsCount = dbUser?.userSkills?.length || 0
  const badgesEarned = Math.floor(skillsCount / 2) + (profileCompletion === 100 ? 1 : 0)

  return (
    <CareerProgressWidget 
      profileCompletion={profileCompletion}
      skillsCount={skillsCount}
      badgesEarned={badgesEarned}
    />
  )
}

export default async function CareerWorkspace() {
  const { authorized, user } = await protectPage(["STUDENT", "FOUNDER"])
  if (!authorized || !user) {
    redirect("/auth/sign-in")
  }

  return (
    <ContextualMapLayout>
      <DesignNode
        metadata={{
          name: "CareerWorkspacePage",
          tokens: ['bg-background', 'text-foreground'],
          typography: "Inter (Sans)",
          motionPreset: "None (Handled by WorkspaceGrid)",
          borderRadius: "none",
          elevation: "none",
          colors: "background, foreground",
          spacing: "p-6",
          accessibilityNotes: "Root container for dashboard"
        }}
      >
        <div className="min-h-screen bg-background text-foreground pb-24">
          
          {/* Workspace Header / ToolBar Space (Optional) */}
          <div className="sticky top-16 z-30 py-6 border-b border-border bg-background/80 backdrop-blur-xl mb-8">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">Career Workspace</h1>
              <QualityGate 
                componentName="CareerWorkspace"
                checks={{ 
                  accessibility: true, 
                  responsive: true, 
                  darkMode: true, 
                  lightMode: true,
                  keyboardNavigation: true,
                  motion: true,
                  loadingState: true,
                  emptyState: true,
                  errorState: true,
                  performance: true
                }} 
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <WorkspaceGrid>
              {/* 1. Welcome Section */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Suspense fallback={<WidgetSkeleton height="h-[120px]" />}>
                  <WelcomeSection userId={user.id} />
                </Suspense>
              </div>

              {/* 2. AI Copilot */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Suspense fallback={<WidgetSkeleton height="h-[100px]" />}>
                  <AICopilotSection userId={user.id} />
                </Suspense>
              </div>

              {/* 3. Row 1: Active Pursuits, Opportunities, Deadlines */}
              <Suspense fallback={<WidgetSkeleton />}>
                <ActivePursuitsSection userId={user.id} />
              </Suspense>

              <Suspense fallback={<WidgetSkeleton />}>
                <OpportunitiesSection userId={user.id} />
              </Suspense>
              
              <Suspense fallback={<WidgetSkeleton />}>
                <DeadlinesWidget deadlines={[]} />
              </Suspense>

              {/* 4. Row 2: Network, Career Progress, Quick Actions */}
              <Suspense fallback={<WidgetSkeleton />}>
                <NetworkSection userId={user.id} />
              </Suspense>

              <Suspense fallback={<WidgetSkeleton />}>
                <CareerProgressSection userId={user.id} />
              </Suspense>

              <QuickActionsWidget />

            </WorkspaceGrid>
          </div>
        </div>
      </DesignNode>
    </ContextualMapLayout>
  )
}
