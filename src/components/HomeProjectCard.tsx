import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../data/projects'

export function HomeProjectCard({ project }: { project: Project }) {
  const preview = `/portfolio/${project.slug}-desktop`

  return (
    <article className="cf-home-project-card">
      <a href={`/realizacje/${project.slug}/`} className="cf-home-project-link">
        <img
          src={`${preview}-600.webp`}
          srcSet={`${preview}-600.webp 600w, ${preview}-1200.webp 1200w`}
          sizes="(min-width: 1200px) 355px, (min-width: 901px) calc((100vw - 96px) / 3), (min-width: 641px) calc(100vw - 48px), calc(100vw - 40px)"
          width={1200}
          height={834}
          loading="lazy"
          decoding="async"
          alt=""
        />
        <div className="cf-home-project-title">
          <h3>{project.title}</h3>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
      </a>
      {project.collaboration ? (
        <p className="cf-project-collaboration">Współpraca: {project.collaboration}</p>
      ) : null}
    </article>
  )
}
