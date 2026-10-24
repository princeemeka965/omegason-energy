import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { team } from '../data/site'

function initials(name) {
  return name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('')
}

export default function Leadership() {
  return (
    <>
      <Seo
        title="Leadership"
        description="Leadership of Omegason Integrated Energy Services: the chairman, chief executive, finance and operations leads who run the company."
        path="/leadership"
      />
      <PageHeader title="Leadership">
        Meet our team
      </PageHeader>

      <section className="bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <ul className="divide-y divide-line border-y border-line">
            {team.map((person) => (
              <li key={person.name} className="grid gap-6 py-8 md:grid-cols-12">
                <div className="md:col-span-3">
                  {person.image ? (
                    <img src={person.image} alt={person.name} className="aspect-square w-full max-w-[220px] rounded-full object-cover object-top" />
                  ) : (
                    <div className="grid aspect-square w-full max-w-[220px] place-items-center rounded-full bg-navy font-display text-3xl font-semibold text-white">
                      {initials(person.name)}
                    </div>
                  )}
                </div>
                <div className="md:col-span-9">
                  <h2 className="font-display text-2xl font-semibold text-navy">{person.name}</h2>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-brass">{person.role}</p>
                  {person.bio && <p className="mt-4 max-w-3xl leading-relaxed text-muted">{person.bio}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
