import { Link } from 'react-router-dom'
import { welcome } from '../data/site'

export default function Hero() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">{welcome.kicker}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-navy md:text-5xl">
            {welcome.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{welcome.lead}</p>
          <p className="mt-4 font-semibold text-navy">{welcome.focus}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary">Sustainable partnership</Link>
            <Link to="/services" className="btn btn-outline">Our services</Link>
          </div>
        </div>
        <figure className="overflow-hidden border border-line bg-white">
          <img
            src="/media/hybrid.jpg"
            alt="Solar arrays, wind turbines and a hydroelectric dam operating together"
            className="aspect-[16/10] w-full object-cover"
          />
          <figcaption className="border-t border-line px-4 py-3 text-sm text-muted">
            Solar, Hydro, and Electro Grids.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
