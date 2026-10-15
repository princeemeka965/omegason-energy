// Public site data. One request to /api/site on page load carries the catalogue,
// phases and published posts; every hook below reads from it.
//
// The last good response is kept in localStorage, so a returning visitor sees the
// saved copy at once and the fresh one replaces it when the network answers. With
// no network the saved copy stays on screen and `offline` is set.
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { catalogCategories, publicProducts, rememberCategories } from './catalog'
import { request } from './http'

const SITE_CACHE_KEY = 'omegason.site.v1'
const POST_CACHE_PREFIX = 'omegason.post.v1.'

function readStored(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

// A full or blocked storage only costs the offline copy, never the page.
function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

let snapshot = { data: readStored(SITE_CACHE_KEY), fresh: false, failed: false }
rememberCategories(snapshot.data?.categories)
const listeners = new Set()

function publish(next) {
  snapshot = next
  rememberCategories(snapshot.data?.categories)
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let siteRequest = null

// A failed load is dropped so the next caller retries. It falls back to the saved
// copy and only rejects when there is none.
export function fetchSite() {
  if (siteRequest) return siteRequest
  const run = request('/api/site').then(
    (data) => {
      writeStored(SITE_CACHE_KEY, data)
      publish({ data, fresh: true, failed: false })
      return data
    },
    (error) => {
      siteRequest = null
      publish({ ...snapshot, failed: true })
      if (snapshot.data) return snapshot.data
      throw error
    },
  )
  siteRequest = run
  return run
}

function invalidateSite() {
  siteRequest = null
}

function useSite() {
  const state = useSyncExternalStore(subscribe, () => snapshot)
  useEffect(() => {
    fetchSite().catch(() => {})
  }, [])
  return {
    data: state.data,
    loading: !state.data && !state.failed,
    error: !state.data && state.failed,
    offline: Boolean(state.data) && state.failed,
  }
}

function listOf(data, key) {
  return Array.isArray(data?.[key]) ? data[key] : []
}

export function invalidateCatalog() {
  invalidateSite()
}

export async function fetchProducts() {
  return publicProducts(listOf(await fetchSite(), 'products'))
}

export function useProducts() {
  const { data, loading, error, offline } = useSite()
  const products = useMemo(() => publicProducts(listOf(data, 'products')), [data])
  return { products, loading, error, offline }
}

export function useCategories() {
  const { data } = useSite()
  return useMemo(() => (data ? catalogCategories() : []), [data])
}

export function useProduct(slug) {
  const { products, loading, error, offline } = useProducts()
  const product = products.find((item) => item.slug === slug) || null
  return { product, loading, error, offline }
}

export function invalidatePhases() {
  invalidateSite()
}

export async function fetchPhases() {
  return listOf(await fetchSite(), 'phases')
}

export function usePhases() {
  const { data, loading, error, offline } = useSite()
  const phases = useMemo(() => listOf(data, 'phases'), [data])
  return { phases, loading, error, offline }
}

export function invalidatePosts() {
  invalidateSite()
}

export async function fetchPosts() {
  return listOf(await fetchSite(), 'posts')
}

export function usePosts() {
  const { data, loading, error } = useSite()
  const posts = useMemo(() => listOf(data, 'posts'), [data])
  return { posts, loading, error: error ? 'The blog could not be loaded. Try again shortly.' : '' }
}

// Each article body is saved after it is read, so it opens again without a network.
export function usePost(slug) {
  const [state, setState] = useState(() => initialPostState(slug))
  useEffect(() => {
    let alive = true
    setState(initialPostState(slug))
    request(`/api/posts/${encodeURIComponent(slug)}`)
      .then((post) => {
        writeStored(POST_CACHE_PREFIX + slug, post)
        if (alive) setState({ post, loading: false, error: '' })
      })
      .catch((error) => {
        if (!alive) return
        if (error.status === 404) {
          try {
            localStorage.removeItem(POST_CACHE_PREFIX + slug)
          } catch {
            // ignore
          }
          setState({ post: null, loading: false, error: '' })
          return
        }
        setState((current) => current.post
          ? { ...current, loading: false }
          : { post: null, loading: false, error: 'This post could not be loaded. Try again shortly.' })
      })
    return () => {
      alive = false
    }
  }, [slug])
  return state
}

function initialPostState(slug) {
  const post = readStored(POST_CACHE_PREFIX + slug)
  return { post, loading: !post, error: '' }
}

// A plain href, not a router Link: opening a post reloads the page so the server-
// rendered title, preview tags and article markup are what the browser receives.
export function postHref(post) {
  return `/blog/${encodeURIComponent(post.slug)}`
}

export function formatPostDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'long' }).format(date)
}

export function formatPrice(price) {
  if (price == null) return null
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)
}
