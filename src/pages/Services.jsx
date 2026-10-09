import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import Icon from '../components/Icon'
import { divisions, focusAreas } from '../data/site'

export default function Services() {
  return (
    <>
      <Seo
        title="Energy Services"
        description="Omegason designs and maintains distribution networks, generation projects and electrical infrastructure, including solar, hydro, wind, storage, research and energy advisory."
        path="/services"
      />
      <PageHeader title="Services">
        Renewable power, electrical infrastructure, storage, maintenance, research and advisory — delivered as one integrated practice.
      </PageHeader>

      <section className="bg-white">
        {focusAreas.map((area, i) => (
          <article key={area.id} id={area.id} className={`scroll-mt-28 px-6 py-16 md:px-10 md:py-20 ${i % 2 ? 'bg-paper' : 'bg-white'}`}>
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">{area.kicker}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy">{area.headline}</h2>
              </div>
              <div className="prose-copy text-lg leading-relaxed text-muted lg:col-span-8">
                {area.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-line bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold text-navy">Operating divisions</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {divisions.map((d) => (
              <article key={d.id} id={d.id} className="grid scroll-mt-28 gap-6 py-10 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Icon name={d.icon} size={22} className="text-brass" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-navy">{d.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">{d.summary}</p>
                </div>
                <ul className="space-y-3 md:col-span-7">
                  {d.points.map((p) => (
                    <li key={p} className="flex gap-3 leading-relaxed text-ink">
                      <Check className="mt-1 shrink-0 text-brass" size={18} aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-6 py-14 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl font-display text-3xl font-semibold">Tell us what you need to power.</h2>
          <Link to="/contact" className="btn btn-light">Contact our team</Link>
        </div>
      </section>
    </>
  )
}
