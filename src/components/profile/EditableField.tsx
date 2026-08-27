"use client"

import { Check, Edit2, Loader2 } from "lucide-react"
import { useState } from "react"

import { useProfileField } from "@/hooks/useProfileField"
 

interface EditableFieldProps {
  label: string
  field: string
  initialValue: string
  placeholder?: string
  type?: "text" | "textarea" | "select"
  options?: string[]
  renderInput?: (value: string, onChange: (val: string) => void) => React.ReactNode
  extraData?: Record<string, any>
}

export function EditableField({
  label,
  field,
  initialValue,
  placeholder,
  type = "text",
  options,
  renderInput,
  extraData
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const { save, saving, saved } = useProfileField({ field })

  const handleSave = async () => {
    if (value === initialValue && !extraData) {
      setIsEditing(false)
      return
    }
    const success = await save(value, extraData)
    if (success) setIsEditing(false)
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
  }

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <label className="font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </label>
        
        {!isEditing && !saving && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 px-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"
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
                className="w-full bg-background border border-border hover:border-primary/50 focus:border-foreground focus:outline-none rounded-xl px-4 py-3 transition-all text-sm leading-relaxed"
                autoFocus
              />
            ) : type === "select" ? (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-background border border-border hover:border-primary/50 focus:border-foreground focus:outline-none rounded-xl px-4 py-3 transition-all text-sm"
                autoFocus
              >
                <option value="">Select {label}</option>
                {options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : renderInput ? (
              renderInput(value, setValue)
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-background border border-border hover:border-primary/50 focus:border-foreground focus:outline-none rounded-xl px-4 py-3 transition-all text-sm"
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
                className="p-2 px-3 hover:text-foreground text-xs font-bold transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="w-full bg-surface-2 border border-border hover:border-primary/50 hover:bg-accent rounded-xl px-4 py-3 transition-all cursor-pointer min-h-11.5 flex items-center"
          >
            <p className={`text-sm ${!value ? 'text-muted-foreground italic' : 'text-foreground'}`}>
              {value || `No ${label.toLowerCase()} added yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
