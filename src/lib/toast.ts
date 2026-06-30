import { toast } from 'react-hot-toast'

const style = {
  success: { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(16,185,129,0.4)' },
  error:   { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(244,63,94,0.4)' },
  info:    { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(124,58,237,0.4)' },
  warning: { background: '#1A2240', color: '#F8FAFC', border: '1px solid rgba(245,158,11,0.4)' },
}

export const notify = {
  success: (msg: string) => toast.success(msg, { duration: 3000, style: style.success }),
  error:   (msg: string) => toast.error(msg,   { duration: 5000, style: style.error }),
  info:    (msg: string) => toast(msg,          { duration: 4000, style: style.info, icon: 'ℹ' }),
  warning: (msg: string) => toast(msg,          { duration: 4000, style: style.warning, icon: '⚠' }),
  loading: (msg: string) => toast.loading(msg,  { style: style.info }),
  promise: <T>(promise: Promise<T>, msgs: { loading: string, success: string, error: string }) =>
    toast.promise(promise, msgs, { style: style.info })
}
