import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { useAdmin } from '../../lib/adminContext'
import { sanitizeHtml } from '../../lib/sanitize'
import { isEmptyHtml, plainText } from '../../lib/text'

const empty = { name: '', headline: '', lead: '' }

export default function PhasesPage() {
  const { phases, createPhase, deletePhase, movePhase } = useAdmin()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [rowError, setRowError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState('')
  const [editorKey, setEditorKey] = useState(0)

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function runMove(id, direction) {
    setRowError(null)
    setWorking(id)
    try {
      await movePhase(id, direction)
    } catch (err) {
      setRowError({ id, message: err.message })
    } finally {
      setWorking('')
    }
  }

  async function onCreate(event) {
    event.preventDefault()
    setError('')
    if (isEmptyHtml(form.lead)) {
      setError('Enter the introduction shown on the projects page.')
      return
    }
    if (plainText(form.lead).length > 600) {
      setError('Keep the introduction to 600 characters.')
      return
    }
    setWorking('create')
    try {
      const phase = await createPhase({ ...form, lead: sanitizeHtml(form.lead), published: true })
      setForm(empty)
      setEditorKey((key) => key + 1)
      navigate(`/auth/admin/phases/${phase.id}`)
    } catch (err) {
      setError(err.message)
      setWorking('')
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Projects</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Phases</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Each phase is a set of project notes. The home page uses the earliest phase that has featured stories. A phase appears on the site once it is published and has at least one story.
      </p>

      <form onSubmit={onCreate} className="mt-8 space-y-4 border border-line bg-white p-5">
        <label className="block text-sm font-semibold text-navy">
          Phase name *
          <input value={form.name} onChange={(event) => setField('name', event.target.value)} maxLength={80} placeholder="Phase Two" className="field" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Home page heading *
          <input value={form.headline} onChange={(event) => setField('headline', event.target.value)} maxLength={160} placeholder="What changed when the power stayed on" className="field" required />
        </label>
        <div>
          <p className="text-sm font-semibold text-navy">Projects page introduction *</p>
          <RichTextEditor key={editorKey} compact label="Projects page introduction" placeholder="What this phase covers…" value={form.lead} onChange={(value) => setField('lead', value)} />
          <span className="mt-1 block text-sm font-normal text-muted">{plainText(form.lead).length}/600</span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={working === 'create'} aria-busy={working === 'create'}>
          {working === 'create' ? 'Adding…' : 'Add phase'}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}

      <ul className="mt-6 divide-y divide-line border border-line bg-white">
        {phases.length === 0 && (
          <li className="px-5 py-10 text-center text-muted">No phases yet. Add one to publish project notes.</li>
        )}
        {phases.map((phase, index) => {
          const featured = phase.stories.filter((story) => story.featured).length
          return (
            <li key={phase.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-navy">{phase.name}</h2>
                  <p className="text-sm text-muted">
                    {phase.stories.length} {phase.stories.length === 1 ? 'story' : 'stories'}
                    {featured > 0 ? ` · ${featured} on the home page` : ''}
                    {phase.published ? '' : ' · hidden'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline !px-2 !py-2" aria-label={`Move ${phase.name} up`} disabled={index === 0 || working === phase.id} onClick={() => runMove(phase.id, 'up')}>
                    <ChevronUp size={16} aria-hidden="true" />
                  </button>
                  <button type="button" className="btn btn-outline !px-2 !py-2" aria-label={`Move ${phase.name} down`} disabled={index === phases.length - 1 || working === phase.id} onClick={() => runMove(phase.id, 'down')}>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  <Link to={`/auth/admin/phases/${phase.id}`} className="btn btn-outline !px-3 !py-2">Edit</Link>
                  {pendingDelete === phase.id ? (
                    <>
                      <span className="self-center text-sm text-muted">Delete this phase and its stories?</span>
                      <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => setPendingDelete(null)}>Cancel</button>
                      <button
                        type="button"
                        className="bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                        disabled={working === `delete:${phase.id}`}
                        aria-busy={working === `delete:${phase.id}`}
                        onClick={async () => {
                          setRowError(null)
                          setWorking(`delete:${phase.id}`)
                          try {
                            await deletePhase(phase.id)
                            setPendingDelete(null)
                          } catch (err) {
                            setRowError({ id: phase.id, message: err.message })
                            setPendingDelete(null)
                          } finally {
                            setWorking('')
                          }
                        }}
                      >
                        {working === `delete:${phase.id}` ? 'Deleting…' : 'Delete'}
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => { setPendingDelete(phase.id); setRowError(null) }}>Delete</button>
                  )}
                </div>
              </div>
              {rowError?.id === phase.id && <p role="alert" className="mt-3 text-sm text-red-800">{rowError.message}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
