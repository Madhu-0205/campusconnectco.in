import { useState, useCallback } from 'react'

import { notify } from '@/lib/toast'

export function useOptimisticMutation<T>(
  mutationFn: (data: T) => Promise<void>,
  options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
    successMessage?: string
    errorMessage?: string
  }
) {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    success: boolean
  }>({ loading: false, error: null, success: false })

  const mutate = useCallback(async (data: T, currentValue?: unknown, setValue?: (v: unknown) => void, optimisticValue?: unknown) => {
    // Apply optimistic update immediately
    if (setValue && optimisticValue !== undefined) setValue(optimisticValue)

    setState({ loading: true, error: null, success: false })

    try {
      await mutationFn(data)
      setState({ loading: false, error: null, success: true })
      options?.onSuccess?.()
      if (options?.successMessage) notify.success(options.successMessage)
      setTimeout(() => setState(s => ({ ...s, success: false })), 3000)
    } catch (error: unknown) {
      const errObj = error as Error;
      // Rollback optimistic update on error
      if (setValue && currentValue !== undefined) setValue(currentValue)
      setState({ loading: false, error: errObj.message, success: false })
      options?.onError?.(errObj)
      notify.error(options?.errorMessage ?? errObj.message ?? 'Something went wrong')
    }
  }, [mutationFn, options])

  return { mutate, ...state }
}
