import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides, welcome } from '../data/site'

const INTERVAL_MS = 6500

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = heroSlides.length

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || paused) return undefined
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused, count])

  const go = (next) => setIndex((next + count) % count)

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">{welcome.kicker}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-navy md:text-5xl">
            {welcome.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{welcome.lead}</p>
          <p className="mt-4 text-xl font-semibold text-navy md:text-2xl">{welcome.focus}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/services" className="btn btn-outline">Our services</Link>
          </div>
        </div>
        <figure
          className="overflow-hidden rounded-xl border border-line bg-white"
          aria-roledescription="carousel"
          aria-label="Energy work"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              go(index - 1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              go(index + 1)
            }
          }}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
            {heroSlides.map((slide, i) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={i === index ? slide.alt : ''}
                aria-hidden={i !== index}
                className={`absolute inset-0 h-full w-full object-cover motion-reduce:transition-none transition-opacity duration-700 ${
                  i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              />
            ))}
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute top-1/2 left-3 grid h-9 w-9 -translate-y-1/2 place-items-center border border-line bg-white text-navy"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center border border-line bg-white text-navy"
              aria-label="Next image"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <figcaption className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-muted">
            <span>{heroSlides[index].caption}</span>
            <div className="flex shrink-0 gap-1.5" role="group" aria-label="Choose image">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={slide.caption}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                  className="grid h-6 w-6 place-items-center"
                >
                  <span className={`h-2 w-2 rounded-full ${i === index ? 'bg-navy' : 'bg-line'}`} />
                </button>
              ))}
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
