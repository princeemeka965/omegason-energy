import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAdmin } from '../../lib/adminContext'
import { isEmail } from '../../lib/adminStore'

export default function SettingsPage() {
  const { account, settings, requestAccountChange, confirmAccountChange, cancelAccountChange } = useAdmin()
  const [email, setEmail] = useState(account.email || '')
  const [quotesEmail, setQuotesEmail] = useState(settings.quotesEmail || '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [pending, setPending] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [closing, setClosing] = useState(false)
  const inputs = useRef([])
  const attempted = useRef('')
  const submitting = useRef(false)

  useEffect(() => {
    setEmail(account.email || '')
  }, [account.email])

  useEffect(() => {
    setQuotesEmail(settings.quotesEmail || '')
  }, [settings.quotesEmail])

  useEffect(() => {
    if (!pending) return undefined
    inputs.current[0]?.focus()
    return undefined
  }, [pending])

  async function onRequest(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!isEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (quotesEmail.trim() && !isEmail(quotesEmail)) {
      setError('Enter a valid email address for quote requests.')
      return
    }
    if (password || passwordConfirm) {
      if (password.length < 8) {
        setError('Use a password of at least 8 characters.')
        return
      }
      if (password !== passwordConfirm) {
        setError('The new passwords do not match.')
        return
      }
    }
    const payload = { email, quotesEmail, password, passwordConfirm }
    setSending(true)
    try {
      const result = await requestAccountChange(payload)
      setPending({ ...result, payload })
      setCode('')
      setModalError('')
      attempted.current = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function onVerify(nextCode) {
    if (submitting.current) return
    submitting.current = true
    setModalError('')
    setChecking(true)
    try {
      await confirmAccountChange(nextCode)
      setPending(null)
      setCode('')
      setPassword('')
      setPasswordConfirm('')
      setNotice('Changes saved.')
    } catch (err) {
      setModalError(err.message)
      setCode('')
      attempted.current = ''
      inputs.current[0]?.focus()
    } finally {
      submitting.current = false
      setChecking(false)
    }
  }

  useEffect(() => {
    if (!pending || code.length !== 6 || code === attempted.current || checking) return undefined
    attempted.current = code
    onVerify(code)
    return undefined
  }, [code, pending])

  function setDigit(index, raw) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const chars = Array.from({ length: 6 }, (_, i) => code[i] || '')
    chars[index] = digit
    setCode(chars.join(''))
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  async function cancel() {
    setModalError('')
    setClosing(true)
    try {
      await cancelAccountChange()
      setPending(null)
      setCode('')
    } catch (err) {
      setModalError(err.message)
    } finally {
      setClosing(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Account</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Sign-in email, password, and the quotes inbox stay as they are until you enter a code. The code is emailed to the address already on the account.
      </p>

      <form onSubmit={onRequest} className="mt-8 max-w-xl space-y-8">
        <section className="border border-line bg-white p-5">
          <h2 className="font-semibold text-navy">Email address</h2>
          <label className="mt-4 block text-sm font-semibold text-navy">
            Sign-in email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              className="field"
              disabled={sending}
            />
          </label>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="font-semibold text-navy">Quotes inbox</h2>
          <p className="mt-1 text-sm text-muted">Quote requests from the contact form are addressed to this address. Leave it blank to stop addressing new requests.</p>
          <label className="mt-4 block text-sm font-semibold text-navy">
            Email address
            <input
              type="email"
              value={quotesEmail}
              onChange={(event) => setQuotesEmail(event.target.value)}
              placeholder="quotes@omegasonenergy.com"
              autoComplete="email"
              className="field"
              disabled={sending}
            />
          </label>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="font-semibold text-navy">Change password</h2>
          <p className="mt-1 text-sm text-muted">Leave these blank to keep the current password.</p>
          <label className="mt-4 block text-sm font-semibold text-navy">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="field"
              disabled={sending}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-navy">
            Confirm new password
            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
              className="field"
              disabled={sending}
            />
          </label>
        </section>

        {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
        {notice && <p className="text-sm text-navy">{notice}</p>}
        <button type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending}>
          {sending ? 'Sending code…' : 'Save changes'}
        </button>
      </form>

      {pending && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 px-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-title"
            className="w-full max-w-md border border-line bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (code.length === 6) onVerify(code)
            }}
          >
            <h2 id="otp-title" className="font-display text-2xl font-semibold text-navy">Enter the code</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The code was sent to <span className="font-semibold text-navy">{pending.sentTo}</span>.
              {email.trim().toLowerCase() !== pending.sentTo && ' The new email address is not used until this code is accepted.'}
            </p>
            {pending.devCode && (
              <div className="mt-5 border border-brass/40 bg-paper px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <ShieldCheck size={16} className="text-brass" aria-hidden="true" /> Development code
                </p>
                <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-navy">{pending.devCode}</p>
              </div>
            )}
            <div
              className="mt-6 flex justify-between gap-2"
              onPaste={(event) => {
                const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                if (!text) return
                event.preventDefault()
                setCode(text)
                inputs.current[Math.min(text.length, 5)]?.focus()
              }}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <input
                  key={index}
                  ref={(node) => { inputs.current[index] = node }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${index + 1}`}
                  value={code[index] || ''}
                  disabled={checking}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus()
                  }}
                  className="field mt-0 h-14 w-12 px-0 text-center font-mono text-xl"
                />
              ))}
            </div>
            {modalError && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{modalError}</p>}
            {checking && <p className="mt-4 text-sm text-muted">Checking the code…</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={checking || closing || code.length !== 6} aria-busy={checking}>
                {checking ? 'Checking…' : 'Confirm'}
              </button>
              <button type="button" className="btn btn-outline" disabled={checking || closing} aria-busy={closing} onClick={cancel}>
                {closing ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
