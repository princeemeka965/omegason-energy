import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Pager from '../../components/admin/Pager'
import { useAdmin } from '../../lib/adminContext'
import { formatWhen } from '../../lib/adminStore'

const PAGE_SIZE = 8

export default function PostsPage() {
  const { posts, deletePost } = useAdmin()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  const published = posts.filter((post) => post.published).length
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (filter === 'published' && !post.published) return false
      if (filter === 'drafts' && post.published) return false
      return !q || `${post.title} ${post.excerpt}`.toLowerCase().includes(q)
    })
  }, [posts, filter, query])

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Website</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Blog</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Published posts appear on the website blog straight away. Drafts stay here until you publish them.
          </p>
        </div>
        <Link to="/auth/admin/blog/new" className="btn btn-primary">
          <Plus size={18} aria-hidden="true" /> New post
        </Link>
      </div>
      {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter posts">
          <Filter pressed={filter === 'all'} onClick={() => setFilter('all')}>All ({posts.length})</Filter>
          <Filter pressed={filter === 'published'} onClick={() => setFilter('published')}>Published ({published})</Filter>
          <Filter pressed={filter === 'drafts'} onClick={() => setFilter('drafts')}>Drafts ({posts.length - published})</Filter>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search posts</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts" className="field search-field" />
        </label>
      </div>

      <div className="mt-4 overflow-hidden border border-line bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-muted">
              {posts.length === 0 ? 'No posts yet. Write the first one and it will appear on the website blog.' : 'No posts match that filter.'}
            </p>
            {posts.length === 0 && <Link to="/auth/admin/blog/new" className="btn btn-primary mt-5">Write a post</Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Blog posts</caption>
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((post) => (
                  <tr key={post.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden bg-paper">
                          {post.coverImage ? <img src={post.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-navy/10" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy">{post.title}</p>
                          <p className="max-w-md truncate text-muted">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] ${post.published ? 'bg-navy text-white' : 'bg-paper text-muted'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">{formatWhen(post.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {pendingDelete === post.id ? (
                          <>
                            <button type="button" className="text-sm font-semibold text-muted disabled:opacity-40" disabled={deletingId === post.id} onClick={() => setPendingDelete(null)}>Cancel</button>
                            <button
                              type="button"
                              className="bg-red-700 px-2.5 py-1.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                              disabled={deletingId === post.id}
                              aria-busy={deletingId === post.id}
                              onClick={async () => {
                                setError('')
                                setDeletingId(post.id)
                                try {
                                  await deletePost(post.id)
                                } catch (err) {
                                  setError(err.message)
                                } finally {
                                  setPendingDelete(null)
                                  setDeletingId('')
                                }
                              }}
                            >
                              {deletingId === post.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </>
                        ) : (
                          <>
                            {post.published && (
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline !px-2.5 !py-1.5" aria-label={`View ${post.title} on the website`}>
                                <ExternalLink size={15} aria-hidden="true" />
                              </a>
                            )}
                            <Link to={`/auth/admin/blog/${post.id}`} className="btn btn-outline !px-2.5 !py-1.5" aria-label={`Edit ${post.title}`}>
                              <Pencil size={15} aria-hidden="true" /> Edit
                            </Link>
                            <button type="button" className="btn btn-outline !px-2.5 !py-1.5" aria-label={`Delete ${post.title}`} onClick={() => setPendingDelete(post.id)}>
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={safePage} pages={pageCount} label="Blog pages" onPage={setPage} />
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
