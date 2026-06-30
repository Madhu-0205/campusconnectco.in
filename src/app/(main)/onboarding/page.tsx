"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  GraduationCap, Sparkles, User, Link2, ArrowLeft, ArrowRight, 
  CheckCircle2, ShieldCheck, Mail, Github, Linkedin, Globe, 
  Loader2, Search, ChevronDown, Award, Compass
} from "lucide-react"
import { toast } from "sonner"
import SkillSelector from "@/components/SkillSelector"
import { Skill, SKILLS_DATASET } from "@/lib/skills-dataset"
import { VerificationBadge } from "@/components/ui/VerificationBadge"
import { ReferralTracker } from "@/components/growth/ReferralTracker"

// ── Indian colleges list ─────────────────────────────────────────────────────
const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT Patna",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad", "BITS Pilani (Pilani Campus)",
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Allahabad",
  "VIT Vellore", "VIT Chennai", "VIT Bhopal", "VIT-AP",
  "SRM Institute of Science and Technology", "Manipal Institute of Technology",
  "PSG College of Technology", "Amrita School of Engineering",
  "Jadavpur University", "Anna University", "Osmania University",
  "Delhi Technological University", "NSUT Delhi", "IGDTUW",
  "PES University", "RV College of Engineering", "BMS College of Engineering",
  "SASTRA University", "Vellore Institute of Technology", "Sri Sivasubramaniya Nadar College",
  "Karpagam Academy of Higher Education", "Kumaraguru College of Technology",
  "Thiagarajar College of Engineering", "Coimbatore Institute of Technology",
  "Birla Institute of Technology Mesra", "Thapar Institute of Engineering",
  "Chandigarh University", "LPU (Lovely Professional University)",
  "KIIT University", "Kalinga Institute of Industrial Technology",
  "Other College / University",
]

// ── Searchable College Dropdown ──────────────────────────────────────────────
function CollegeDropdown({
  value, onChange
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COLLEGES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOut)
    return () => document.removeEventListener("mousedown", handleOut)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="w-full bg-(--surface-2) border border-(--border) text-left p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all flex items-center justify-between"
      >
        <span className={value ? "text-white font-medium" : "text-slate-600"}>
          {value || "Select your college…"}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#131929] border border-(--border) rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 flex items-center gap-2 px-3">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search college…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none py-2 text-sm"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-center text-sm text-slate-500">No colleges found</li>
              ) : filtered.map(college => (
                <li key={college}>
                  <button
                    type="button"
                    onClick={() => { onChange(college); setOpen(false); setSearch("") }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-violet-600/20 hover:text-white ${value === college ? "bg-violet-600/20 text-white font-bold" : "text-slate-400"}`}
                  >
                    {college}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Form parameters
  const [form, setForm] = useState({
    name: "",
    college: "",
    branch: "",
    year: "1st",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
    careerGoal: "",
  })

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])

  // AI Resume parsing state
  const [fileUrl, setFileUrl] = useState("")
  const [parseStatus, setParseStatus] = useState<'idle' | 'processing' | 'done'>('idle')

  // Load existing profile parameters
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) throw new Error("Unauthorized")
        const data = await res.json()

        // If client, startup, or founder role, redirect away
        const role = String(data.role).toUpperCase()
        if (role === "CLIENT" || role === "STARTUP" || role === "FOUNDER") {
          router.replace(role === "FOUNDER" ? "/dashboard/founder" : "/client-hub")
          return
        }

        // Set email-based auto verification state
        setIsVerified(!!data.isVerified)

        setForm({
          name: data.full_name || data.name || "",
          college: data.college || "",
          branch: data.branch || "",
          year: data.year || "1st",
          bio: data.bio || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
          portfolio: data.portfolio || "",
          careerGoal: data.careerGoal || "",
        })

        // Prepopulate skills if present
        if (data.skills && Array.isArray(data.skills)) {
          const matchedSkills = SKILLS_DATASET.filter(s => data.skills.includes(s.name))
          setSelectedSkills(matchedSkills)
        }
      } catch (err) {
        console.error("Failed to load profile", err)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [router])

  // Real-time Profile Completeness Calculation
  const completionScore = () => {
    let score = 0
    if (form.name.trim().length >= 2) score += 15
    if (form.college.trim()) score += 15
    if (form.branch.trim()) score += 10
    if (form.year) score += 10
    if (selectedSkills.length >= 3) score += 20
    if (form.bio.trim().length > 10) score += 15
    if (form.github.trim() || form.linkedin.trim() || form.portfolio.trim()) score += 15
    return Math.min(100, score)
  }

  // Handle AI Resume Auto-Fill
  const handleAIParse = async () => {
    if (!fileUrl) return
    setParseStatus('processing')
    try {
      const res = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Poll for job completion
      const jobId = data.jobId
      let polling = true
      while (polling) {
        await new Promise(r => setTimeout(r, 2000))
        const pollRes = await fetch(`/api/ai/parse-resume?jobId=${jobId}`)
        const pollData = await pollRes.json()
        
        if (pollData.status === 'completed') {
          const result = pollData.result
          
          // Map skills strings to dataset object models
          let matched: Skill[] = []
          if (result.skills && Array.isArray(result.skills)) {
            matched = SKILLS_DATASET.filter(s => 
              result.skills.some((skName: string) => skName.toLowerCase().includes(s.name.toLowerCase()))
            )
          }

          setForm(prev => ({
            ...prev,
            bio: result.summary || prev.bio,
            careerGoal: result.experienceLevel ? `Junior Developer (${result.experienceLevel})` : prev.careerGoal
          }))

          if (matched.length > 0) {
            setSelectedSkills(prev => {
              const unique = new Map([...prev, ...matched].map(s => [s.id, s]))
              return Array.from(unique.values())
            })
          }

          setParseStatus('done')
          polling = false
          toast.success("AI successfully imported your resume credentials!")
        } else if (pollData.status === 'failed') {
          throw new Error(pollData.error || 'Failed to process resume')
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to process resume PDF")
      setParseStatus('idle')
    }
  }

  // Complete and submit onboarding details
  const handleComplete = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        skills: selectedSkills.map(s => s.name)
      }
      
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save credentials")
      
      toast.success("Onboarding completed successfully!")
      router.replace("/dashboard/student")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile")
      setSubmitting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500 mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Assembling onboarding workshop...</p>
      </div>
    )
  }

  const currentScore = completionScore()

  return (
    <div className="min-h-screen bg-background text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <ReferralTracker />
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">
        
        {/* ── LEFT PANEL: Live Profile Card Preview ───────────────────────── */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-(--surface)/60 border border-(--border) rounded-4xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Compass className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Live profile simulator</span>
            </div>

            {/* Profile Card Render */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-black text-2xl shadow-lg shadow-violet-600/20">
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-white leading-tight">{form.name || "Student Name"}</h3>
                    <VerificationBadge isVerified={isVerified} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{form.college || "Select College"}</p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Course details</span>
                <p className="text-xs text-slate-300 font-semibold">{form.branch || "Branch/Course"} · {form.year} Year</p>
              </div>

              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Key Competencies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.slice(0, 4).map(skill => (
                      <span 
                        key={skill.id} 
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          background: `${skill.color}15`,
                          borderColor: `${skill.color}35`,
                          color: skill.color
                        }}
                      >
                        {skill.name}
                      </span>
                    ))}
                    {selectedSkills.length > 4 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/8 text-slate-400">
                        +{selectedSkills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {form.bio && (
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Biography</span>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed italic">&quot;{form.bio}&quot;</p>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <div className={`p-1.5 rounded-lg border text-xs transition-colors ${form.github ? "border-white/20 text-white" : "border-white/5 text-slate-600"}`}>
                  <Github size={14} />
                </div>
                <div className={`p-1.5 rounded-lg border text-xs transition-colors ${form.linkedin ? "border-white/20 text-white" : "border-white/5 text-slate-600"}`}>
                  <Linkedin size={14} />
                </div>
                <div className={`p-1.5 rounded-lg border text-xs transition-colors ${form.portfolio ? "border-white/20 text-white" : "border-white/5 text-slate-600"}`}>
                  <Globe size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Completeness Bar */}
          <div className="mt-8 border-t border-white/5 pt-5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Completeness score</span>
              <span className={`font-black uppercase tracking-wider font-mono ${currentScore === 100 ? "text-emerald-400" : "text-violet-400"}`}>
                {currentScore}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 bg-linear-to-r from-violet-600 to-cyan-500`}
                style={{ width: `${currentScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Steps Form Wizard ──────────────────────────────── */}
        <div className="lg:col-span-8 bg-(--surface) border border-(--border) rounded-4xl p-8 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Top Wizard Steps Tracker */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 font-mono">Step {step} of 4</span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {step === 1 && "Academic Identity"}
                  {step === 2 && "Core Capabilities"}
                  {step === 3 && "AI Resume Integration"}
                  {step === 4 && "Social Credibility"}
                </h2>
              </div>
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(idx => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? "w-6 bg-violet-500" : idx < step ? "w-2 bg-emerald-500" : "w-2 bg-white/10"}`} 
                  />
                ))}
              </div>
            </div>

            {/* Active steps renders */}
            <div className="min-h-[340px] flex flex-col justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  
                  {/* Step 1: Academic Identity */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <p className="text-sm text-slate-400 font-medium">Verify your enrollment details so startups and clients can find you based on college filters.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Legal Student Name</label>
                          <input 
                            placeholder="e.g. Sathwik Sharma"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Current College/University</label>
                          <CollegeDropdown value={form.college} onChange={val => setForm({ ...form, college: val })} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Degree/Major</label>
                            <input 
                              placeholder="e.g. Computer Science"
                              value={form.branch}
                              onChange={e => setForm({ ...form, branch: e.target.value })}
                              className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                            />
                          </div>

                          <div>
                            <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Current Study Year</label>
                            <select
                              value={form.year}
                              onChange={e => setForm({ ...form, year: e.target.value })}
                              className="w-full bg-(--surface-2) border border-(--border) text-white p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                            >
                              {["1st", "2nd", "3rd", "4th", "Alumni"].map(y => (
                                <option key={y} value={y} className="bg-slate-900">{y} Year</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Core Skills */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <p className="text-sm text-slate-400 font-medium">Select at least 3 core technical capabilities. Startups matching skills via AI SmartMatch will prioritize profiles with verified tags.</p>
                      
                      <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                        <SkillSelector 
                          value={selectedSkills}
                          onChange={setSelectedSkills}
                          placeholder="Type or select skills (e.g. React, Figma, Python)..."
                          maxSelections={8}
                        />
                      </div>
                      
                      {selectedSkills.length > 0 && selectedSkills.length < 3 && (
                        <p className="text-xs text-amber-500 font-bold">Please select {3 - selectedSkills.length} more skill(s) to unlock the next step.</p>
                      )}
                    </div>
                  )}

                  {/* Step 3: AI Resume Auto-Fill */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <p className="text-sm text-slate-400 font-medium">Upload a public link to your resume PDF. The AI parser will automatically index your career level, extract achievements, and pre-populate your bio.</p>
                      
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="https://example.com/resume.pdf" 
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          className="flex-1 bg-(--surface-2) border border-(--border) rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={handleAIParse}
                          disabled={parseStatus === 'processing' || !fileUrl}
                          className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-xl shrink-0 font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          {parseStatus === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
                          {parseStatus === 'processing' ? 'Parsing...' : 'Fill with AI'}
                        </button>
                      </div>

                      {parseStatus === 'processing' && (
                        <div className="p-4 border border-violet-500/20 rounded-xl bg-violet-600/5 animate-pulse text-center">
                          <p className="text-violet-400 text-xs font-bold">✨ AI Sourcing Copilot is analyzing your resume PDF...</p>
                        </div>
                      )}

                      <div>
                        <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Extracted / Written Biography</label>
                        <textarea 
                          placeholder="Describe your capabilities. Highlighting your past projects and working style increases hiring rates."
                          value={form.bio}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                          className="w-full bg-(--surface-2) border border-(--border) rounded-xl p-3.5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Social Credibility */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <p className="text-sm text-slate-400 font-medium">Link your professional accounts. Connecting verified GitHub profiles ensures transparency for tech recruiters.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Career Objective</label>
                          <input 
                            placeholder="e.g. Frontend developer looking for remote React internships"
                            value={form.careerGoal}
                            onChange={e => setForm({ ...form, careerGoal: e.target.value })}
                            className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">GitHub URL</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-[14px] text-slate-600"><Github size={16} /></span>
                              <input 
                                placeholder="https://github.com/yourusername"
                                value={form.github}
                                onChange={e => setForm({ ...form, github: e.target.value })}
                                className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 pl-10 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">LinkedIn URL</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-[14px] text-slate-600"><Linkedin size={16} /></span>
                              <input 
                                placeholder="https://linkedin.com/in/yourusername"
                                value={form.linkedin}
                                onChange={e => setForm({ ...form, linkedin: e.target.value })}
                                className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 pl-10 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-black text-muted-foreground uppercase tracking-widest text-xs mb-2">Personal Portfolio URL</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-[14px] text-slate-600"><Globe size={16} /></span>
                            <input 
                              placeholder="https://yourportfolio.com"
                              value={form.portfolio}
                              onChange={e => setForm({ ...form, portfolio: e.target.value })}
                              className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 pl-10 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 outline-none transition-all font-medium text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-6 gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                disabled={step === 1 && (!form.name.trim() || !form.college.trim()) || step === 2 && selectedSkills.length < 3}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-900 rounded-xl font-black text-sm transition-all"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {submitting ? "Saving Brand..." : "Launch Dashboard"}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
