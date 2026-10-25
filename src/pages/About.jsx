import { FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import TeamProfiles from '../components/TeamProfiles'
import {
  aboutLead, commitments, mission, offices, partnerships, site, values, valuesNote,
} from '../data/site'

export default function About() {
  return (
    <>
      <Seo
        title="About Omegason Integrated Energy Services"
        description="Omegason Integrated Energy Services Ltd was founded to transform energy access and build resilient infrastructure across Africa, with innovative, sustainable and affordable energy solutions."
        path="/about"
      />
      <PageHeader title="About Omegason">
        A trusted partner in the energy sector, founded to transform energy access across Africa.
      </PageHeader>

      <section className="bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-3xl font-semibold text-navy">The company</h2>
          </div>
          <div className="prose-copy text-lg leading-relaxed text-muted lg:col-span-8">
            {aboutLead.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-3xl font-semibold text-navy">Our mission</h2>
          </div>
          <div className="prose-copy text-lg leading-relaxed text-muted lg:col-span-8">
            {mission.map((p) => <p key={p}>{p}</p>)}
            <p>{commitments}</p>
            <a href={site.technicalPdf} target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
              <FileText size={18} aria-hidden="true" /> Download the 1 MW solar technical paper (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold text-navy">Core values</h2>
          <ul className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-5">
            {values.map((v) => (
              <li key={v} className="bg-white px-5 py-6 font-display text-xl font-semibold text-navy">{v}</li>
            ))}
          </ul>
          <p className="mt-6 max-w-4xl leading-relaxed text-muted">{valuesNote}</p>
        </div>
      </section>

      <section className="border-y border-line bg-paper px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-3xl font-semibold text-navy">Partnerships</h2>
          </div>
          <div className="prose-copy text-lg leading-relaxed text-muted lg:col-span-8">
            {partnerships.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold text-navy">Leadership</h2>
          <p className="mt-3 max-w-2xl text-muted">Staff profiles published by Omegason Integrated Energy Services.</p>
          <div className="mt-10">
            <TeamProfiles NameTag="h3" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold text-navy">Our offices</h2>
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
    </>
  )
}
