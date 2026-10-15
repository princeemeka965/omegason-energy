import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { dismissToast, getToasts, subscribeToasts } from '../lib/toast'

export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts)
  if (toasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2 pt-[env(safe-area-inset-top)]">
      {toasts.map((toast) => {
        const error = toast.tone === 'error'
        return (
          <div
            key={toast.id}
            role={error ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 shadow-lg ${
              error ? 'bg-red-700 text-white' : 'bg-green-700 text-white'
            }`}
          >
            <p className="min-w-0 flex-1 text-sm leading-relaxed">{toast.message}</p>
            <button
              type="button"
              className="grid h-7 w-7 shrink-0 place-items-center text-white/80"
              aria-label="Dismiss"
              onClick={() => dismissToast(toast.id)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
