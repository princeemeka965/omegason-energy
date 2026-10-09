import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductArt from './ProductArt'
import { categories } from '../data/products'
import { formatPrice } from '../lib/api'

export function ProductImage({ product, className = '' }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  return <ProductArt category={product.category} className={`h-full w-full ${className}`} />
}

export default function ProductCard({ product }) {
  const label = categories.find((c) => c.id === product.category)?.label
  const price = formatPrice(product.price)
  return (
    <motion.article layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <Link to={`/products/${product.slug}`} className="group block h-full border border-line bg-white transition-colors hover:border-navy">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper">
          <ProductImage product={product} />
          {product.sample && (
            <span className="absolute left-3 top-3 bg-navy px-2 py-1 text-xs font-semibold text-white">Sample listing</span>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">{label}</p>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-navy">{product.name}</h3>
          <p className="mt-2 text-sm text-muted">{product.summary}</p>
          <p className="mt-4 font-semibold text-navy">{price || 'Request a quote'}</p>
        </div>
      </Link>
    </motion.article>
  )
}
