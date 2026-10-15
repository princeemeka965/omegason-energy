import { useEffect, useMemo, useState } from 'react'
import Pager from '../../components/admin/Pager'
import QuoteReplyForm from '../../components/admin/QuoteReplyForm'
import { useAdmin } from '../../lib/adminContext'
import { formatWhen, isSizingQuote } from '../../lib/adminStore'

const PAGE_SIZE = 8

export default function SizingQuotesPage() {
  const { quotes: allQuotes, markQuoteRead, deleteQuote } = useAdmin()
  const quotes = useMemo(() => allQuotes.filter((quote) => isSizingQuote(quote)), [allQuotes])
  const unreadQuotes = quotes.filter((quote) => !quote.read).length
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)
  const [removingId, setRemovingId] = useState('')

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return quotes.filter((quote) => {
      if (filter === 'unread' && quote.read) return false
      if (!q) return true
      return `${quote.name} ${quote.email} ${quote.phone || ''} ${quote.state || ''} ${quote.subject} ${quote.message} ${quote.reply || ''}`.toLowerCase().includes(q)
    })
  }, [quotes, filter, query])

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function toggle(quote) {
    const next = openId === quote.id ? null : quote.id
    setOpenId(next)
    setError('')
    if (next && !quote.read) {
      markQuoteRead(quote.id).catch((err) => setError(err.message))
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Inbox</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Solar sizing</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Requests from the header calculator. A reply is emailed to the address on the request.
      </p>
      {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="group" aria-label="Filter solar sizing requests">
          <Filter pressed={filter === 'all'} onClick={() => setFilter('all')}>All ({quotes.length})</Filter>
          <Filter pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Unread ({unreadQuotes})</Filter>
        </div>
        <label className="block sm:w-72">
          <span className="sr-only">Search solar sizing requests</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" className="field mt-0" />
        </label>
      </div>

      <div className="mt-4 overflow-hidden border border-line bg-white">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-muted">
            {quotes.length === 0 ? 'No solar sizing requests yet. They appear here when someone uses Request a quote in the header.' : 'No requests match that filter.'}
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
                    {quote.repliedAt && <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-brass">Replied</span>}
                  </button>
                  {open && (
                    <div className="border-t border-line bg-paper px-4 py-4 sm:pl-9">
                      <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted">From</dt>
                          <dd className="font-semibold text-navy">{quote.email}</dd>
                        </div>
                        {quote.phone && (
                          <div>
                            <dt className="text-muted">Phone</dt>
                            <dd className="font-semibold text-navy">{quote.phone}</dd>
                          </div>
                        )}
                        {quote.state && (
                          <div>
                            <dt className="text-muted">State</dt>
                            <dd className="font-semibold text-navy">{quote.state}</dd>
                          </div>
                        )}
                      </dl>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{quote.message}</p>
                      <QuoteReplyForm key={quote.id} quote={quote} placeholder="Write what this house should install." />
                      <button
                        type="button"
                        className="mt-4 text-sm font-semibold text-red-800 disabled:cursor-wait disabled:opacity-60"
                        disabled={removingId === quote.id}
                        aria-busy={removingId === quote.id}
                        onClick={async () => {
                          setRemovingId(quote.id)
                          try {
                            await deleteQuote(quote.id)
                            setOpenId(null)
                          } catch (err) {
                            setError(err.message)
                          } finally {
                            setRemovingId('')
                          }
                        }}
                      >
                        {removingId === quote.id ? 'Removing…' : 'Remove request'}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <Pager page={safePage} pages={pageCount} label="Solar sizing pages" onPage={setPage} />
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
