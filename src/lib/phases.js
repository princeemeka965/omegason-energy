// Offline copy used only when the admin API cannot be reached.
import { projects } from '../data/site'

const featuredIds = new Set(['university', 'business', 'classrooms'])

export const fallbackPhases = [
  {
    id: 'phase-one',
    slug: 'phase-one',
    name: 'Phase One',
    headline: 'What changed when the power stayed on',
    lead: 'Reliable electricity for a university, a primary school, local businesses and hundreds of households.',
    published: true,
    position: 0,
    stories: projects.map((project, position) => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      body: project.paragraphs.join('\n\n'),
      paragraphs: project.paragraphs,
      image: project.image || null,
      featured: featuredIds.has(project.id),
      position,
    })),
  },
]

export function homePhase(phases) {
  return phases.find((phase) => phase.stories.some((story) => story.featured)) || phases[0] || null
}

export function homeStories(phase) {
  if (!phase) return []
  const featured = phase.stories.filter((story) => story.featured)
  return (featured.length ? featured : phase.stories).slice(0, 3)
}
