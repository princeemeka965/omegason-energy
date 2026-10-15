import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, ImagePlus } from 'lucide-react'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { useAdmin } from '../../lib/adminContext'
import { uploadImage } from '../../lib/adminStore'
import { sanitizeHtml } from '../../lib/sanitize'
import { isEmptyHtml, plainText, toEditorHtml } from '../../lib/text'

const IMAGE_LIMIT = 8 * 1024 * 1024

const emptyStory = { title: '', summary: '', body: '', image: '', featured: false }

export default function PhaseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { phases, savePhase, deletePhase, saveStory, deleteStory, moveStory } = useAdmin()
  const phase = phases.find((item) => item.id === id)
  const [fields, setFields] = useState(null)
  const [phaseError, setPhaseError] = useState('')
  const [savingPhase, setSavingPhase] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [draft, setDraft] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [storyError, setStoryError] = useState('')
  const [savingStory, setSavingStory] = useState(false)
  const [storyWorking, setStoryWorking] = useState('')
  const [pendingStory, setPendingStory] = useState(null)

  useEffect(() => {
    if (!phase || fields) return
    setFields({
      name: phase.name,
      headline: phase.headline,
      lead: toEditorHtml(phase.lead),
      published: phase.published,
    })
  }, [phase, fields])

  if (!phase) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy">That phase was not found</h1>
        <Link to="/auth/admin/phases" className="btn btn-outline mt-6">Back to phases</Link>
      </div>
    )
  }

  if (!fields) return null

  function setField(key, value) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  async function onSavePhase(event) {
    event.preventDefault()
    setPhaseError('')
    if (isEmptyHtml(fields.lead)) {
      setPhaseError('Enter the introduction shown on the projects page.')
      return
    }
    if (plainText(fields.lead).length > 600) {
      setPhaseError('Keep the introduction to 600 characters.')
      return
    }
    setSavingPhase(true)
    try {
      await savePhase(phase.id, { ...fields, lead: sanitizeHtml(fields.lead) })
    } catch (err) {
      setPhaseError(err.message)
    } finally {
      setSavingPhase(false)
    }
  }

  function openNew() {
    setEditingId(null)
    setDraft({ ...emptyStory })
    setStoryError('')
  }

  function openEdit(story) {
    setEditingId(story.id)
    setDraft({
      title: story.title,
      summary: story.summary,
      body: toEditorHtml(story.body),
      image: story.image || '',
      featured: story.featured,
    })
    setStoryError('')
  }

  async function onSaveStory(event) {
    event.preventDefault()
    setStoryError('')
    if (isEmptyHtml(draft.body)) {
      setStoryError('Write the story.')
      return
    }
    if (plainText(draft.body).length > 8000) {
      setStoryError('Keep the story under 8,000 characters.')
      return
    }
    setSavingStory(true)
    try {
      await saveStory(phase.id, { ...draft, body: sanitizeHtml(draft.body), image: draft.image.trim() || null }, editingId)
      setDraft(null)
      setEditingId(null)
    } catch (err) {
      setStoryError(err.message)
    } finally {
      setSavingStory(false)
    }
  }

  async function runStoryMove(storyId, direction) {
    setStoryWorking(storyId)
    setStoryError('')
    try {
      await moveStory(storyId, direction)
    } catch (err) {
      setStoryError(err.message)
    } finally {
      setStoryWorking('')
    }
  }

  return (
    <div>
      <Link to="/auth/admin/phases" className="text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
        Phases
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-navy">{fields.name || 'Edit phase'}</h1>
        {pendingDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Delete this phase and its stories?</span>
            <button type="button" className="btn btn-outline !px-3 !py-2" disabled={deleting} onClick={() => setPendingDelete(false)}>Cancel</button>
            <button
              type="button"
              className="bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
              disabled={deleting}
              aria-busy={deleting}
              onClick={async () => {
                setDeleting(true)
                try {
                  await deletePhase(phase.id)
                  navigate('/auth/admin/phases')
                } catch (err) {
                  setPhaseError(err.message)
                  setPendingDelete(false)
                  setDeleting(false)
                }
              }}
            >
              {deleting ? 'Deleting…' : 'Delete phase'}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-outline" onClick={() => setPendingDelete(true)}>Delete phase</button>
        )}
      </div>

      <form onSubmit={onSavePhase} className="mt-8 space-y-4 border border-line bg-white p-5 md:p-7">
        <label className="block text-sm font-semibold text-navy">
          Phase name *
          <input required value={fields.name} onChange={(event) => setField('name', event.target.value)} maxLength={80} className="field" />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Home page heading *
          <input required value={fields.headline} onChange={(event) => setField('headline', event.target.value)} maxLength={160} className="field" />
          <span className="mt-1 block font-normal text-muted">The heading on the home page when this phase is the one shown there.</span>
        </label>
        <div>
          <p className="text-sm font-semibold text-navy">Projects page introduction *</p>
          <RichTextEditor compact label="Projects page introduction" placeholder="What this phase covers…" value={fields.lead} onChange={(value) => setField('lead', value)} />
          <span className="mt-1 block text-sm font-normal text-muted">{plainText(fields.lead).length}/600</span>
        </div>
        <label className="flex items-start gap-2 text-sm text-navy">
          <input type="checkbox" className="mt-0.5" checked={fields.published} onChange={(event) => setField('published', event.target.checked)} />
          <span>
            <span className="font-semibold">Show on the website</span>
            <span className="mt-1 block text-muted">A hidden phase stays in the admin. It needs at least one story before it appears on the site.</span>
          </span>
        </label>
        <button type="submit" className="btn btn-primary" disabled={savingPhase} aria-busy={savingPhase}>
          {savingPhase ? 'Saving…' : 'Save phase'}
        </button>
        {phaseError && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{phaseError}</p>}
      </form>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">Stories</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Featured stories from the earliest phase appear on the home page, up to three.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew}>Add a story</button>
        </div>

        <ul className="mt-6 divide-y divide-line border border-line bg-white">
          {phase.stories.length === 0 && (
            <li className="px-5 py-10 text-center text-muted">No stories yet. Add the first project note.</li>
          )}
          {phase.stories.map((story, index) => (
            <li key={story.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              {story.image ? (
                <img src={story.image} alt="" className="h-16 w-24 object-cover" />
              ) : (
                <div className="h-16 w-24 bg-paper" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-navy">{story.title}</h3>
                <p className="truncate text-sm text-muted">{story.summary}</p>
                {story.featured && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-brass">Home page</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline !px-2 !py-2" aria-label={`Move ${story.title} up`} disabled={index === 0 || storyWorking === story.id} onClick={() => runStoryMove(story.id, 'up')}>
                  <ChevronUp size={16} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline !px-2 !py-2" aria-label={`Move ${story.title} down`} disabled={index === phase.stories.length - 1 || storyWorking === story.id} onClick={() => runStoryMove(story.id, 'down')}>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => openEdit(story)}>Edit</button>
                {pendingStory === story.id ? (
                  <>
                    <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => setPendingStory(null)}>Cancel</button>
                    <button
                      type="button"
                      className="bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                      disabled={storyWorking === `delete:${story.id}`}
                      aria-busy={storyWorking === `delete:${story.id}`}
                      onClick={async () => {
                        setStoryWorking(`delete:${story.id}`)
                        setStoryError('')
                        try {
                          await deleteStory(story.id)
                          if (editingId === story.id) {
                            setDraft(null)
                            setEditingId(null)
                          }
                          setPendingStory(null)
                        } catch (err) {
                          setStoryError(err.message)
                          setPendingStory(null)
                        } finally {
                          setStoryWorking('')
                        }
                      }}
                    >
                      {storyWorking === `delete:${story.id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => setPendingStory(story.id)}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {storyError && !draft && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{storyError}</p>}

        {draft && (
          <StoryDraft
            key={editingId || 'new'}
            draft={draft}
            setDraft={setDraft}
            editing={Boolean(editingId)}
            saving={savingStory}
            error={storyError}
            onSubmit={onSaveStory}
            onCancel={() => { setDraft(null); setEditingId(null); setStoryError('') }}
          />
        )}
      </section>
    </div>
  )
}

function StoryDraft({ draft, setDraft, editing, saving, error, onSubmit, onCancel }) {
  const formRef = useRef(null)
  const fileRef = useRef(null)
  const [reading, setReading] = useState(false)
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [])

  function setField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function onFile(file) {
    setImageError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setImageError('Choose a JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > IMAGE_LIMIT) {
      setImageError('Use an image under 8 MB.')
      return
    }
    setReading(true)
    try {
      setField('image', await uploadImage(file))
    } catch (err) {
      setImageError(err.message)
    } finally {
      setReading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-6 scroll-mt-24 grid gap-6 border border-line bg-white p-5 md:grid-cols-[minmax(0,1fr)_18rem] md:p-7">
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-navy">{editing ? 'Edit story' : 'New story'}</h3>
        <label className="block text-sm font-semibold text-navy">
          Title *
          <input required value={draft.title} onChange={(event) => setField('title', event.target.value)} maxLength={160} className="field" />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Summary *
          <input required value={draft.summary} onChange={(event) => setField('summary', event.target.value)} maxLength={280} className="field" />
          <span className="mt-1 block font-normal text-muted">One sentence on the home page card. {draft.summary.length}/280</span>
        </label>
        <div>
          <p className="text-sm font-semibold text-navy">Story *</p>
          <RichTextEditor label="Story" placeholder="Write the project note…" value={draft.body} onChange={(value) => setField('body', value)} />
          <span className="mt-1 block text-sm font-normal text-muted">{plainText(draft.body).length}/8000</span>
        </div>
        <label className="flex items-start gap-2 text-sm text-navy">
          <input type="checkbox" className="mt-0.5" checked={draft.featured} onChange={(event) => setField('featured', event.target.checked)} />
          <span>
            <span className="font-semibold">Show on the home page</span>
            <span className="mt-1 block text-muted">Up to three featured stories are used.</span>
          </span>
        </label>
      </div>
      <div>
        <fieldset className="border border-line p-5">
          <legend className="px-1 text-sm font-semibold text-navy">Image</legend>
          {draft.image && (
            <div className="mt-2 aspect-[4/3] overflow-hidden border border-line bg-paper">
              <img src={draft.image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
          <button type="button" className="btn btn-outline mt-3 w-full" disabled={reading || saving} aria-busy={reading} onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} aria-hidden="true" /> {reading ? 'Uploading…' : 'Upload image'}
          </button>
          <label className="mt-4 block text-sm font-semibold text-navy">
            Or image path
            <input value={draft.image.startsWith('data:') ? '' : draft.image} onChange={(event) => setField('image', event.target.value)} placeholder="/media/university.jpg" className="field" />
          </label>
          {draft.image && (
            <button type="button" className="mt-3 text-sm font-semibold text-navy" onClick={() => setField('image', '')}>
              Remove image
            </button>
          )}
          {imageError && <p className="mt-3 text-sm text-red-800">{imageError}</p>}
        </fieldset>
        {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving || reading} aria-busy={saving}>
            {saving ? 'Saving…' : editing ? 'Save story' : 'Add story'}
          </button>
          <button type="button" className="btn btn-outline" disabled={saving} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </form>
  )
}
