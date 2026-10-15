export function homePhase(phases) {
  return phases.find((phase) => phase.stories.some((story) => story.featured)) || phases[0] || null
}

export function homeStories(phase) {
  if (!phase) return []
  const featured = phase.stories.filter((story) => story.featured)
  return (featured.length ? featured : phase.stories).slice(0, 3)
}
