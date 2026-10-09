export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src="/media/omegason.png" alt="" className="h-11 w-11 object-contain" />
      <span className="font-display text-xl font-semibold tracking-tight">Omegason</span>
    </span>
  )
}
