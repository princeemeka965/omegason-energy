import { useState } from 'react'
import RichTextEditor from './RichTextEditor'
import { useAdmin } from '../../lib/adminContext'
import { formatWhen } from '../../lib/adminStore'
import { sanitizeHtml } from '../../lib/sanitize'

const MIN_LENGTH = 10
const MAX_LENGTH = 4000

function textLength(html) {
  if (typeof document === 'undefined') return String(html || '').replace(/<[^>]*>/g, '').trim().length
  const tpl = document.createElement('template')
  tpl.innerHTML = html || ''
  return tpl.content.textContent.replace(/\s+/g, ' ').trim().length
}

// Replies sent before the editor existed are plain text.
function SentReply({ reply }) {
  if (/^\s*</.test(reply)) {
    return <div className="rich-copy mt-2 text-sm text-ink" dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply) }} />
  }
  return <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{reply}</p>
}

export default function QuoteReplyForm({ quote, placeholder }) {
  const { replyToQuote } = useAdmin()
  const [reply, setReply] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [note, setNote] = useState(null)
  const [sending, setSending] = useState(false)

  return (
    <>
      {quote.reply && (
        <div className="mt-4 border border-line bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Reply sent {formatWhen(quote.repliedAt)}</p>
          <SentReply reply={quote.reply} />
        </div>
      )}
      <form
        className="mt-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const clean = sanitizeHtml(reply)
          const length = textLength(clean)
          if (length < MIN_LENGTH) {
            setNote({ sent: false, text: `Write at least ${MIN_LENGTH} characters before sending.` })
            return
          }
          if (length > MAX_LENGTH) {
            setNote({ sent: false, text: `Keep the reply under ${MAX_LENGTH} characters.` })
            return
          }
          setSending(true)
          setNote(null)
          try {
            const result = await replyToQuote(quote.id, clean)
            setReply('')
            setEditorKey((key) => key + 1)
            setNote(result.emailed
              ? { sent: true, text: `Sent to ${quote.email}.` }
              : { sent: false, text: result.emailError || 'The reply is saved. The email did not go out.' })
          } catch (err) {
            setNote({ sent: false, text: err.message })
          } finally {
            setSending(false)
          }
        }}
      >
        <p className="text-sm font-semibold text-navy">{quote.reply ? 'Send another reply' : 'Reply'}</p>
        <RichTextEditor
          key={editorKey}
          label={quote.reply ? 'Send another reply' : 'Reply'}
          placeholder={placeholder}
          value={reply}
          onChange={setReply}
        />
        {note?.sent && <p className="mt-3 text-sm text-navy">{note.text}</p>}
        {note && !note.sent && (
          <p role="alert" className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-900">{note.text}</p>
        )}
        <button type="submit" className="btn btn-primary mt-3" disabled={sending} aria-busy={sending}>
          {sending ? 'Sending…' : 'Send reply'}
        </button>
      </form>
    </>
  )
}
