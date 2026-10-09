export default function PageHeader({ eyebrow = 'Omegason Integrated Energy Services', title, children }) {
  return (
    <section className="border-b border-line bg-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass-soft">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        {children && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">{children}</p>}
      </div>
    </section>
  )
}
