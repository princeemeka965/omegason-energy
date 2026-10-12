import { useEffect, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import Pager from '../../components/admin/Pager'
import { useAdmin } from '../../lib/adminContext'
import { formatWhen } from '../../lib/adminStore'

const PAGE_SIZE = 8

export default function QuotesPage() {
  const { quotes, settings, unreadQuotes, saveQuotesEmail, markQuoteRead, deleteQuote } = useAdmin()
  const [email, setEmail] = useState(settings.quotesEmail)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    setEmail(settings.quotesEmail)
  }, [settings.quotesEmail])

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return quotes.filter((quote) => {
      if (filter === 'unread' && quote.read) return false
      if (!q) return true
      return `${quote.name} ${quote.email} ${quote.subject} ${quote.productName} ${quote.message}`.toLowerCase().includes(q)
    })
  }, [quotes, filter, query])

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  async function onSaveEmail(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const saved = await saveQuotesEmail(email)
      setNotice(saved ? `Quote requests are addressed to ${saved}.` : 'Quote requests will wait here until an inbox is set.')
    } catch (err) {
      setError(err.message)
    }
  }

  function toggle(quote) {
    const next = openId === quote.id ? null : quote.id
    setOpenId(next)
    if (next && !quote.read) {
      markQuoteRead(quote.id).catch((err) => setError(err.message))
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Inbox</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Quote requests</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Requests from the contact form are stored here and addressed to the inbox you set. Sending that email waits until a mail service is connected.
      </p>

      <form onSubmit={onSaveEmail} className="mt-8 border border-line bg-white p-5">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 text-brass" size={18} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-navy">Quotes inbox</h2>
            <p className="mt-1 text-sm text-muted">
              {settings.quotesEmail
                ? `New requests are addressed to ${settings.quotesEmail}.`
                : 'Add the address that should receive quote requests.'}
            </p>
            <label className="mt-4 block text-sm font-semibold text-navy">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="quotes@omegasonenergy.com"
                className="field max-w-md"
              />
            </label>
            {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
            {notice && <p className="mt-3 text-sm text-navy">{notice}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary">Save inbox</button>
              {settings.quotesEmail && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={async () => {
                    setError('')
                    try {
                      await saveQuotesEmail('')
                      setEmail('')
                      setNotice('The inbox was cleared. New requests stay in this list.')
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                >
                  Remove inbox
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="group" aria-label="Filter quotes">
          <Filter pressed={filter === 'all'} onClick={() => setFilter('all')}>All ({quotes.length})</Filter>
          <Filter pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Unread ({unreadQuotes})</Filter>
        </div>
        <label className="block sm:w-72">
          <span className="sr-only">Search quote requests</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" className="field mt-0" />
        </label>
      </div>

      <div className="mt-4 overflow-hidden border border-line bg-white">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-muted">
            {quotes.length === 0 ? 'No quote requests yet. They appear here when someone asks for a quote.' : 'No requests match that filter.'}
          </p>
        ) : (
          <ul>
            {rows.map((quote) => {
              const open = openId === quote.id
              return (
                <li key={quote.id} className="border-b border-line last:border-b-0">
                  <button type="button" onClick={() => toggle(quote)} className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-paper" aria-expanded={open}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${quote.read ? 'bg-line' : 'bg-brass'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-navy">{quote.name}</span>
                        <span className="text-xs text-muted">{formatWhen(quote.createdAt)}</span>
                      </span>
                      <span className="mt-1 block truncate text-sm text-muted">{quote.subject}</span>
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-line bg-paper px-4 py-4 sm:pl-9">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted">From</dt>
                          <dd className="font-semibold text-navy">{quote.email}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Addressed to</dt>
                          <dd className="font-semibold text-navy">{quote.destinationEmail || 'Waiting for a quotes inbox'}</dd>
                        </div>
                        {quote.productName && (
                          <div className="sm:col-span-2">
                            <dt className="text-muted">Product</dt>
                            <dd className="font-semibold text-navy">{quote.productName}</dd>
                          </div>
                        )}
                      </dl>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{quote.message}</p>
                      <button
                        type="button"
                        className="mt-4 text-sm font-semibold text-red-800"
                        onClick={async () => {
                          try {
                            await deleteQuote(quote.id)
                            setOpenId(null)
                          } catch (err) {
                            setError(err.message)
                          }
                        }}
                      >
                        Remove request
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <Pager page={safePage} pages={pageCount} label="Quote pages" onPage={setPage} />
      </div>
    </div>
  )
}

function Filter({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`border px-3 py-1.5 text-sm font-semibold ${
        pressed ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-navy'
      }`}
    >
      {children}
    </button>
  )
}
