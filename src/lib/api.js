// Products come from src/data/products.js today.
// When you want a real backend (Supabase, an Express API, a CMS), replace the two
// fetch functions below. Nothing else in the app needs to change.
import { useEffect, useState } from 'react'
import { products as local } from '../data/products'

export async function fetchProducts() {
  // Example: const { data } = await supabase.from('products').select('*'); return data
  return local
}

export async function fetchProduct(slug) {
  const all = await fetchProducts()
  return all.find((p) => p.slug === slug) || null
}

export function useProducts() {
  const [products, setProducts] = useState(local)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchProducts().then((p) => alive && (setProducts(p), setLoading(false)))
    return () => { alive = false }
  }, [])
  return { products, loading }
}

export function useProduct(slug) {
  const [state, setState] = useState(() => ({ product: local.find((p) => p.slug === slug) || null, loading: false }))
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchProduct(slug).then((product) => alive && setState({ product, loading: false }))
    return () => { alive = false }
  }, [slug])
  return state
}

export function formatPrice(price) {
  if (price == null) return null
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)
}
