import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Seo from '../components/Seo'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { divisions, focusAreas, mission, offices, welcome } from '../data/site'
import { usePhases, useProducts } from '../lib/api'
import { homePhase, homeStories } from '../lib/phases'

function SectionLabel({ children }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">{children}</p>
}

export default function Home() {
  const { products } = useProducts()
  const { phases } = usePhases()
  const homeProducts = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ].slice(0, 6)
  const phase = homePhase(phases)
  const stories = homeStories(phase)

  return (
    <>
      <Seo
        title="Omegason Integrated Energy Services | Solar, Hydro and Grids"
        description={welcome.lead}
        path="/"
      />
      <Hero />

      {homeProducts.length > 0 && (
        <section className="border-b border-line bg-white px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel>Products</SectionLabel>
                <h2 className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">Solar equipment</h2>
              </div>
              <Link to="/products" className="btn btn-outline">View all products</Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {homeProducts.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-line px-6 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-10">
          {[
            ['5', 'Offices in Nigeria and the United Kingdom'],
            ['6', 'Divisions, from generation through to advisory'],
            ['Phase One', 'Complete, with Phase Two to follow'],
          ].map(([n, label]) => (
            <div key={label} className="py-8 md:px-8 md:first:pl-0">
              <p className="font-display text-3xl font-semibold text-navy">{n}</p>
              <p className="mt-1 max-w-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel>Our mission</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
              Energy that transforms lives and protects the environment
            </h2>
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-muted lg:col-span-8">
            {mission.slice(0, 2).map((p) => <p key={p}>{p}</p>)}
            <Link to="/about" className="inline-block font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
              Read about the company
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>What we deliver</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
            Distribution, generation and industry
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {focusAreas.map((area) => (
              <article key={area.id} className="flex flex-col border border-line bg-white p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">{area.kicker}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-navy">{area.headline}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{area.teaser}</p>
                <Link to={`/services#${area.id}`} className="mt-6 text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
                  Read more
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>Divisions</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">One company, six practices</h2>
            </div>
            <Link to="/services" className="btn btn-outline">All services</Link>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((d) => (
              <li key={d.id} className="bg-white p-7">
                <Icon name={d.icon} size={22} className="text-brass" />
                <h3 className="mt-4 font-display text-xl font-semibold text-navy">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {phase && stories.length > 0 && (
        <section className="border-y border-line bg-paper px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>{phase.name}</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-navy md:text-4xl">
              {phase.headline}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {stories.map((story) => (
                <article key={story.id} className="border border-line bg-white">
                  {story.image ? (
                    <img src={story.image} alt={story.title} className="aspect-[16/10] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/10] bg-white" />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">{phase.name}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-navy">{story.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{story.summary}</p>
                  </div>
                </article>
              ))}
            </div>
            <Link to="/projects" className="btn btn-primary mt-8">Read the project notes</Link>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-paper px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Where we work</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy md:text-4xl">Our offices</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offices.map((o) => (
              <li key={o.label} className="border border-line bg-white p-5">
                <h3 className="font-semibold text-navy">{o.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{o.address}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy px-6 py-16 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">A sustainable partnership</h2>
            <p className="mt-3 text-white/75">
              From the smallest solar installation in a village to major grid expansions for national utilities, we tailor our services to deliver lasting impact.
            </p>
          </div>
          <Link to="/contact" className="btn btn-light">Contact us</Link>
        </div>
      </section>
    </>
  )
}
