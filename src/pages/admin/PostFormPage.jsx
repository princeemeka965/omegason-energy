import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { useAdmin } from '../../lib/adminContext'
import { slugify, uploadImage } from '../../lib/adminStore'
import { sanitizeArticle } from '../../lib/sanitize'
import { isEmptyHtml } from '../../lib/text'

const IMAGE_LIMIT = 8 * 1024 * 1024

export default function PostFormPage() {
  const { id } = useParams()
  const { getPost } = useAdmin()
  const [state, setState] = useState({ post: null, loading: Boolean(id), error: '' })

  useEffect(() => {
    if (!id) {
      setState({ post: null, loading: false, error: '' })
      return undefined
    }
    let alive = true
    setState({ post: null, loading: true, error: '' })
    getPost(id)
      .then((post) => alive && setState({ post, loading: false, error: '' }))
      .catch((err) => alive && setState({ post: null, loading: false, error: err.status === 404 ? 'missing' : err.message }))
    return () => {
      alive = false
    }
  }, [id, getPost])

  if (state.loading) return <p className="font-semibold text-navy">Loading post…</p>
  if (state.error) {
    return (
      <div className="border border-line bg-white px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-navy">{state.error === 'missing' ? 'Post not found' : 'The post could not be loaded'}</h1>
        {state.error !== 'missing' && <p className="mt-2 text-muted">{state.error}</p>}
        <Link to="/auth/admin/blog" className="btn btn-primary mt-6">Back to blog</Link>
      </div>
    )
  }
  return <PostForm key={state.post?.id || 'new'} post={state.post} />
}

function PostForm({ post }) {
  const navigate = useNavigate()
  const { savePost } = useAdmin()
  const fileRef = useRef(null)
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [slugEdited, setSlugEdited] = useState(Boolean(post))
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [body, setBody] = useState(post?.body || '')
  const [coverImage, setCoverImage] = useState(post?.coverImage || '')
  const [published, setPublished] = useState(post ? post.published : true)
  const [error, setError] = useState('')
  const [coverError, setCoverError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function onTitle(value) {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  async function onCover(file) {
    setCoverError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setCoverError('Choose a JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > IMAGE_LIMIT) {
      setCoverError('Use an image under 8 MB.')
      return
    }
    setUploading(true)
    try {
      setCoverImage(await uploadImage(file))
    } catch (err) {
      setCoverError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    const clean = sanitizeArticle(body)
    if (isEmptyHtml(clean) && !/<img\s/i.test(clean)) {
      setError('Write the post before saving.')
      return
    }
    setSaving(true)
    try {
      await savePost(
        {
          title,
          slug: slugify(slug || title),
          excerpt,
          body: clean,
          coverImage: coverImage.trim() || null,
          published,
        },
        post?.id,
      )
      navigate('/auth/admin/blog')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const submitLabel = saving ? 'Saving…' : published ? (post?.published ? 'Save changes' : 'Publish post') : 'Save draft'

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/auth/admin/blog" className="text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
            Blog
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">{post ? 'Edit post' : 'New post'}</h1>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading} aria-busy={saving}>{submitLabel}</button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5 border border-line bg-white p-5 md:p-7">
          <label className="block text-sm font-semibold text-navy">
            Title *
            <input required maxLength={160} value={title} onChange={(event) => onTitle(event.target.value)} className="field" />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Address slug
            <input
              value={slug}
              onChange={(event) => {
                setSlugEdited(true)
                setSlug(slugify(event.target.value))
              }}
              className="field"
            />
            <span className="mt-1 block font-normal text-muted">/blog/{slug || 'post-title'}</span>
          </label>
          <label className="block text-sm font-semibold text-navy">
            Summary
            <textarea rows={2} maxLength={300} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="field font-normal" />
            <span className="mt-1 block font-normal text-muted">Shown on the blog list and in link previews. Left empty, the opening lines are used.</span>
          </label>
          <div>
            <p className="text-sm font-semibold text-navy">Post *</p>
            <p className="mt-1 text-sm text-muted">Use the image button, or paste or drop a photo into the text. Click an image to describe it or remove it.</p>
            <RichTextEditor images label="Post" placeholder="Write the post…" value={body} onChange={setBody} />
          </div>
        </div>

        <div className="space-y-5">
          <fieldset className="border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-navy">Status</legend>
            <label className="mt-1 flex items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-0.5" checked={published} onChange={(event) => setPublished(event.target.checked)} />
              <span>
                <span className="font-semibold">Published on the website</span>
                <span className="mt-1 block text-muted">Untick to keep it as a draft.</span>
              </span>
            </label>
          </fieldset>

          <fieldset className="border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-navy">Cover image</legend>
            {coverImage && (
              <div className="mt-2 aspect-[16/10] overflow-hidden border border-line bg-paper">
                <img src={coverImage} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={(event) => onCover(event.target.files?.[0])} />
            <button type="button" className="btn btn-outline mt-3 w-full" disabled={uploading || saving} aria-busy={uploading} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} aria-hidden="true" /> {uploading ? 'Uploading…' : coverImage ? 'Replace image' : 'Upload image'}
            </button>
            {coverImage && (
              <button type="button" className="mt-3 text-sm font-semibold text-navy" onClick={() => setCoverImage('')}>
                Remove image
              </button>
            )}
            {coverError && <p className="mt-3 text-sm text-red-800">{coverError}</p>}
          </fieldset>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving || uploading} aria-busy={saving}>{submitLabel}</button>
        <Link to="/auth/admin/blog" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  )
}
