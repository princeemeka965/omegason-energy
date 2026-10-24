import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { offices, site } from '../data/site'
import { addQuote } from '../lib/adminStore'
import { useProducts } from '../lib/api'

export default function Contact() {
  const [params] = useSearchParams()
  const { products, loading } = useProducts()
  const wanted = products.find((p) => p.slug === params.get('product'))
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (wanted) setSubject(`Quote request: ${wanted.name}`)
  }, [wanted])

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const data = new FormData(e.currentTarget)
    const fields = Object.fromEntries(data)
    if (fields['bot-field']) return
    const productSlug = wanted?.slug || fields.product || ''
    try {
      await addQuote({
        name: fields.name,
        email: fields.email,
        subject: fields.subject,
        message: fields.message,
        productSlug,
        productName: wanted?.name || '',
      })
    } catch {
      setStatus('error')
      return
    }
    // A copy still goes to Netlify Forms on the deployed site. The local preview has no such endpoint.
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'contact', ...fields }).toString(),
    }).catch(() => {})
    setStatus('sent')
  }

  const tel = (n) => `tel:${n.replace(/\s/g, '')}`

  return (
    <>
      <Seo
        title="Contact Omegason"
        description="Contact Omegason Integrated Energy Services. Head office: 180 Agbani Road, Enugu, Nigeria. Phone +234 9025932104. Mobile +234 806 249 8123."
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Omegason Integrated Energy Services',
          url: 'https://www.omegasonenergy.org/contact',
          mainEntity: {
            '@type': 'Organization',
            name: 'Omegason Integrated Energy Services Ltd',
            telephone: '+2349025932104',
            email: site.email || undefined,
          },
        }}
      />
      <PageHeader title="Contact">
        Head office: 180 Agbani Road, Enugu, Enugu State, Nigeria, West Africa.
      </PageHeader>

      <section className="bg-paper px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {status === 'sent' ? (
              <div className="border border-line bg-white p-10">
                <CheckCircle2 className="text-brass" size={36} aria-hidden="true" />
                <h2 className="mt-4 font-display text-3xl font-semibold text-navy">Message sent</h2>
                <p className="mt-2 text-muted">Thank you. Our team will contact you soon. For anything urgent, call {site.mobile}.</p>
              </div>
            ) : (
              <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className="border border-line bg-white p-6 md:p-10">
                <h2 className="font-display text-2xl font-semibold text-navy">Send an email</h2>
                <p className="mt-1 text-sm text-muted">Required fields are marked.</p>
                <input type="hidden" name="form-name" value="contact" />
                <input type="hidden" name="product" value={wanted?.slug || ''} />
                <p className="hidden"><label>Do not fill this in: <input name="bot-field" /></label></p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-navy">Name *
                    <input required name="name" autoComplete="name" className="field" />
                  </label>
                  <label className="block text-sm font-semibold text-navy">Email *
                    <input required type="email" name="email" autoComplete="email" className="field" />
                  </label>
                </div>
                <label className="mt-5 block text-sm font-semibold text-navy">Subject *
                  <input required name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="field" disabled={loading && Boolean(params.get('product')) && !wanted} />
                </label>
                <label className="mt-5 block text-sm font-semibold text-navy">Message *
                  <textarea required name="message" rows={6} className="field" />
                </label>
                {status === 'error' && (
                  <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    The message did not send. Check your connection and try again, or call {site.mobile}.
                  </p>
                )}
                <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="btn btn-primary mt-6">
                  {status === 'sending' ? 'Sending…' : 'Send email'}
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-8 lg:col-span-5">
            <div className="border border-line bg-white p-7">
              <h2 className="font-display text-2xl font-semibold text-navy">Omegasonenergy information</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="font-semibold text-navy">Phone</dt><dd><a className="text-muted hover:text-navy" href={tel(site.phone)}>{site.phone}</a></dd></div>
                <div><dt className="font-semibold text-navy">Mobile</dt><dd><a className="text-muted hover:text-navy" href={tel(site.mobile)}>{site.mobile}</a></dd></div>
                <div><dt className="font-semibold text-navy">Fax</dt><dd className="text-muted">{site.fax}</dd></div>
                <div><dt className="font-semibold text-navy">Website</dt><dd className="text-muted">{site.website}</dd></div>
              </dl>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-outline mt-6">
                <MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp
              </a>
            </div>
            <ul className="space-y-4 text-sm">
              {offices.map((o) => (
                <li key={o.label}>
                  <span className="font-semibold text-navy">{o.label}.</span>{' '}
                  <span className="text-muted">{o.address}</span>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Phone size={16} className="text-brass" aria-hidden="true" />
              Call the head office on {site.phone}
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
