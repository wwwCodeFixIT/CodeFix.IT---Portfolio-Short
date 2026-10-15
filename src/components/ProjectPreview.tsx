import { createContext, lazy, Suspense, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Project } from '../data/projects'
import './ProjectPreview.css'

const ProjectQuickView = lazy(() =>
  import('./ProjectQuickView').catch(() => ({
    default: ({ project, onClose }: { project: Project; onClose: () => void }) => (
      <p role="status">
        Podgląd jest chwilowo niedostępny.{' '}
        <a href={`/realizacje/${project.slug}/`}>Przejdź do opisu realizacji</a>.{' '}
        <button type="button" onClick={onClose}>
          Zamknij komunikat
        </button>
      </p>
    ),
  })),
)

type ProjectPreviewProps = {
  project: Project
  gallery?: boolean
}

const QuickViewContext = createContext<((project: Project) => void) | null>(null)

export function ProjectPreviewGroup({
  children,
  onEnquire,
}: {
  children: ReactNode
  onEnquire: (project: Project) => void
}) {
  const [active, setActive] = useState<Project | null>(null)
  return (
    <QuickViewContext.Provider value={setActive}>
      {children}
      {active && (
        <Suspense fallback={<p role="status">Ładuję podgląd realizacji…</p>}>
          <ProjectQuickView
            key={active.slug}
            project={active}
            onClose={() => setActive(null)}
            onEnquire={(project) => {
              setActive(null)
              onEnquire(project)
            }}
          />
        </Suspense>
      )}
    </QuickViewContext.Provider>
  )
}

export function ProjectReference({
  project,
  onRemove,
}: {
  project: Project
  onRemove: () => void
}) {
  return (
    <div className="project-reference" role="group" aria-label="Wybrana realizacja">
      <p>
        Punkt odniesienia<strong>{project.title}</strong>
      </p>
      <button
        type="button"
        onClick={(event) => {
          onRemove()
          event.currentTarget
            .closest('[data-brief-step]')
            ?.querySelector<HTMLElement>('[data-step-heading]')
            ?.focus({ preventScroll: true })
        }}
        aria-label="Usuń wybraną realizację"
      >
        Usuń
      </button>
    </div>
  )
}

export function ProjectPreview({ project, gallery = false }: ProjectPreviewProps) {
  const openQuickView = useContext(QuickViewContext)
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

  const thumbnail = (
    <>
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
    </>
  )

  return (
    <>
      {openQuickView ? (
        <button
          className="project-preview"
          type="button"
          aria-label={`Podgląd realizacji: ${project.title}`}
          aria-haspopup="dialog"
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true })
            openQuickView(project)
          }}
        >
          {thumbnail}
          <span className="project-preview-label" aria-hidden="true">
            Podgląd ↗
          </span>
        </button>
      ) : (
        <a
          className="project-preview"
          href={`/realizacje/${project.slug}/`}
          aria-label={`Zobacz realizację: ${project.title}`}
        >
          {thumbnail}
        </a>
      )}
    </>
  )
}
