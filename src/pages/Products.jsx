import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import OfflineNote from '../components/OfflineNote'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import ProductCard from '../components/ProductCard'
import { useCategories, useProducts } from '../lib/api'

const PAGE_SIZE = 12

export default function Products() {
  const { products, loading, error, offline } = useProducts()
  const categories = useCategories()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const tabsRef = useRef(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) => (category === 'all' || p.category === category) && (!q || `${p.name} ${p.summary}`.toLowerCase().includes(q)),
    )
  }, [products, category, query])

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const chips = [{ id: 'all', label: 'All products' }, ...categories.filter((c) => products.some((p) => p.category === c.id))]

  useEffect(() => {
    setPage(1)
  }, [category, query])

  function scrollToTabs() {
    const el = tabsRef.current
    if (!el) return
    const header = document.querySelector('header')
    const offset = (header?.getBoundingClientRect().height ?? 0) + 16
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
  }

  function goToPage(next) {
    setPage(next)
    requestAnimationFrame(scrollToTabs)
  }

  return (
    <>
      <Seo
        title="Solar Products"
        description="Solar panels, inverters, batteries, lighting and complete home and business kits from Omegason Integrated Energy Services."
        path="/products"
      />
      <PageHeader title="Solar products">
        Panels, inverters, batteries, lighting and complete kits. Ask the team to size a system for your site.
      </PageHeader>

      <section className="bg-paper px-6 py-12 md:px-10 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <div ref={tabsRef} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {chips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={`border px-3 py-1.5 text-sm font-semibold ${
                    category === c.id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-navy'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="relative block md:w-72">
              <span className="sr-only">Search products</span>
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="field search-field"
              />
            </label>
          </div>

          <OfflineNote show={offline} className="mt-8" />
          {loading && <p className="mt-10 text-muted">Loading products…</p>}

          <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {pageItems.map((p) => <ProductCard key={p.slug} product={p} />)}
            </AnimatePresence>
          </motion.div>

          {!loading && pageCount > 1 && (
            <nav aria-label="Product pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="btn btn-outline !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === safePage ? 'page' : undefined}
                  onClick={() => goToPage(n)}
                  className={`grid h-10 w-10 place-items-center border text-sm font-semibold ${
                    n === safePage ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-navy'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline !px-3 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === pageCount}
              >
                Next
              </button>
            </nav>
          )}

          {!loading && products.length === 0 && (
            <div className="mt-10 border border-line bg-white p-10 text-center">
              <p className="font-display text-2xl font-semibold text-navy">
                {error ? 'The catalogue could not be loaded' : 'Products are on the way'}
              </p>
              <p className="mt-2 text-muted">
                {error ? 'Refresh the page in a moment, or tell us what you need.' : 'Tell us what you need and we will source it.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/contact" className="btn btn-primary">Contact us</Link>
              </div>
            </div>
          )}

          {!loading && products.length > 0 && shown.length === 0 && (
            <div className="mt-10 border border-line bg-white p-10 text-center">
              <p className="font-display text-2xl font-semibold text-navy">No products match that search</p>
              <p className="mt-2 text-muted">Clear the filters, or tell us what you need and we will source it.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button className="btn btn-outline" onClick={() => { setCategory('all'); setQuery('') }}>Clear filters</button>
                <Link to="/contact" className="btn btn-primary">Contact us</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
