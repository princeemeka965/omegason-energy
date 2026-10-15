// Categories and products both come from the API (/api/site).
import { plainText } from './text'

let categorySource = []

export function rememberCategories(categories) {
  categorySource = Array.isArray(categories) ? categories : []
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
  }
}

export function publicProducts(products) {
  return (Array.isArray(products) ? products : []).map(toPublic)
}
