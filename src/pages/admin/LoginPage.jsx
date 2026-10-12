import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import Seo from '../../components/Seo'
import { useAdmin } from '../../lib/adminContext'

export default function LoginPage() {
  const { pendingOtp, requestOtp, verifyOtp, clearOtp } = useAdmin()
  const [step, setStep] = useState(pendingOtp ? 'otp' : 'credentials')
  const [email, setEmail] = useState(pendingOtp?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef([])
  const attempted = useRef('')

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (step !== 'otp' || code.length !== 6 || code === attempted.current) return undefined
    attempted.current = code
    let cancelled = false
    setPending('check')
    verifyOtp(code)
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setCode('')
        attempted.current = ''
        inputs.current[0]?.focus()
      })
      .finally(() => {
        if (!cancelled) setPending('')
      })
    return () => {
      cancelled = true
    }
  }, [code, step, verifyOtp])

  async function onCredentials(event) {
    event.preventDefault()
    setError('')
    setPending('send')
    try {
      const next = await requestOtp({ email, password })
      setEmail(next.email)
      setCode('')
      attempted.current = ''
      setStep('otp')
      setCooldown(15)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending('')
    }
  }

  async function resend() {
    setError('')
    if (password.length < 8) {
      setStep('credentials')
      setError('Enter your password again to issue a new code.')
      return
    }
    setPending('send')
    try {
      await requestOtp({ email, password })
      setCode('')
      attempted.current = ''
      setCooldown(15)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending('')
    }
  }

  function setDigit(index, raw) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const chars = Array.from({ length: 6 }, (_, i) => code[i] || '')
    chars[index] = digit
    setCode(chars.join('').replace(/\s/g, ''))
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  function onDigitKey(index, event) {
    if (event.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus()
  }

  function onPaste(event) {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    event.preventDefault()
    setCode(text)
    inputs.current[Math.min(text.length, 5)]?.focus()
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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Step {step === 'credentials' ? '1' : '2'} of 2</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
            {step === 'credentials' ? 'Admin sign in' : 'Enter the code'}
          </h2>

          {step === 'credentials' ? (
            <form onSubmit={onCredentials} className="mt-8 space-y-5">
              <p className="text-sm leading-relaxed text-muted">
                Enter the email and password for this account. A code is emailed only after both are correct.
              </p>
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
              <button type="submit" className="btn btn-primary w-full" disabled={pending !== ''} aria-busy={pending === 'send'}>
                {pending === 'send' ? 'Sending code…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form
              className="mt-8"
              onSubmit={(event) => {
                event.preventDefault()
                setError('')
                if (pending || code.length !== 6) return
                setPending('check')
                verifyOtp(code)
                  .catch((err) => {
                    setError(err.message)
                    setCode('')
                    attempted.current = ''
                  })
                  .finally(() => setPending(''))
              }}
            >
              <p className="text-sm leading-relaxed text-muted">
                Enter the 6-digit code sent to <span className="font-semibold text-navy">{email}</span>.
              </p>
              <div className="mt-6 flex justify-between gap-2" onPaste={onPaste}>
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(node) => { inputs.current[index] = node }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${index + 1}`}
                    value={code[index] || ''}
                    disabled={pending !== ''}
                    onChange={(event) => setDigit(index, event.target.value)}
                    onKeyDown={(event) => onDigitKey(index, event)}
                    className="field mt-0 h-14 w-12 px-0 text-center font-mono text-xl"
                  />
                ))}
              </div>
              {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
              <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending !== '' || code.length !== 6} aria-busy={pending === 'check'}>
                {pending === 'check' ? 'Checking…' : 'Verify and enter'}
              </button>
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="font-semibold text-navy disabled:opacity-40"
                  disabled={pending !== '' || cooldown > 0}
                  onClick={resend}
                >
                  {pending === 'send' ? 'Sending…' : cooldown > 0 ? `New code in ${cooldown}s` : 'Issue a new code'}
                </button>
                <button
                  type="button"
                  className="font-semibold text-muted disabled:opacity-40"
                  disabled={pending !== ''}
                  onClick={() => {
                    clearOtp()
                    setStep('credentials')
                    setCode('')
                    setError('')
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
