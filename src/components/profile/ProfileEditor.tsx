"use client"

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User, Briefcase, GraduationCap, Link2, 
   
   
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MapPin, Calendar, Github, Linkedin, Globe,
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShieldCheck, ArrowLeft, MoreHorizontal, Sparkles
} from "lucide-react"
import { useState } from "react"

import { VerificationBadge } from "@/components/ui/VerificationBadge"

import { AvatarUpload } from "./AvatarUpload"
import { EditableField } from "./EditableField"
import { SkillsEditor } from "./SkillsEditor"

interface ProfileEditorProps {
  profile: {
    id: string
    name: string | null
    username: string | null
    email: string
    bio: string | null
    skills: string[]
    college: string | null
    branch: string | null
    year: string | null
    github: string | null
    linkedin: string | null
    portfolio: string | null
    image: string | null
    careerGoal: string | null
    isVerified?: boolean
  }
}

export default function ProfileEditor({ profile }: ProfileEditorProps) {
  // Use a local state for navigation or other UI purely for the editor container
  const [activeSection, setActiveSection] = useState("general")

  const sections = [
    { id: "general", label: "Basic Info", icon: User },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "links", label: "Connect", icon: Link2 },
    { id: "skills", label: "Capabilities", icon: Sparkles },
  ]

  // Calculate profile completion
  const completionFields = [
    profile.name, profile.username, profile.bio, profile.college,
    profile.branch, profile.year, profile.careerGoal, profile.image,
    (profile.skills && profile.skills.length > 0) ? 'skills' : null,
    (profile.github || profile.linkedin || profile.portfolio) ? 'link' : null
  ];
  
  const filledFields = completionFields.filter(Boolean).length;
  const completionPercentage = Math.round((filledFields / completionFields.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-in fade-in duration-700">
      
      {/* ── HEADER NAVIGATION ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest mb-6">
            <User size={14} /> Profile Workshop v2.0
          </div>
          <h1 className="md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
            Build Your <span className="text-transparent bg-linear-to-r from-indigo-500 to-emerald-400">Professional Brand</span>
          </h1>
          <p className="text-lg max-w-xl font-medium">
            Fine-tune how startups see you. Every update is saved in real-time.
          </p>
        </div>
        
        <div className="flex bg-[#111116] border border-white/10 rounded-2xl p-1 gap-1 flex-wrap md:flex-nowrap">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all ${ activeSection === id ? "bg-indigo-600/10 text-indigo-400 border" : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent" }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ── LEFT: AVATAR & QUICK STATS ────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#111116] border border-white/8 rounded-5xl p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <AvatarUpload initialImage={profile.image} userId={profile.id} />
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <h2 className="font-black text-white">{profile.name || "Set your Name"}</h2>
                  <VerificationBadge isVerified={!!profile.isVerified} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{profile.email}</p>
                {profile.username && <p className="text-xs font-bold">@{profile.username}</p>}
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="w-full space-y-4">
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
                  <p className="font-black text-slate-500 uppercase tracking-widest mb-1">Reputation Score</p>
                  <p className="font-black text-white flex items-center justify-between">
                    100 <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest">Master</span>
                  </p>
                </div>
                
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-slate-500 uppercase tracking-widest">Profile Completion</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${completionPercentage === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  {completionPercentage < 100 && (
                    <p className="font-medium mt-3 italic text-center">
                      Complete your profile to boost visibility & match rate!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#131929] border border-[#7C3AED]/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
               <ShieldCheck className="text-[#A78BFA]" size={20} />
               <h3 className="font-black uppercase text-xs tracking-widest">Public Visibility</h3>
             </div>
             <p className="text-slate-400 leading-relaxed mb-6 font-medium">
               Your profile is currently <span className="text-emerald-400 font-bold">active</span> and visible to verified Indian startups.
             </p>
             {profile.username ? (
               <a href={`/profile/${profile.username}`} target="_blank" className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-white uppercase tracking-widest transition-all">
                 View Public Preview
               </a>
             ) : (
               <p className="font-bold text-center">Set a unique username to enable public URL</p>
             )}
          </div>
        </div>

        {/* ── RIGHT: FIELD EDITORS ───────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Section: General */}
          {activeSection === "general" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableField
                      label="Full Legal Name"
                      field="name"
                      initialValue={profile.name || ""}
                      placeholder="e.g. Rahul Sharma"
                    />
                    
                    <EditableField
                      label="Unique Username"
                      field="username"
                      initialValue={profile.username || ""}
                      placeholder="e.g. rahulsharma99"
                    />
                  </div>
                  
                  <EditableField
                    label="Bio / Professional Tagline"
                    field="bio"
                    initialValue={profile.bio || ""}
                    type="textarea"
                    placeholder="Tell your story. What makes you different?"
                  />

                  <EditableField
                    label="Primary Career Goal"
                    field="careerGoal"
                    initialValue={profile.careerGoal || ""}
                    placeholder="e.g. Backend Developer at a high-growth SaaS"
                  />
               </div>
            </div>
          )}

          {/* Section: Education */}
          {activeSection === "education" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                  <EditableField
                    label="University / College"
                    field="college"
                    initialValue={profile.college || ""}
                    placeholder="e.g. IIT Delhi, BITS Pilani..."
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableField
                      label="Degree / Branch"
                      field="branch"
                      initialValue={profile.branch || ""}
                      placeholder="e.g. Computer Science"
                    />
                    
                    <EditableField
                      label="Current Year"
                      field="year"
                      type="select"
                      initialValue={profile.year || ""}
                      options={['1st', '2nd', '3rd', '4th', 'Alumni']}
                    />
                  </div>
               </div>
            </div>
          )}

          {/* Section: Links */}
          {activeSection === "links" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                  <EditableField
                    label="Personal Portfolio"
                    field="portfolio"
                    initialValue={profile.portfolio || ""}
                    placeholder="https://yourname.com"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableField
                      label="GitHub Handle"
                      field="github"
                      initialValue={profile.github || ""}
                      placeholder="https://github.com/..."
                    />
                    
                    <EditableField
                      label="LinkedIn Profile"
                      field="linkedin"
                      initialValue={profile.linkedin || ""}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
               </div>
            </div>
          )}

          {/* Section: Skills */}
          {activeSection === "skills" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="bg-[#111116] border border-white/5 rounded-4xl p-8 md:p-12 shadow-2xl">
                 <SkillsEditor initialSkills={profile.skills} />
               </div>
               
               <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-300 mb-1 tracking-tight">AI Matching Pro-Tip</h4>
                    <p className="text-indigo-300/60 leading-relaxed font-medium">
                      Profiles with at least 5 verified technical skills get 12x higher priority in the &quot;CampusConnect SmartMatch&quot; algorithm for top-tier internships.
                    </p>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
