import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Inbox, LogOut, Menu, Package, Settings, Tags, X } from 'lucide-react'
import Logo from '../Logo'
import Seo from '../Seo'
import { useAdmin } from '../../lib/adminContext'

const links = [
  { to: '/auth/admin/products', label: 'Products', icon: Package },
  { to: '/auth/admin/categories', label: 'Categories', icon: Tags },
  { to: '/auth/admin/quotes', label: 'Quotes', icon: Inbox },
  { to: '/auth/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminShell({ children }) {
  const { session, logoutAdmin, unreadQuotes, settings } = useAdmin()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const apply = () => setDesktop(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16.5rem_1fr]">
      <Seo title="Admin" description="Omegason catalogue admin." path="/auth/admin" noindex />
      {open && <button type="button" className="fixed inset-0 z-30 bg-navy/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside
        inert={!desktop && !open ? true : undefined}
        className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-transform lg:static lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <NavLink to="/" className="text-white" onClick={() => setOpen(false)}>
            <Logo />
          </NavLink>
          <button type="button" className="rounded-md p-1 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <p className="px-5 pt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brass-soft">Admin</p>
        <nav className="mt-3 flex-1 px-3" aria-label="Admin">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                        isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} aria-hidden="true" />
                    {link.label}
                    {link.to.endsWith('/quotes') && unreadQuotes > 0 && (
                      <span className="ml-auto bg-brass px-1.5 py-0.5 text-xs text-white">{unreadQuotes}</span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm text-white/80">{session?.email}</p>
          <p className="mt-1 text-xs text-white/55">
            {settings.quotesEmail ? `Quotes go to ${settings.quotesEmail}` : 'Set a quotes inbox under Settings'}
          </p>
          <button
            type="button"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true)
              try {
                await logoutAdmin()
              } finally {
                setSigningOut(false)
              }
            }}
            className="btn btn-outline-light mt-4 w-full"
          >
            <LogOut size={16} aria-hidden="true" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <button type="button" className="rounded-md p-2 text-navy" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <p className="font-display text-lg font-semibold text-navy">Admin</p>
          <span className="w-10" />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  )
}
