import { useLayoutEffect, useRef, useState } from 'react'
import type { Project } from '../data/projects'
import './ProjectQuickView.css'

type Props = {
  project: Project
  onClose: () => void
  onEnquire: (project: Project) => void
}

export default function ProjectQuickView({ project, onClose, onEnquire }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPress = useRef(false)
  const [mobile, setMobile] = useState(false)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="project-quick-view"
      aria-labelledby="project-quick-title"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey) return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href]',
        )
        const first = controls.item(0)
        const last = controls.item(controls.length - 1)
        const active = document.activeElement
        const target = event.shiftKey
          ? active === first || active?.id === 'project-quick-title'
            ? last
            : null
          : active === last
            ? first
            : null
        if (target) {
          event.preventDefault()
          target.focus()
        }
      }}
      onPointerDown={(event) => {
        backdropPress.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (backdropPress.current && event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            event.currentTarget.close()
          }
        }
        backdropPress.current = false
      }}
    >
      <div className="project-quick-header">
        <div>
          <p>
            {project.year}
            {project.collaboration
              ? ` · Współpraca z ${project.collaboration}`
              : ' · Strona firmowa'}
          </p>
          <h2 id="project-quick-title" tabIndex={-1} autoFocus>
            {project.title}
          </h2>
        </div>
        <button
          className="project-quick-close"
          type="button"
          aria-label="Zamknij podgląd realizacji"
          onClick={() => dialogRef.current?.close()}
        >
          Zamknij <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="project-quick-body">
        <div>
          <div className="project-quick-devices" role="group" aria-label="Widok realizacji">
            <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>
              Komputer
            </button>
            <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}>
              Telefon
            </button>
          </div>
          <figure className={`project-quick-image${mobile ? ' is-mobile' : ''}`}>
            <img
              key={mobile ? 'mobile' : 'desktop'}
              src={`/portfolio/${project.slug}-${mobile ? 'mobile-375' : 'desktop-1200'}.webp`}
              srcSet={
                mobile
                  ? undefined
                  : `/portfolio/${project.slug}-desktop-600.webp 600w, /portfolio/${project.slug}-desktop-1200.webp 1200w`
              }
              sizes={mobile ? undefined : '(min-width: 761px) 560px, calc(100vw - 56px)'}
              width={mobile ? 375 : 1200}
              height={mobile ? 800 : 834}
              decoding="async"
              alt={`${project.title} — widok na ${mobile ? 'telefonie' : 'komputerze'}`}
            />
          </figure>
        </div>
        <dl className="project-quick-description">
          <div>
            <dt>Cel</dt>
            <dd>{project.goal}</dd>
          </div>
          <div>
            <dt>Mój zakres</dt>
            <dd>{project.contribution}</dd>
          </div>
          <div>
            <dt>Efekt</dt>
            <dd>{project.result}</dd>
          </div>
        </dl>
      </div>
      <div className="project-quick-actions">
        <button type="button" onClick={() => onEnquire(project)}>
          Chcę podobną stronę <span aria-hidden="true">→</span>
        </button>
        <a href={`/realizacje/${project.slug}/`}>
          Pełny opis realizacji <span aria-hidden="true">↗</span>
        </a>
      </div>
    </dialog>
  )
}
