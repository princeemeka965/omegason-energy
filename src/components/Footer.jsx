import { Link } from 'react-router-dom'
import Logo from './Logo'
import { offices, site } from '../data/site'

export default function Footer() {
  const socials = Object.entries(site.social).filter(([, url]) => url)
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <Logo className="text-white" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
            Omegason Integrated Energy Services Ltd welcomes you to a future where clean, reliable, and affordable energy drives communities and businesses forward.
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-4 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} className="capitalize text-white/75 underline-offset-4 hover:text-white hover:underline" target="_blank" rel="noreferrer">{name}</a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-soft">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {[['/about', 'About'], ['/services', 'Services'], ['/products', 'Products'], ['/projects', 'Projects'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link className="hover:text-white" to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-soft">Offices</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            {offices.map((o) => (
              <li key={o.label}>
                <span className="text-white">{o.label}.</span> {o.address}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brass-soft">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>Phone: <a className="text-white hover:underline" href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>
            <li>Mobile: <a className="text-white hover:underline" href={`tel:${site.mobile.replace(/\s/g, '')}`}>{site.mobile}</a></li>
            <li>Fax: {site.fax}</li>
            {site.email && <li><a className="hover:underline" href={`mailto:${site.email}`}>{site.email}</a></li>}
          </ul>
          <Link to="/contact" className="btn btn-light mt-6">Contact us</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/55">
        © {new Date().getFullYear()} {site.name} Ltd. All rights reserved.
      </div>
    </footer>
  )
}
