"use client"

import { X, Plus, Loader2, Check } from"lucide-react"
import { useState, useRef, useEffect } from"react"

import { useProfileField } from"@/hooks/useProfileField"

interface SkillsEditorProps {
 initialSkills: string[]
}

export function SkillsEditor({ initialSkills = [] }: SkillsEditorProps) {
 const [skills, setSkills] = useState<string[]>(initialSkills)
 const [inputValue, setInputValue] = useState("")
 const [isAdding, setIsAdding] = useState(false)
 
 const { save, saving, saved } = useProfileField({ field: 'skills' })
 const inputRef = useRef<HTMLInputElement>(null)

 const handleAddSkill = async (e?: React.FormEvent) => {
 e?.preventDefault()
 const trimmed = inputValue.trim().replace(/,/g, '')
 if (!trimmed) return
 
 if (skills.includes(trimmed)) {
 setInputValue("")
 setIsAdding(false)
 return
 }

 const newSkills = [...skills, trimmed]
 setSkills(newSkills)
 setInputValue("")
 setIsAdding(false)
 
 // Save to DB immediately (CSV format)
 await save(newSkills.join(', '))
 }

 const removeSkill = async (skillToRemove: string) => {
 const newSkills = skills.filter(s => s !== skillToRemove)
 setSkills(newSkills)
 await save(newSkills.join(', '))
 }

 useEffect(() => {
 if (isAdding) inputRef.current?.focus()
 }, [isAdding])

 return (
 <div className="space-y-4 group">
 <div className="flex items-center justify-between">
 <label className="font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
 Technical Skills
 {saving && <Loader2 size={12} className="animate-spin text-foreground" />}
 {saved && <Check size={12} className="text-success" />}
 </label>
 
 <button
 onClick={() => setIsAdding(true)}
 className="p-1 px-2 hover:bg-accent rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all"
 >
 <Plus size={12} strokeWidth={3} /> Add Skill
 </button>
 </div>

 <div className="flex flex-wrap gap-2.5">
 {skills.map((skill) => (
 <div
 key={skill}
 className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border hover:border-primary/50 rounded-xl group/tag transition-all"
 >
 <span className="font-bold text-foreground">{skill}</span>
 <button
 onClick={() => removeSkill(skill)}
 className="p-0.5 hover:bg-red-500/10 hover:text-red-400 text-muted-foreground rounded-md transition-all"
 >
 <X size={12} />
 </button>
 </div>
 ))}
 
 {isAdding && (
 <form onSubmit={handleAddSkill} className="inline-block">
 <input
 ref={inputRef}
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onBlur={() => !inputValue && setIsAdding(false)}
 onKeyDown={(e) => e.key === 'Escape' && setIsAdding(false)}
 className="bg-accent border border-primary/50 rounded-xl px-3 py-1.5 text-foreground focus:outline-none w-30 placeholder:text-muted-foreground"
 placeholder="Type & Enter..."
 />
 </form>
 )}

 {skills.length === 0 && !isAdding && (
 <div 
 onClick={() => setIsAdding(true)}
 className="w-full py-6 border border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-accent cursor-pointer transition-all"
 >
 <Plus size={20} className="opacity-50" />
 <p className="text-xs font-bold uppercase tracking-widest">Add your first skill</p>
 </div>
 )}
 </div>
 </div>
 )
}
