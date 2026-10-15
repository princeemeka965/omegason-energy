import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { site } from '../data/site'
import { usePhases } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { looksLikeHtml, plainText } from '../lib/text'

function RichCopy({ value, paragraphs, className }) {
  if (looksLikeHtml(value)) {
    return <div className={`rich-copy ${className || ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />
  }
  const parts = paragraphs?.length ? paragraphs : String(value || '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return (
    <div className={className}>
      {parts.map((paragraph, index) => (
        <p key={index} className={index ? 'mt-4' : undefined}>{paragraph}</p>
      ))}
    </div>
  )
}

export default function Projects() {
  const { phases } = usePhases()
  const single = phases.length === 1 ? phases[0] : null
  const cover = phases.flatMap((phase) => phase.stories).find((story) => story.image)?.image || '/media/healthcare.jpg'
  const title = single ? `${single.name} Energy Projects` : 'Energy Projects'
  const description = single
    ? plainText(single.lead)
    : 'Reliable electricity projects from Omegason, told phase by phase.'

  return (
    <>
      <Seo title={title} description={description} path="/projects" image={cover} />
      <PageHeader title={single ? single.name : 'Projects'}>
        {single ? <RichCopy value={single.lead} className="rich-on-navy" /> : 'Project notes from each phase of the work.'}
      </PageHeader>

      {phases.length === 0 && (
        <section className="bg-white px-6 py-16 md:px-10">
          <p className="mx-auto max-w-7xl text-lg text-muted">Project notes will appear here.</p>
        </section>
      )}

      {phases.map((phase) => (
        <section key={phase.id} className="bg-white px-6 py-8 md:px-10">
          <div className="mx-auto max-w-7xl">
            {phases.length > 1 && (
              <header className="border-b border-line pb-8 pt-6">
                <h2 className="font-display text-3xl font-semibold text-navy">{phase.name}</h2>
                <RichCopy value={phase.lead} className="mt-3 max-w-3xl text-lg text-muted" />
              </header>
            )}
            <div className="divide-y divide-line">
              {phase.stories.map((story) => (
                <article key={story.id} className="grid gap-8 py-12 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    {story.image && (
                      <img src={story.image} alt={story.title} className="aspect-[16/10] w-full object-cover" />
                    )}
                  </div>
                  <div className="lg:col-span-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">{phase.name}</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold text-navy">{story.title}</h2>
                    <RichCopy value={story.body} paragraphs={story.paragraphs} className="mt-4 text-lg leading-relaxed text-muted" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-line bg-paper px-6 py-16 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy">Technical note</h2>
            <p className="mt-2 max-w-xl text-muted">Read the paper on executing a 1 megawatt interconnected solar plant, or speak with the team about a site of your own.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={site.technicalPdf} target="_blank" rel="noreferrer" className="btn btn-primary">
              <FileText size={18} aria-hidden="true" /> Technical paper (PDF)
            </a>
            <Link to="/contact" className="btn btn-outline">Discuss a project</Link>
          </div>
        </div>
      </section>
    </>
  )
}
