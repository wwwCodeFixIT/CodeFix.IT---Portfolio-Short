import type { Project } from '../data/projects'
import './ProjectPreview.css'

type ProjectPreviewProps = {
  project: Project
  gallery?: boolean
}

export function ProjectPreview({ project, gallery = false }: ProjectPreviewProps) {
  const desktop = `/portfolio/${project.slug}-desktop-1200.webp`
  const desktopSmall = `/portfolio/${project.slug}-desktop-600.webp`
  const mobile = `/portfolio/${project.slug}-mobile-375.webp`

  if (gallery) {
    return (
      <div className="project-preview-gallery">
        <figure>
          <a
            href={desktop}
            target="_blank"
            rel="noreferrer"
            aria-label={`Otwórz pełny podgląd komputerowy: ${project.title} (nowa karta)`}
          >
            <img
              src={desktop}
              srcSet={`${desktopSmall} 600w, ${desktop} 1200w`}
              sizes="(min-width: 901px) 900px, (min-width: 641px) 65vw, calc(100vw - 48px)"
              width={1200}
              height={834}
              loading="lazy"
              decoding="async"
              alt={`${project.title} — wygląd aktualnej strony na komputerze`}
            />
          </a>
          <figcaption>Wersja komputerowa</figcaption>
        </figure>
        <figure className="project-preview-gallery-mobile">
          <a
            href={mobile}
            target="_blank"
            rel="noreferrer"
            aria-label={`Otwórz pełny podgląd mobilny: ${project.title} (nowa karta)`}
          >
            <img
              src={mobile}
              width={375}
              height={800}
              loading="lazy"
              decoding="async"
              alt={`${project.title} — wygląd aktualnej strony na telefonie`}
            />
          </a>
          <figcaption>Wersja mobilna</figcaption>
        </figure>
      </div>
    )
  }

  return (
    <a
      className="project-preview"
      href={`/realizacje/${project.slug}/`}
      aria-label={`Zobacz realizację: ${project.title}`}
    >
      <div className="project-preview-desktop" aria-hidden="true">
        <div className="project-preview-bar">
          <span />
          <span />
          <span />
        </div>
        <img
          src={desktopSmall}
          srcSet={`${desktopSmall} 600w, ${desktop} 1200w`}
          sizes="(min-width: 1101px) 360px, (min-width: 701px) 650px, calc(100vw - 80px)"
          width={1200}
          height={834}
          loading="lazy"
          decoding="async"
          alt=""
        />
      </div>
      <img
        className="project-preview-mobile"
        src={mobile}
        width={375}
        height={800}
        loading="lazy"
        decoding="async"
        alt=""
      />
    </a>
  )
}
