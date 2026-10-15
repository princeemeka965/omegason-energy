import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard, { ProductImage } from '../components/ProductCard'
import OfflineNote from '../components/OfflineNote'
import QuoteModal from '../components/QuoteModal'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { formatPrice, useProduct, useProducts } from '../lib/api'
import { categoryLabel } from '../lib/catalog'
import { sanitizeHtml } from '../lib/sanitize'
import { isEmptyHtml, plainText } from '../lib/text'

export default function ProductDetail() {
  const { slug } = useParams()
  const { product, loading, error, offline } = useProduct(slug)
  const { products } = useProducts()
  const [quoteOpen, setQuoteOpen] = useState(false)

  if (loading && !product) return <div className="min-h-[50vh] bg-paper px-6 py-20 text-muted md:px-10">Loading product…</div>
  if (error) return <div role="alert" className="min-h-[50vh] bg-paper px-6 py-20 text-muted md:px-10">This product could not be loaded. Check your connection and refresh the page.</div>
  if (!product) return <NotFound message="We could not find that product." backTo="/products" backLabel="Back to products" />

  const categoryName = categoryLabel(product.category)
  const price = formatPrice(product.price)
  const description = plainText(product.descriptionHtml || product.description)
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    category: categoryName,
    brand: { '@type': 'Brand', name: 'Omegason' },
    url: `https://www.omegasonenergy.org/products/${product.slug}`,
    ...(product.price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NGN',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: `https://www.omegasonenergy.org/products/${product.slug}`,
          },
        }
      : {}),
  }

  return (
    <>
      <Seo
        title={product.name}
        description={product.summary}
        path={`/products/${product.slug}`}
        type="product"
        image={product.image && !String(product.image).startsWith('data:') ? product.image : '/media/hybrid.jpg'}
        jsonLd={productJsonLd}
      />
      <section className="bg-white px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <OfflineNote show={offline} className="mb-6" />
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
            <Link to="/products" className="hover:text-navy">Products</Link>
            <span aria-hidden="true"> / </span>
            <span className="text-navy">{product.name}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/3] overflow-hidden border border-line bg-paper">
              <ProductImage product={product} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brass">
                {categoryName}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-navy">{product.name}</h1>
              {!isEmptyHtml(product.descriptionHtml) ? (
                <div className="rich-copy mt-4 text-lg text-muted" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml) }} />
              ) : (
                <p className="mt-4 text-lg leading-relaxed text-muted">{product.description}</p>
              )}
              <p className="mt-6 font-display text-3xl font-semibold text-navy">{price || 'Request a quote'}</p>
              <div className="mt-6">
                <button type="button" className="btn btn-primary" onClick={() => setQuoteOpen(true)}>Request a quote</button>
              </div>
              {quoteOpen && <QuoteModal product={product} onClose={() => setQuoteOpen(false)} />}
            </div>
          </div>

          {!isEmptyHtml(product.specificationsHtml) && (
            <div className="mt-14 border border-line">
              <h2 className="border-b border-line bg-paper px-5 py-4 font-display text-xl font-semibold text-navy">Specifications</h2>
              <div className="rich-copy px-5 py-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.specificationsHtml) }} />
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper px-6 py-14 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-semibold text-navy">More in {categoryName}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
