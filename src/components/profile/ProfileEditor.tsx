"use client"

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User, Briefcase, GraduationCap, Link2, 
   
   
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MapPin, Calendar, Github, Linkedin, Globe,
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShieldCheck, ArrowLeft, MoreHorizontal, Sparkles
, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { CollegeDropdown } from "@/components/ui/CollegeDropdown"
import { LocationMap } from "@/components/ui/LocationMap"
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
    collegeId?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
    latitude?: number | null
    longitude?: number | null
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

  const [locationState, setLocationState] = useState({
    city: profile.city,
    state: profile.state,
    country: profile.country,
    latitude: profile.latitude,
    longitude: profile.longitude,
  })
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(profile.collegeId || null)

  const handleSaveLocation = async () => {
    setIsSavingLocation(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: locationState.city,
          state: locationState.state,
          country: locationState.country,
          latitude: locationState.latitude,
          longitude: locationState.longitude,
        })
      })
      if (!res.ok) throw new Error("Failed to save location")
      toast.success("Location updated successfully")
      setIsEditingLocation(false)
    } catch (error) {
      toast.error("Failed to update location")
    } finally {
      setIsSavingLocation(false)
    }
  }

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-[11px] font-black uppercase tracking-widest mb-6">
            <User size={14} /> Profile Workshop v2.0
          </div>
          <h1 className="md:text-5xl font-black text-foreground tracking-tight leading-tight mb-2">
            Build Your <span className="text-primary">Professional Brand</span>
          </h1>
          <p className="text-lg max-w-xl font-medium">
            Fine-tune how startups see you. Every update is saved in real-time.
          </p>
        </div>
        
        <div className="flex bg-surface-2 border border-border rounded-2xl p-1 gap-1 flex-wrap md:flex-nowrap">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all ${ activeSection === id ? "bg-background text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent" }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ── LEFT: AVATAR & QUICK STATS ────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface border border-border rounded-5xl p-10 flex flex-col items-center text-center shadow-card relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <AvatarUpload initialImage={profile.image} userId={profile.id} />
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <h2 className="font-black text-foreground">{profile.name || "Set your Name"}</h2>
                  <VerificationBadge isVerified={!!profile.isVerified} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{profile.email}</p>
                {profile.username && <p className="text-xs font-bold">@{profile.username}</p>}
                {(locationState.city || locationState.state) && (
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-1 bg-surface-2 border border-border px-2.5 py-1 rounded-full">
                    <MapPin size={12} />
                    {locationState.city}{locationState.city && locationState.state ? ", " : ""}{locationState.state}
                  </div>
                )}
                {profile.college && (
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-1 bg-surface-2 border border-border px-2.5 py-1 rounded-full text-center">
                    <GraduationCap size={12} className="shrink-0" />
                    <span className="line-clamp-1">{profile.college}</span>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-border" />

              <div className="w-full space-y-4">
                <div className="bg-surface-2 border border-border rounded-2xl p-4 text-left">
                  <p className="font-black text-muted-foreground uppercase tracking-widest mb-1">Reputation Score</p>
                  <p className="font-black text-foreground flex items-center justify-between">
                    100 <span className="bg-success/10 text-success border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest">Master</span>
                  </p>
                </div>
                
                <div className="bg-surface-2 border border-border rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-muted-foreground uppercase tracking-widest">Profile Completion</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${completionPercentage === 100 ? 'text-success' : 'text-foreground'}`}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-2 border border-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  {completionPercentage < 100 && (
                    <p className="font-medium mt-3 italic text-center text-muted-foreground text-sm">
                      Complete your profile to boost visibility & match rate!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
               <ShieldCheck className="text-primary" size={20} />
               <h3 className="font-black uppercase text-xs tracking-widest text-foreground">Public Visibility</h3>
             </div>
             <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
               Your profile is currently <span className="text-success font-bold">active</span> and visible to verified Indian startups.
             </p>
             {profile.username ? (
               <a href={`/profile/${profile.username}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-surface hover:bg-surface-2 border border-border rounded-xl font-black text-foreground text-center uppercase tracking-widest transition-all">
                 View Public Preview
               </a>
             ) : (
               <p className="font-bold text-center text-foreground">Set a unique username to enable public URL</p>
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
                        Location
                      </label>
                      {!isEditingLocation ? (
                        <button
                          onClick={() => setIsEditingLocation(true)}
                          className="px-3 py-1.5 bg-surface-2 border border-border hover:bg-accent rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 text-foreground"
                        >
                          Change Location
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditingLocation(false)}
                            className="px-3 py-1.5 hover:text-foreground text-xs font-bold transition-all text-muted-foreground"
                            disabled={isSavingLocation}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveLocation}
                            disabled={isSavingLocation}
                            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-black transition-all flex items-center gap-1.5"
                          >
                            {isSavingLocation ? <Loader2 size={12} className="animate-spin" /> : null}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingLocation ? (
                      <div className="bg-surface-2 border border-border p-4 rounded-2xl">
                        <LocationMap 
                          initialLat={locationState.latitude || undefined}
                          initialLng={locationState.longitude || undefined}
                          onLocationSelect={(loc) => {
                            setLocationState(prev => ({
                              ...prev,
                              city: loc.city,
                              state: loc.state,
                              country: loc.country,
                              latitude: loc.latitude,
                              longitude: loc.longitude,
                            }))
                          }}
                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Detected City</label>
                            <input 
                              disabled 
                              value={locationState.city || ""} 
                              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">Detected State</label>
                            <input 
                              disabled 
                              value={locationState.state || ""} 
                              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setIsEditingLocation(true)}
                        className="w-full bg-surface-2 border border-border hover:border-primary/50 hover:bg-accent rounded-xl px-4 py-3 transition-all cursor-pointer flex items-center"
                      >
                        <p className={`text-sm ${!(locationState.city || locationState.state) ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                          {locationState.city || locationState.state 
                            ? `${locationState.city ? locationState.city + ', ' : ''}${locationState.state || ''}`
                            : "No location added yet."}
                        </p>
                      </div>
                    )}
                  </div>
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
                    extraData={{ collegeId: selectedCollegeId }}
                    renderInput={(value, setValue) => (
                      <CollegeDropdown
                        value={value}
                        onChange={setValue}
                        onCollegeId={setSelectedCollegeId}
                        city={locationState.city || ""}
                        state={locationState.state || ""}
                      />
                    )}
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
               <div className="bg-surface border border-border rounded-4xl p-8 md:p-12 shadow-card">
                 <SkillsEditor initialSkills={profile.skills} />
               </div>
               
               <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1 tracking-tight">AI Matching Pro-Tip</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium">
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
