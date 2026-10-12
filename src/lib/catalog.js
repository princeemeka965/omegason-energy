import { categories as staticCategories, products as staticProducts } from '../data/products'
import { plainText } from './text'

let categorySource = mergeCategoryLists([])

function mergeCategoryLists(adminCategories) {
  const admin = Array.isArray(adminCategories) ? adminCategories : []
  const adminIds = new Set(admin.map((category) => category.id))
  const stillNeeded = staticCategories.filter(
    (category) => !adminIds.has(category.id) && staticProducts.some((product) => product.category === category.id),
  )
  return [...admin, ...stillNeeded]
}

export function rememberCategories(adminCategories) {
  categorySource = mergeCategoryLists(adminCategories)
}

export function catalogCategories() {
  return categorySource
}

export function categoryLabel(id) {
  return categorySource.find((category) => category.id === id)?.label || 'Solar product'
}

function toPublic(product) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    summary: product.summary,
    description: product.description || plainText(product.descriptionHtml),
    descriptionHtml: product.descriptionHtml || '',
    specificationsHtml: product.specificationsHtml || '',
    price: product.price,
    image: product.image,
    featured: product.featured,
    specs: product.specs || [],
    features: product.features || [],
    sample: false,
    managed: true,
  }
}

export function mergeProducts(adminProducts) {
  const uploaded = (Array.isArray(adminProducts) ? adminProducts : []).map(toPublic)
  const slugs = new Set(uploaded.map((product) => product.slug))
  return [...uploaded, ...staticProducts.filter((product) => !slugs.has(product.slug))]
}
