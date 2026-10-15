import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import Seo from '../../components/Seo'
import { useAdmin } from '../../lib/adminContext'

export default function LoginPage() {
  const { signIn } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      await signIn({ email, password })
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Seo title="Admin sign in" description="Sign in to the Omegason catalogue admin." path="/auth/admin" noindex />
      <section className="hidden flex-col justify-between bg-navy px-12 py-12 text-white lg:flex">
        <Link to="/" className="text-white"><Logo /></Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass-soft">Catalogue admin</p>
          <h1 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight">
            Add solar products, organise categories, and collect quote requests.
          </h1>
        </div>
        <p className="text-sm text-white/70">Head office · 180 Agbani Road, Enugu</p>
      </section>

      <section className="flex items-center bg-paper px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="text-navy"><Logo /></Link>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Admin</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy">Sign in</h2>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <p className="text-sm leading-relaxed text-muted">Enter the email and password for this account.</p>
            <label className="block text-sm font-semibold text-navy">
              Email
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field"
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Password
              <span className="relative mt-1 block">
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field mt-0 pr-16"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={pending} aria-busy={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
