"use client"

import { useState } from "react"
import { useProfileField } from "@/hooks/useProfileField"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, Edit2, Loader2, X } from "lucide-react"

interface EditableFieldProps {
  label: string
  field: string
  initialValue: string
  placeholder?: string
  type?: "text" | "textarea" | "select"
  options?: string[]
}

export function EditableField({
  label,
  field,
  initialValue,
  placeholder,
  type = "text",
  options
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const { save, saving, saved } = useProfileField({ field })

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false)
      return
    }
    const success = await save(value)
    if (success) setIsEditing(false)
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
  }

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </label>
        
        {!isEditing && !saving && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 px-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500/10 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
        
        {saving && (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase animate-pulse">
            <Loader2 size={12} className="animate-spin" /> Saving
          </span>
        )}

        {saved && !saving && (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase">
            <Check size={12} /> Saved
          </span>
        )}
      </div>

      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            {type === "textarea" ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-[#111116] border border-white/10 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 transition-all text-sm leading-relaxed"
                autoFocus
              />
            ) : type === "select" ? (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-[#111116] border border-white/10 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 transition-all text-sm"
                autoFocus
              >
                <option value="">Select {label}</option>
                {options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#111116] border border-white/10 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 transition-all text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') handleCancel()
                }}
              />
            )}
            
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="p-2 px-3 hover:text-white text-xs font-bold transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="w-full bg-white/2 border border-transparent hover:border-white/5 hover:bg-white/4 rounded-xl px-4 py-3 transition-all cursor-pointer min-h-[46px] flex items-center"
          >
            <p className={`text-sm ${!value ? 'text-slate-600 italic' : 'text-slate-200'}`}>
              {value || `No ${label.toLowerCase()} added yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
