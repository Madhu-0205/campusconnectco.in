import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface UseProfileFieldOptions {
  userId?: string
  field: string
  onSuccess?: (value: unknown) => void
}

export function useProfileField({ field, onSuccess }: UseProfileFieldOptions) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async (value: unknown, extraData?: Record<string, any>) => {
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      const res = await fetch("/api/user/profile", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ [field]: value, ...(extraData || {}) }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update API")
      }

      setSaving(false)
      setSaved(true)
      onSuccess?.(value)

      // Show success toast
      toast.success(`${getFieldLabel(field)} saved!`, {
        duration: 3000,
        icon: '✓',
        style: { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(16,185,129,0.4)' }
      })

      // Reset "saved" indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000)
      return true
    } catch (err: unknown) {
      setSaving(false)
      const errorMsg = (err as Error).message || "Failed to update"
      setError(errorMsg)
      toast.error(`Failed to save ${getFieldLabel(field)} — ${errorMsg}`, {
        duration: 5000,
        icon: '✗',
        style: { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(244,63,94,0.4)' }
      })
      return false
    }
  }, [field, onSuccess])

  return { save, saving, saved, error }
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'Name', bio: 'Bio', college: 'College', branch: 'Branch',
    year: 'Year', careerGoal: 'Career goal', linkedin: 'LinkedIn',
    github: 'GitHub', portfolio: 'Portfolio', skills: 'Skills',
    status: 'Availability', image: 'Profile photo'
  }
  return labels[field] ?? field
}
