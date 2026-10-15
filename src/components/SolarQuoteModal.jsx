import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CheckCircle2, ChevronDown, X } from 'lucide-react'
import { addQuote } from '../lib/adminStore'
import { nigerianStates } from '../data/states'
import { site } from '../data/site'
import { sizeSolar, solarHomes, solarHours, solarLoads } from '../lib/solarSize'

function ApplianceMultiSelect({ selectedIds, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const chosen = solarLoads.filter((load) => selectedIds.includes(load.id))

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id])
  }

  return (
    <div ref={rootRef} className="sm:col-span-2">
      <label className="block text-sm font-semibold text-navy">Home appliances
        <button
          type="button"
          className="field flex items-center justify-between gap-3 text-left font-normal"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={`min-w-0 flex-1 ${chosen.length ? 'text-ink' : 'text-muted'}`}>
            {chosen.length ? chosen.map((load) => load.label).join(', ') : 'Select appliances'}
          </span>
          <ChevronDown size={18} aria-hidden="true" className="shrink-0" />
        </button>
      </label>
      {open && (
        <ul id={listId} role="listbox" aria-multiselectable="true" className="mt-1 max-h-60 overflow-y-auto border border-line bg-white">
          {solarLoads.map((load) => {
            const on = selectedIds.includes(load.id)
            return (
              <li key={load.id} role="option" aria-selected={on}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-navy ${on ? 'bg-paper' : ''}`}
                  onClick={() => toggle(load.id)}
                >
                  <span className={`grid h-4 w-4 shrink-0 place-items-center border ${on ? 'border-navy bg-navy text-white' : 'border-line bg-white'}`}>
                    {on && <Check size={12} aria-hidden="true" />}
                  </span>
                  {load.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function SolarQuoteModal({ onClose }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [status, setStatus] = useState('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [stateName, setStateName] = useState('')
  const [formError, setFormError] = useState('')
  const [homeId, setHomeId] = useState('')
  const [customHome, setCustomHome] = useState('')
  const [hoursId, setHoursId] = useState('8')
  const [customHours, setCustomHours] = useState('')
  const [loadIds, setLoadIds] = useState([])

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
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      setFormError('Enter a phone number with 10 to 15 digits.')
      return
    }
    setFormError('')
    const next = sizeSolar({ homeId, hoursId, customHome, customHours, loadIds })
    if (!next) return
    setStatus('sending')
    const chosen = solarLoads.filter((load) => loadIds.includes(load.id))
    const message = [
      `Home: ${next.homeLabel}`,
      `Run time: ${next.runLabel}`,
      `Appliances: ${chosen.length ? chosen.map((load) => load.label).join(', ') : 'Lights, fans and television only'}`,
    ].join('\n')
    try {
      await addQuote({
        name,
        email,
        phone,
        state: stateName,
        subject: `Solar sizing: ${next.homeLabel}`,
        message,
        productSlug: '',
        productName: 'Home solar sizing',
        kind: 'sizing',
      })
      setStatus('sent')
    } catch {
      setStatus('idle')
    }
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
        className="flex h-dvh w-full flex-col bg-white md:h-auto md:max-h-[min(46rem,calc(100dvh-3rem))] md:max-w-2xl md:border md:border-line"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Request a quote</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-semibold text-navy">What this house needs</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center text-navy">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] md:px-8">
            <CheckCircle2 className="text-brass" size={36} aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl font-semibold text-navy">Quote request sent</h3>
            <p className="mt-2 max-w-md text-muted">Thank you. Our team will contact you soon by email at <span className="font-semibold text-navy">{email}</span>. For anything urgent, call {site.mobile}.</p>
            <button type="button" onClick={onClose} className="btn btn-primary mt-6 w-fit">Close</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-8">
            <p className="text-sm leading-relaxed text-muted">
              Tell us the house and what should stay on. Submit the quote and our team will reply.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-navy">Name *
                <input required name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">Email *
                <input required type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">Phone *
                <input required type="tel" name="phone" autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="field" />
              </label>
              <label className="block text-sm font-semibold text-navy">State *
                <select required name="state" value={stateName} onChange={(event) => setStateName(event.target.value)} className="field">
                  <option value="" disabled>Select a state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <div>
                <label className="block text-sm font-semibold text-navy">The house *
                  <select required value={homeId} onChange={(event) => setHomeId(event.target.value)} className="field">
                    <option value="" disabled>Select the home</option>
                    {solarHomes.map((home) => (
                      <option key={home.id} value={home.id}>{home.label}</option>
                    ))}
                    <option value="other">Something else</option>
                  </select>
                </label>
                {homeId === 'other' && (
                  <label className="mt-3 block text-sm font-semibold text-navy">Describe it *
                    <input
                      required
                      name="home"
                      maxLength={80}
                      value={customHome}
                      onChange={(event) => setCustomHome(event.target.value)}
                      placeholder="5 bedroom bungalow"
                      className="field"
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy">How long it should run *
                  <select required value={hoursId} onChange={(event) => setHoursId(event.target.value)} className="field">
                    {solarHours.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                    <option value="other">A different length</option>
                  </select>
                </label>
                {hoursId === 'other' && (
                  <label className="mt-3 block text-sm font-semibold text-navy">Hours *
                    <input
                      required
                      type="number"
                      name="hours"
                      min="1"
                      max="24"
                      step="0.5"
                      inputMode="decimal"
                      value={customHours}
                      onChange={(event) => setCustomHours(event.target.value)}
                      placeholder="6"
                      className="field"
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="mt-5">
              <ApplianceMultiSelect selectedIds={loadIds} onChange={setLoadIds} />
            </div>
            {formError && <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-900">{formError}</p>}
            <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="btn btn-primary mt-6">
              {status === 'sending' ? 'Submitting…' : 'Submit Quote'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
