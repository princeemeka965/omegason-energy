import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductArt from './ProductArt'
import QuoteModal from './QuoteModal'
import { formatPrice } from '../lib/api'
import { categoryLabel } from '../lib/catalog'

export function ProductImage({ product, className = '' }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  return <ProductArt category={product.category} className={`h-full w-full ${className}`} />
}

export default function ProductCard({ product }) {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const label = categoryLabel(product.category)
  const price = formatPrice(product.price)
  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col border border-line bg-white"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper">
          <ProductImage product={product} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">{label}</p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-navy">
          <Link to={`/products/${product.slug}`} className="hover:underline">{product.name}</Link>
        </h3>
        <p className="mt-2 text-sm text-muted">{product.summary}</p>
        <p className="mt-4 font-display text-2xl font-semibold text-navy">{price || 'Price on request'}</p>
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <Link to={`/products/${product.slug}`} className="btn btn-outline w-full">View details</Link>
          <button type="button" className="btn btn-primary w-full" onClick={() => setQuoteOpen(true)}>Request a quote</button>
        </div>
      </div>
      {quoteOpen && <QuoteModal product={product} onClose={() => setQuoteOpen(false)} />}
    </motion.article>
  )
}
