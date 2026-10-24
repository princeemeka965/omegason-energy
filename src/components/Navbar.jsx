import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import SolarQuoteModal from './SolarQuoteModal'
import { site } from '../data/site'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/leadership', label: 'Leadership' },
  { to: '/services', label: 'Services' },
  { to: '/products', label: 'Products' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    setQuoteOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
    {open && <div className="h-16 md:h-26 lg:hidden" aria-hidden="true" />}
    <header className={`${open ? 'max-lg:fixed max-lg:inset-x-0 lg:sticky' : 'sticky'} top-0 z-50 border-b border-line bg-white`}>
      <div className="hidden border-b border-white/10 bg-navy text-sm text-white/85 md:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6 md:px-10">
          <p>Head office · 180 Agbani Road, Enugu</p>
          <p className="flex gap-5">
            <a className="hover:text-white" href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
            <a className="hover:text-white" href={`tel:${site.mobile.replace(/\s/g, '')}`}>{site.mobile}</a>
          </p>
        </div>
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10" aria-label="Main">
        <Link to="/" aria-label="Omegason home" className="text-navy"><Logo /></Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `border-b-2 px-2.5 py-5 text-sm font-semibold ${
                    isActive ? 'border-brass text-navy' : 'border-transparent text-muted hover:text-navy'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <button type="button" className="btn btn-primary" onClick={() => setQuoteOpen(true)}>Request a quote</button>
        </div>

        <button
          className="rounded-md p-2 text-navy lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && createPortal(
        <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white shadow-lg md:top-26 md:max-h-[calc(100dvh-6.5rem)] lg:hidden">
          <ul className="flex flex-col px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `block border-l-2 px-3 py-3 text-lg font-semibold ${isActive ? 'border-brass text-navy' : 'border-transparent text-ink'}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="px-3 py-3">
              <button type="button" className="btn btn-primary w-full" onClick={() => { setOpen(false); setQuoteOpen(true) }}>Request a quote</button>
            </li>
          </ul>
        </div>,
        document.body,
      )}
    </header>
    {quoteOpen && <SolarQuoteModal onClose={() => setQuoteOpen(false)} />}
    </>
  )
}
