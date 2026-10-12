// Public catalogue: sample listings in src/data/products.js, plus products
// stored by the admin API. If the API is down, the sample listings still render.
import { useEffect, useState } from 'react'
import { catalogCategories, mergeProducts, rememberCategories } from './catalog'
import { request } from './http'

let catalogRequest = null

export function invalidateCatalog() {
  catalogRequest = null
}

export function fetchCatalog() {
  if (catalogRequest) return catalogRequest
  const run = request('/api/catalog')
    .then((data) => {
      rememberCategories(data.categories || [])
      return {
        categories: catalogCategories(),
        products: mergeProducts(data.products || []),
      }
    })
    .catch(() => {
      catalogRequest = null
      rememberCategories([])
      return {
        categories: catalogCategories(),
        products: mergeProducts([]),
      }
    })
  catalogRequest = run
  return run
}

export async function fetchProducts() {
  const catalog = await fetchCatalog()
  return catalog.products
}

export async function fetchProduct(slug) {
  const products = await fetchProducts()
  return products.find((product) => product.slug === slug) || null
}

export function useProducts() {
  const [products, setProducts] = useState(() => mergeProducts([]))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetchCatalog().then((catalog) => {
      if (!alive) return
      setProducts(catalog.products)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])
  return { products, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState(catalogCategories)
  useEffect(() => {
    let alive = true
    fetchCatalog().then((catalog) => {
      if (alive) setCategories(catalog.categories)
    })
    return () => {
      alive = false
    }
  }, [])
  return categories
}

export function useProduct(slug) {
  const [state, setState] = useState({ product: null, loading: true })
  useEffect(() => {
    let alive = true
    setState({ product: null, loading: true })
    fetchProduct(slug).then((product) => {
      if (alive) setState({ product, loading: false })
    })
    return () => {
      alive = false
    }
  }, [slug])
  return state
}

export function formatPrice(price) {
  if (price == null) return null
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)
}
