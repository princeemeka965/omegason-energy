import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, X } from 'lucide-react'
import { addQuote } from '../lib/adminStore'
import { formatPrice } from '../lib/api'
import { nigerianStates } from '../data/states'
import { site } from '../data/site'

export default function QuoteModal({ product, onClose }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [status, setStatus] = useState('idle')
  const [sentEmail, setSentEmail] = useState('')
  const subject = `Quote request: ${product.name}`
  const price = formatPrice(product.price)

  onCloseRef.current = onClose

  useEffect(() => {
    const root = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root?.querySelector('input[name="name"]')?.focus()

    function focusable() {
      if (!root) return []
      return [...root.querySelectorAll('a, button, input, textarea, select')].filter(
        (el) => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null,
      )
    }

    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [])

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    const data = new FormData(event.currentTarget)
    const fields = Object.fromEntries(data)
    if (fields['bot-field']) return
    try {
      await addQuote({
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        state: fields.state,
        subject,
        message: fields.message,
        productSlug: product.slug,
        productName: product.name,
      })
    } catch {
      setStatus('error')
      return
    }
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'contact', ...fields, subject, product: product.slug }).toString(),
      })
      if (!res.ok) throw new Error('Request failed')
    } catch {
      // The quote is already stored. The Netlify copy is the email path on the deployed site.
    }
    setSentEmail(fields.email)
    setStatus('sent')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex bg-white md:items-center md:justify-center md:bg-navy/50 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-dvh w-full flex-col bg-white md:h-auto md:max-h-[min(40rem,calc(100dvh-3rem))] md:max-w-xl md:border md:border-line"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Request a quote</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-semibold text-navy">{product.name}</h2>
            {price && <p className="mt-1 font-semibold text-navy">{price}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center text-navy">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] md:px-8">
            <CheckCircle2 className="text-brass" size={36} aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl font-semibold text-navy">Quote request sent</h3>
            <p className="mt-2 max-w-md text-muted">Thank you. Our team will contact you soon by email at <span className="font-semibold text-navy">{sentEmail}</span>. For anything urgent, call {site.mobile}.</p>
            <button type="button" onClick={onClose} className="btn btn-primary mt-6 w-fit">Close</button>
          </div>
        ) : (
          <form name="contact" method="POST" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-8">
            <p className="text-sm text-muted">Required fields are marked.</p>
            <input type="hidden" name="form-name" value="contact" />
            <input type="hidden" name="product" value={product.slug} />
            <p className="hidden"><label>Do not fill this in: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-navy">Name *
                <input required name="name" autoComplete="name" className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">Email *
                <input required type="email" name="email" autoComplete="email" className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">Phone *
                <input required type="tel" name="phone" autoComplete="tel" inputMode="tel" className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">State *
                <select required name="state" defaultValue="" className="field">
                  <option value="" disabled>Select a state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
            </div>
            <input type="hidden" name="subject" value={subject} />
            <label className="mt-5 block text-sm font-semibold text-navy">Subject
              <input disabled value={subject} className="field" />
            </label>
            <label className="mt-5 block text-sm font-semibold text-navy">Message *
              <textarea required name="message" rows={6} className="field" defaultValue={`I would like a quote for ${product.name}.`} />
            </label>
            {status === 'error' && (
              <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                The request did not send. Check your connection and try again, or call {site.mobile}.
              </p>
            )}
            <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="btn btn-primary mt-6 w-fit">
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
