"use client"

import React, { useState } from "react"
import { Moon, Sun, Monitor, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { ActivityFeed } from "@/components/v2/ActivityFeed"
import { AIChatBubble } from "@/components/v2/AIChatBubble"
import { FilterBar } from "@/components/v2/FilterBar"
import { GigCard } from "@/components/v2/GigCard"
import { InternshipCard } from "@/components/v2/InternshipCard"
import { MetricCard } from "@/components/v2/MetricCard"
import { SegmentedControl } from "@/components/v2/SegmentedControl"
import { Skeleton } from "@/components/v2/Skeleton"
import { Spinner } from "@/components/v2/Spinner"
import { EmptyState, ErrorState } from "@/components/v2/States"
import { MotionPlayground } from "@/components/v2/MotionPlayground"
import { toast } from "sonner"
import { OpportunityFeed } from "@/components/v2/OpportunityFeed"

// V2 Architecture Imports
import { DesignInspectorProvider, useDesignInspector } from "@/components/v2/inspector/DesignInspectorProvider"
import { DesignNode } from "@/components/v2/inspector/DesignNode"
import { DesignPropertiesPanel } from "@/components/v2/inspector/DesignPropertiesPanel"
import { QualityGate } from "@/components/v2/QualityGate"

const sections = [
  "Production Showcase",
  "Typography", "Colors", "Buttons", "Cards", 
  "Search Components", "Opportunity Cards", "AI Components",
  "Dashboard Widgets", "Motion Playground", "Skeletons",
  "Empty States", "Error States", "Notifications", "Dialogs",
  "Tables", "Responsive Preview", "Command Palette Demo"
]

const ALL_PASSED = { accessibility: true, responsive: true, darkMode: true, lightMode: true, keyboardNavigation: true, motion: true, loadingState: true, emptyState: true, errorState: true, performance: true }
const IN_PROGRESS = { ...ALL_PASSED, emptyState: false, errorState: false }

function InspectorToggle() {
  const { isActive, setIsActive } = useDesignInspector()
  return (
    <Button 
      variant="outline" size="sm" 
      onClick={() => setIsActive(!isActive)}
      className={isActive ? "bg-primary/10 border-primary text-primary" : ""}
    >
      <LayoutDashboard className="w-4 h-4 mr-2" />
      Design Inspector {isActive ? "On" : "Off"}
    </Button>
  )
}

function DesignSystemContent() {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState(sections[0])
  const [segment, setSegment] = useState("All")
  const [filters, setFilters] = useState<string[]>(["1"])

  return (
    <div className="min-h-screen bg-bg text-foreground flex flex-col md:flex-row">
      <DesignPropertiesPanel />
      
      <aside className="w-full md:w-64 shrink-0 border-r border-border bg-surface/50 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto hidden md:flex flex-col p-6 scrollbar-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            D
          </div>
          <span className="font-semibold tracking-tight text-lg">Design Lab</span>
        </div>
        
        <nav className="flex flex-col gap-1">
          {sections.map(section => (
            <a
              key={section}
              href={`#${section.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setActiveSection(section)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section 
                  ? "bg-surface-2 text-foreground" 
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {section}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden relative">
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-border bg-surface/80 backdrop-blur-xl">
          <h1 className="text-xl font-bold">{activeSection}</h1>
          <div className="flex items-center gap-4">
            <InspectorToggle />
            <div className="flex items-center rounded-lg border border-border bg-surface-2 p-1">
              <button onClick={() => setTheme("light")} className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                <Sun className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme("system")} className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme("dark")} className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 space-y-24 max-w-6xl mx-auto">
          
          <section id="production-showcase" className="scroll-mt-32">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Production Showcase</h2>
              <p className="text-muted-foreground mt-2">A realistic assembly of components representing a slice of the Student Dashboard.</p>
            </div>
            <QualityGate checks={ALL_PASSED} componentName="Dashboard Layout" />
            
            <DesignNode metadata={{ name: "Dashboard Layout", tokens: ["--color-bg", "--color-surface"], typography: "DM Sans, Bricolage", motionPreset: "Stagger", borderRadius: "24px", elevation: "None", colors: "Surface, Border", spacing: "Gap 8", accessibilityNotes: "Fully keyboard navigable feed." }}>
              <div className="p-8 rounded-3xl border border-border bg-surface shadow-2xl flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 shrink-0 space-y-6">
                  <MetricCard title="Applications" value="3" trend={{ value: 12, label: "this week", isPositive: true }} />
                  <div className="p-4 rounded-xl bg-surface-2 border border-border">
                    <h3 className="font-semibold text-sm mb-3">Filters</h3>
                    <FilterBar filters={[{id:"remote", label:"Remote"}, {id:"paid", label:"Paid"}]} activeFilters={["remote"]} onFilterToggle={()=>{}} />
                  </div>
                </div>
                <div className="flex-1">
                  <OpportunityFeed opportunities={[
                    { id: "1", type: "internship", title: "Frontend Intern", company: "Vercel", location: "Remote", stipend: "$4,000/mo", tags: ["React", "Next.js"], href: "#" },
                    { id: "2", type: "gig", title: "UI Prototype", company: "Linear", location: "San Francisco", compensation: "$1,500 total", duration: "1 week", tags: ["Figma"], href: "#" }
                  ]} />
                </div>
              </div>
            </DesignNode>
          </section>

          <section id="typography" className="scroll-mt-32">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Typography</h2>
            </div>
            <QualityGate checks={ALL_PASSED} componentName="Typography Scale" />
            <DesignNode metadata={{ name: "Typography", tokens: ["--font-bricolage", "--font-dm-sans"], typography: "Multiple", motionPreset: "None", borderRadius: "16px", elevation: "None", colors: "Foreground, Muted", spacing: "Space Y 8", accessibilityNotes: "Meets WCAG AAA contrast." }}>
              <Card className="p-8 space-y-8">
                <div><h1 className="text-6xl font-extrabold tracking-tight">Heading 1</h1></div>
                <div className="h-px w-full bg-border" />
                <div><p className="text-base text-foreground leading-relaxed max-w-3xl">Body paragraph text using DM Sans.</p></div>
              </Card>
            </DesignNode>
          </section>

          <section id="opportunity-cards" className="scroll-mt-32">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Opportunity Cards</h2>
            </div>
            <QualityGate checks={ALL_PASSED} componentName="Gig & Internship Cards" />
            <DesignNode metadata={{ name: "GigCard", tokens: ["--color-surface", "--color-border"], typography: "Bricolage Grotesque (Titles), DM Sans (Body)", motionPreset: "Hover Spotlight, springSnappy", borderRadius: "24px", elevation: "Shadow Card", colors: "Surface, Muted", spacing: "P 6, Gap 4", accessibilityNotes: "Hover lighting uses useMotionTemplate to avoid DOM updates. Tab index is 0." }}>
              <div className="grid md:grid-cols-2 gap-8">
                <GigCard title="Full Stack Developer" company="Stealth AI" location="Remote" compensation="$1,200" duration="3 weeks" tags={["React", "AI"]} href="#" isFeatured />
                <InternshipCard role="Product Design Intern" company="Linear" location="SF" type="In-person" stipend="$4,000/mo" tags={["Figma", "UX"]} href="#" isUrgent />
              </div>
            </DesignNode>
          </section>

          <section id="buttons" className="scroll-mt-32">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Buttons</h2>
            </div>
            <QualityGate checks={ALL_PASSED} componentName="Button" />
            <DesignNode metadata={{ name: "Buttons", tokens: ["--color-primary", "--color-primary-foreground"], typography: "DM Sans, Semibold", motionPreset: "HoverMagnetic, tap scale 0.98", borderRadius: "9999px (full)", elevation: "None", colors: "Primary, Secondary, Destructive", spacing: "Px 4, Py 2", accessibilityNotes: "Focus visible enabled, keyboard enter/space support." }}>
              <Card className="p-8 flex flex-wrap gap-8 items-center justify-center">
                <Button size="lg">Primary</Button>
                <Button variant="secondary" size="lg">Secondary</Button>
                <Button variant="outline" size="lg">Outline</Button>
                <Button variant="ghost" size="lg">Ghost</Button>
              </Card>
            </DesignNode>
          </section>

          <section id="dashboard-widgets" className="scroll-mt-32">
            <div className="mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Dashboard Widgets</h2>
            </div>
            <QualityGate checks={IN_PROGRESS} componentName="Widgets" />
            <DesignNode metadata={{ name: "MetricCard", tokens: ["--color-surface"], typography: "DM Sans", motionPreset: "Hover scale up 1.02", borderRadius: "16px", elevation: "Shadow Card", colors: "Text, Muted", spacing: "P 6", accessibilityNotes: "Aria labels on trend arrows." }}>
              <div className="grid md:grid-cols-2 gap-6">
                <MetricCard title="Profile Views" value="1,024" trend={{ value: 12.5, label: "vs last month", isPositive: true }} />
                <Card className="p-6">
                  <ActivityFeed items={[
                    { id: 1, title: "Application Viewed", description: "Linear viewed your app.", timestamp: "2h ago", isDone: true }
                  ]} />
                </Card>
              </div>
            </DesignNode>
          </section>

        </div>
      </main>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <DesignInspectorProvider>
      <DesignSystemContent />
    </DesignInspectorProvider>
  )
}
