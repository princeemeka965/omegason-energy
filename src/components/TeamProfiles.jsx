import { team } from '../data/site'

const GRID_FROM = 'Mr Chimezie Alicho'

function initials(name) {
  return name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('')
}

function Portrait({ person, size = 'list' }) {
  const frame = size === 'card'
    ? 'mx-auto aspect-square w-full max-w-[160px] rounded-full object-cover object-top'
    : 'aspect-square w-full max-w-[220px] rounded-full object-cover object-top'
  const placeholder = size === 'card'
    ? 'mx-auto grid aspect-square w-full max-w-[160px] place-items-center rounded-full bg-navy font-display text-2xl font-semibold text-white'
    : 'grid aspect-square w-full max-w-[220px] place-items-center rounded-full bg-navy font-display text-3xl font-semibold text-white'

  if (person.image) {
    return <img src={person.image} alt={person.name} className={frame} />
  }
  return <div className={placeholder}>{initials(person.name)}</div>
}

export default function TeamProfiles({ NameTag = 'h2' }) {
  const split = team.findIndex((person) => person.name === GRID_FROM)
  const leaders = split === -1 ? team : team.slice(0, split)
  const staff = split === -1 ? [] : team.slice(split)

  return (
    <>
      <ul className="divide-y divide-line border-y border-line">
        {leaders.map((person) => (
          <li key={person.name} className="grid gap-6 py-8 md:grid-cols-12">
            <div className="md:col-span-3">
              <Portrait person={person} />
            </div>
            <div className="md:col-span-9">
              <NameTag className="font-display text-2xl font-semibold text-navy">{person.name}</NameTag>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-brass">{person.role}</p>
              {person.bio && <p className="mt-4 max-w-3xl leading-relaxed text-muted">{person.bio}</p>}
            </div>
          </li>
        ))}
        {staff.map((person) => (
          <li key={`mobile-${person.name}`} className="grid gap-6 py-8 sm:hidden md:grid-cols-12">
            <div className="md:col-span-3">
              <Portrait person={person} />
            </div>
            <div className="md:col-span-9">
              <NameTag className="font-display text-2xl font-semibold text-navy">{person.name}</NameTag>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-brass">{person.role}</p>
            </div>
          </li>
        ))}
      </ul>

      {staff.length > 0 && (
        <ul className="mt-10 hidden gap-8 sm:grid sm:grid-cols-2">
          {staff.map((person) => (
            <li key={person.name} className="px-2 py-4 text-center sm:px-6">
              <Portrait person={person} size="card" />
              <NameTag className="mt-5 font-display text-xl font-semibold text-navy">{person.name}</NameTag>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-brass">{person.role}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
