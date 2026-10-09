import { Sun, Zap, BatteryCharging, FlaskConical, Compass, GraduationCap, Store, Wrench } from 'lucide-react'

const map = { Sun, Zap, BatteryCharging, FlaskConical, Compass, GraduationCap, Store, Wrench }

export default function Icon({ name, className = '', ...rest }) {
  const C = map[name] || Sun
  return <C className={className} aria-hidden="true" {...rest} />
}
