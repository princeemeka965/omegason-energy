import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound({ message = 'That page could not be found.', backTo = '/', backLabel = 'Back to home' }) {
  return (
    <section className="grid min-h-[60vh] place-items-center bg-paper px-6 text-center">
      <Seo title="Page not found" description={message} noindex />
      <div>
        <p className="font-display text-6xl font-semibold text-navy">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-navy">{message}</h1>
        <Link to={backTo} className="btn btn-primary mt-8">{backLabel}</Link>
      </div>
    </section>
  )
}
