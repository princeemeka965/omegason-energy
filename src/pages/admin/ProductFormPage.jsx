import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { useAdmin } from '../../lib/adminContext'
import { slugify } from '../../lib/adminStore'
import { sanitizeHtml } from '../../lib/sanitize'
import { isEmptyHtml } from '../../lib/text'

const IMAGE_LIMIT = 600 * 1024

export default function ProductFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { products } = useAdmin()
  const existing = id ? products.find((product) => product.id === id) : null
  const preset = params.get('category') || 'new'
  if (id && !existing) {
    return (
      <div className="border border-line bg-white px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-navy">Product not found</h1>
        <Link to="/auth/admin/products" className="btn btn-primary mt-6">Back to products</Link>
      </div>
    )
  }
  return <ProductForm key={existing?.id || preset} product={existing} />
}

function ProductForm({ product }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { categories, saveProduct } = useAdmin()
  const fileRef = useRef(null)
  const preset = params.get('category')
  const initialCategory = product?.category || (categories.some((category) => category.id === preset) ? preset : categories[0]?.id || '')

  const [name, setName] = useState(product?.name || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [slugEdited, setSlugEdited] = useState(Boolean(product))
  const [category, setCategory] = useState(initialCategory)
  const [summary, setSummary] = useState(product?.summary || '')
  const [descriptionHtml, setDescriptionHtml] = useState(product?.descriptionHtml || '')
  const [specificationsHtml, setSpecificationsHtml] = useState(product?.specificationsHtml || '')
  const [quoteOnly, setQuoteOnly] = useState(product ? product.price == null : true)
  const [price, setPrice] = useState(product?.price ? String(product.price) : '')
  const [image, setImage] = useState(product?.image || '')
  const [featured, setFeatured] = useState(Boolean(product?.featured))
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)

  function onName(value) {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  function onFile(file) {
    setImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.')
      return
    }
    if (file.size > IMAGE_LIMIT) {
      setImageError('Use an image under 600 KB, or paste a path such as /products/panel.jpg.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    if (isEmptyHtml(descriptionHtml)) {
      setError('Add a description.')
      return
    }
    const nextSlug = slugify(slug || name)
    let nextPrice = null
    if (!quoteOnly) {
      const digits = price.replace(/[^\d]/g, '')
      nextPrice = Number(digits)
      if (!digits || nextPrice <= 0) {
        setError('Enter a price in naira, or mark the product as price on request.')
        return
      }
    }
    const imageValue = image.trim()
    if (imageValue && !imageValue.startsWith('/') && !imageValue.startsWith('data:image/') && !/^https?:\/\//i.test(imageValue)) {
      setError('Use an image path starting with /, an https link, or upload a file.')
      return
    }
    setSaving(true)
    try {
      await saveProduct(
        {
          name,
          slug: nextSlug,
          category,
          summary,
          descriptionHtml: sanitizeHtml(descriptionHtml),
          specificationsHtml: sanitizeHtml(specificationsHtml),
          price: nextPrice,
          image: imageValue || null,
          featured,
        },
        product?.id,
      )
      navigate('/auth/admin/products')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/auth/admin/products" className="text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
            Products
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">{product ? 'Edit product' : 'Add a product'}</h1>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Publish product'}</button>
      </div>

      {categories.length === 0 && (
        <p className="mt-6 border border-brass/40 bg-white px-4 py-3 text-sm text-navy">
          Create a category before adding a product.{' '}
          <Link to="/auth/admin/categories" className="font-semibold underline decoration-brass decoration-2 underline-offset-4">Add a category</Link>
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5 border border-line bg-white p-5 md:p-7">
          <label className="block text-sm font-semibold text-navy">
            Name *
            <input required value={name} onChange={(event) => onName(event.target.value)} className="field" />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Address slug *
            <input
              required
              value={slug}
              onChange={(event) => {
                setSlugEdited(true)
                setSlug(slugify(event.target.value))
              }}
              className="field"
            />
            <span className="mt-1 block font-normal text-muted">/products/{slug || 'product-name'}</span>
          </label>
          <label className="block text-sm font-semibold text-navy">
            Summary *
            <input required value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={180} className="field" />
            <span className="mt-1 block font-normal text-muted">One sentence on the product card.</span>
          </label>
          <div>
            <p className="text-sm font-semibold text-navy">Description *</p>
            <p className="mt-1 text-sm text-muted">Shown on the product page. Use headings and lists where they help.</p>
            <RichTextEditor label="Description" placeholder="Describe the solar product…" value={descriptionHtml} onChange={setDescriptionHtml} />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">Specifications</p>
            <p className="mt-1 text-sm text-muted">Ratings, warranty, what is included, and anything a buyer should compare.</p>
            <RichTextEditor label="Specifications" placeholder="Rated power, warranty, included parts…" value={specificationsHtml} onChange={setSpecificationsHtml} />
          </div>
        </div>

        <div className="space-y-5">
          <fieldset className="border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-navy">Category *</legend>
            <select required value={category} onChange={(event) => setCategory(event.target.value)} className="field" disabled={categories.length === 0}>
              {categories.length === 0 && <option value="">No categories yet</option>}
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-navy">Price</legend>
            <label className="mt-1 flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={quoteOnly} onChange={(event) => setQuoteOnly(event.target.checked)} />
              Price on request
            </label>
            {!quoteOnly && (
              <label className="mt-4 block text-sm font-semibold text-navy">
                Price in naira
                <input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} className="field" placeholder="185000" />
              </label>
            )}
          </fieldset>

          <fieldset className="border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-navy">Image</legend>
            {image && (
              <div className="mt-2 aspect-[4/3] overflow-hidden border border-line bg-paper">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
            <button type="button" className="btn btn-outline mt-3 w-full" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} aria-hidden="true" /> Upload image
            </button>
            <label className="mt-4 block text-sm font-semibold text-navy">
              Or image path
              <input value={image.startsWith('data:') ? '' : image} onChange={(event) => setImage(event.target.value)} placeholder="/products/panel.jpg" className="field" />
            </label>
            {image && (
              <button type="button" className="mt-3 text-sm font-semibold text-navy" onClick={() => setImage('')}>
                Remove image
              </button>
            )}
            {imageError && <p className="mt-3 text-sm text-red-800">{imageError}</p>}
          </fieldset>

          <label className="flex items-start gap-2 border border-line bg-white p-5 text-sm text-navy">
            <input type="checkbox" className="mt-0.5" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            <span>
              <span className="font-semibold">Show on the home page</span>
              <span className="mt-1 block text-muted">Featured products appear in the home highlights.</span>
            </span>
          </label>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>{product ? 'Save changes' : 'Publish product'}</button>
        <Link to="/auth/admin/products" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  )
}
