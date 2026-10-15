import { WifiOff } from 'lucide-react'

export default function OfflineNote({ show, className = '' }) {
  if (!show) return null
  return (
    <p role="status" className={`flex items-center gap-2 border border-line bg-paper px-4 py-3 text-sm text-muted ${className}`}>
      <WifiOff size={16} aria-hidden="true" className="shrink-0 text-brass" />
      You are offline. This is the last saved copy, and it will update when the connection is back.
    </p>
  )
}
