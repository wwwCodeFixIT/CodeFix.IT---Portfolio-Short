import { useId, useState } from 'react'
import type { Project } from '../data/projects'
import { projectInsights } from '../data/project-insights'

export function ProjectInsights({ project, mobile }: { project: Project; mobile: boolean }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const id = useId()
  const points = projectInsights[project.slug] ?? []
  const active = points[selected]

  return (
    <>
      {points.length > 0 && (
        <button
          type="button"
          className="project-insight-toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            setOpen(!open)
            setSelected(0)
          }}
        >
          Co tutaj zrobiłem? <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
      )}
      <div id={id}>
        <figure className={`project-quick-image${mobile ? ' is-mobile' : ''}`}>
          <div className="project-quick-canvas">
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
            {open && (
              <div role="group" aria-label="Punkty na podglądzie realizacji">
                {points.map((point, index) => {
                  const [x, y] = mobile ? point.mobile : point.desktop
                  return (
                    <button
                      key={point.title}
                      type="button"
                      className="project-insight-point"
                      style={{
                        left: `clamp(23px, ${x}%, calc(100% - 23px))`,
                        top: `clamp(23px, ${y}%, calc(100% - 23px))`,
                      }}
                      aria-label={`${index + 1}. ${point.title}`}
                      aria-pressed={selected === index}
                      aria-controls={`${id}-description`}
                      onClick={() => setSelected(index)}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </figure>
        <div
          id={`${id}-description`}
          className="project-insight-description"
          aria-live="polite"
          aria-atomic="true"
          hidden={!open}
        >
          {open && active && (
            <>
              <p className="project-insight-instruction">
                Wybierz numer na zrzucie, aby poznać zakres prac.
              </p>
              <h3>
                {selected + 1}. {active.title}
              </h3>
              <p>{active.description}</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
