import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Pager from '../../components/admin/Pager'
import { useAdmin } from '../../lib/adminContext'
import { formatWhen } from '../../lib/adminStore'
import { formatPrice } from '../../lib/api'

const PAGE_SIZE = 5

export default function ProductsPage() {
  const { products, categories, deleteProduct } = useAdmin()
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    setPages({})
  }, [query, active])

  useEffect(() => {
    if (active !== 'all' && !categories.some((category) => category.id === active)) setActive('all')
  }, [active, categories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      const category = categories.find((item) => item.id === product.category)
      const haystack = `${product.name} ${product.summary} ${category?.label || ''}`.toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      const matchesCategory = active === 'all' || product.category === active
      return matchesQuery && matchesCategory
    })
  }, [products, categories, query, active])

  const groups = useMemo(() => {
    const known = categories.map((category) => ({
      category,
      items: filtered
        .filter((product) => product.category === category.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    }))
    const loose = filtered.filter((product) => !categories.some((category) => category.id === product.category))
    const visible = known.filter((group) => (active === 'all' ? group.items.length > 0 : group.category.id === active))
    if (loose.length > 0 && active === 'all') {
      visible.push({
        category: { id: 'uncategorised', label: 'Needs a category' },
        items: loose,
      })
    }
    return visible
  }, [categories, filtered, active])

  const emptyCategories = categories.filter((category) => !products.some((product) => product.category === category.id))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">Catalogue</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {products.length === 0
              ? 'Products you add are grouped under the category you choose.'
              : `${products.length} uploaded ${products.length === 1 ? 'product' : 'products'}, grouped by category.`}
            {' '}They appear on the public catalogue as soon as they are saved.
          </p>
        </div>
        <Link to="/auth/admin/products/new" className="btn btn-primary">
          <Plus size={18} aria-hidden="true" /> Add product
        </Link>
      </div>
      {actionError && <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{actionError}</p>}

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <FilterChip pressed={active === 'all'} onClick={() => setActive('all')}>All categories</FilterChip>
          {categories.map((category) => (
            <FilterChip key={category.id} pressed={active === category.id} onClick={() => setActive(category.id)}>
              {category.label}
            </FilterChip>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search uploaded products</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="field search-field" />
        </label>
      </div>

      {products.length === 0 && (
        <div className="mt-8 border border-line bg-white px-6 py-14 text-center">
          <h2 className="font-display text-2xl font-semibold text-navy">No products uploaded yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">Create a category if you need a new one, then add the first solar product.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/auth/admin/categories" className="btn btn-outline">Categories</Link>
            <Link to="/auth/admin/products/new" className="btn btn-primary">Add product</Link>
          </div>
        </div>
      )}

      {products.length > 0 && groups.length === 0 && (
        <div className="mt-8 border border-line bg-white px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-semibold text-navy">No products match that search</h2>
          <button type="button" className="btn btn-outline mt-5" onClick={() => { setQuery(''); setActive('all') }}>Clear search</button>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          const pageCount = Math.max(1, Math.ceil(group.items.length / PAGE_SIZE))
          const requested = pages[group.category.id] || 1
          const page = Math.min(requested, pageCount)
          const rows = group.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          return (
            <section key={group.category.id} className="scroll-mt-24 overflow-hidden border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
                <h2 className="font-display text-xl font-semibold text-navy">
                  {group.category.label}
                  <span className="ml-2 text-sm font-sans font-semibold text-muted">{group.items.length}</span>
                </h2>
                {group.category.id !== 'uncategorised' && (
                  <Link to={`/auth/admin/products/new?category=${group.category.id}`} className="text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
                    Add to {group.category.label}
                  </Link>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <caption className="sr-only">{group.category.label} products</caption>
                  <thead>
                    <tr className="border-b border-line text-muted">
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="hidden px-4 py-3 font-semibold md:table-cell">Updated</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted">No products in this category yet.</td>
                      </tr>
                    )}
                    {rows.map((product) => (
                      <tr key={product.id} className="border-b border-line last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 shrink-0 overflow-hidden bg-paper">
                              {product.image ? (
                                <img src={product.image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-navy/10" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-navy">{product.name}</p>
                              <p className="truncate text-muted">{product.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-navy">{formatPrice(product.price) || 'Quote'}</td>
                        <td className="hidden px-4 py-3 text-muted md:table-cell">{formatWhen(product.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {pendingDelete === product.id ? (
                              <>
                                <button type="button" className="text-sm font-semibold text-muted" onClick={() => setPendingDelete(null)}>Cancel</button>
                                <button
                                  type="button"
                                  className="bg-red-700 px-2.5 py-1.5 text-sm font-semibold text-white"
                                  onClick={async () => {
                                    setActionError('')
                                    try {
                                      await deleteProduct(product.id)
                                      setPendingDelete(null)
                                    } catch (err) {
                                      setActionError(err.message)
                                      setPendingDelete(null)
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <Link to={`/auth/admin/products/${product.id}`} className="btn btn-outline !px-2.5 !py-1.5" aria-label={`Edit ${product.name}`}>
                                  <Pencil size={15} aria-hidden="true" /> Edit
                                </Link>
                                <button type="button" className="btn btn-outline !px-2.5 !py-1.5" aria-label={`Delete ${product.name}`} onClick={() => setPendingDelete(product.id)}>
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
              <Pager
                page={page}
                pages={pageCount}
                label={`${group.category.label} pages`}
                onPage={(next) => setPages((current) => ({ ...current, [group.category.id]: next }))}
              />
            </section>
          )
        })}
      </div>

      {active === 'all' && !query && emptyCategories.length > 0 && products.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          No products yet in {emptyCategories.map((category) => category.label).join(', ')}.
        </p>
      )}
    </div>
  )
}

function FilterChip({ pressed, onClick, children }) {
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
