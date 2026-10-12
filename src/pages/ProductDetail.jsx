import { Link, useParams } from 'react-router-dom'
import { Check, MessageCircle } from 'lucide-react'
import ProductCard, { ProductImage } from '../components/ProductCard'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { site } from '../data/site'
import { formatPrice, useProduct, useProducts } from '../lib/api'
import { categoryLabel } from '../lib/catalog'
import { sanitizeHtml } from '../lib/sanitize'
import { isEmptyHtml, plainText } from '../lib/text'

export default function ProductDetail() {
  const { slug } = useParams()
  const { product, loading } = useProduct(slug)
  const { products } = useProducts()

  if (loading && !product) return <div className="min-h-[50vh] bg-paper px-6 py-20 text-muted md:px-10">Loading product…</div>
  if (!product) return <NotFound message="We could not find that product." backTo="/products" backLabel="Back to products" />

  const categoryName = categoryLabel(product.category)
  const price = formatPrice(product.price)
  const description = plainText(product.descriptionHtml || product.description)
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3)
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hello Omegason, I would like a quote for: ${product.name}`)}`

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    category: categoryName,
    brand: { '@type': 'Brand', name: 'Omegason' },
    url: `https://www.omegasonenergy.com/products/${product.slug}`,
    ...(product.price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NGN',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: `https://www.omegasonenergy.com/products/${product.slug}`,
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
                {categoryName}{product.sample ? ' · Sample listing' : ''}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-navy">{product.name}</h1>
              {!isEmptyHtml(product.descriptionHtml) ? (
                <div className="rich-copy mt-4 text-lg text-muted" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml) }} />
              ) : (
                <p className="mt-4 text-lg leading-relaxed text-muted">{product.description}</p>
              )}
              <p className="mt-6 font-display text-3xl font-semibold text-navy">{price || 'Request a quote'}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/contact?product=${product.slug}`} className="btn btn-primary">Request a quote</Link>
                <a href={wa} target="_blank" rel="noreferrer" className="btn btn-outline">
                  <MessageCircle size={18} aria-hidden="true" /> Ask on WhatsApp
                </a>
              </div>
              {product.features?.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-ink">
                      <Check size={18} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />{f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {!isEmptyHtml(product.specificationsHtml) ? (
            <div className="mt-14 border border-line">
              <h2 className="border-b border-line bg-paper px-5 py-4 font-display text-xl font-semibold text-navy">Specifications</h2>
              <div className="rich-copy px-5 py-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.specificationsHtml) }} />
            </div>
          ) : product.specs?.length > 0 && (
            <div className="mt-14 border border-line">
              <h2 className="border-b border-line bg-paper px-5 py-4 font-display text-xl font-semibold text-navy">Specifications</h2>
              <dl>
                {product.specs.map((s) => (
                  <div key={s.label} className="grid gap-1 border-b border-line px-5 py-3 last:border-b-0 sm:grid-cols-3">
                    <dt className="text-sm text-muted">{s.label}</dt>
                    <dd className="sm:col-span-2">{s.value}</dd>
                  </div>
                ))}
              </dl>
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
