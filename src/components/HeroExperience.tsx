import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { createHeroPointerController } from '../lib/hero-motion'
import type { HeroPointerController } from '../lib/hero-motion'
import './HeroExperience.css'

const reducedQuery = '(prefers-reduced-motion: reduce)'
const pointerQuery = '(hover: hover) and (pointer: fine)'
const matches = (query: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches
const MotionContext = createContext({ enabled: false, available: false, toggle: () => {} })

const faces: { name: string; style: CSSProperties }[] = [
  { name: 'front', style: { transform: 'translateZ(12px)' } },
  { name: 'back', style: { transform: 'rotateY(180deg) translateZ(12px)' } },
  { name: 'right', style: { width: 24, left: 36, transform: 'rotateY(90deg) translateZ(48px)' } },
  { name: 'left', style: { width: 24, left: 36, transform: 'rotateY(-90deg) translateZ(48px)' } },
  { name: 'top', style: { height: 24, top: 36, transform: 'rotateX(90deg) translateZ(48px)' } },
  { name: 'bottom', style: { height: 24, top: 36, transform: 'rotateX(-90deg) translateZ(48px)' } },
]

export function HeroExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement | null>(null)
  const pointer = useRef<HeroPointerController | null>(null)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matches(reducedQuery))
  const [finePointer, setFinePointer] = useState(() => matches(pointerQuery))
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  )
  const available = finePointer && !reduced
  const enabled = available && !paused
  const running = enabled && inView && pageVisible

  useEffect(() => {
    pointer.current = createHeroPointerController(() => root.current, {
      request: (callback) => window.requestAnimationFrame(callback),
      cancel: (id) => window.cancelAnimationFrame(id),
    })
    const reduceMedia = window.matchMedia?.(reducedQuery)
    const pointerMedia = window.matchMedia?.(pointerQuery)
    const updateCapabilities = () => {
      setReduced(Boolean(reduceMedia?.matches))
      setFinePointer(Boolean(pointerMedia?.matches))
    }
    const updateVisibility = () => setPageVisible(!document.hidden)
    reduceMedia?.addEventListener('change', updateCapabilities)
    pointerMedia?.addEventListener('change', updateCapabilities)
    document.addEventListener('visibilitychange', updateVisibility)
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)))
    if (root.current) observer?.observe(root.current)
    return () => {
      reduceMedia?.removeEventListener('change', updateCapabilities)
      pointerMedia?.removeEventListener('change', updateCapabilities)
      document.removeEventListener('visibilitychange', updateVisibility)
      observer?.disconnect()
      pointer.current?.reset()
      pointer.current = null
    }
  }, [])

  useEffect(() => {
    if (!running) pointer.current?.reset()
  }, [running])

  function toggle() {
    pointer.current?.reset()
    setPaused((current) => !current)
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (running && event.pointerType === 'mouse')
      pointer.current?.move(event.clientX, event.clientY)
  }

  return (
    <MotionContext.Provider value={{ enabled, available, toggle }}>
      <section
        ref={root}
        className="cf-container cf-hero cf-hero-interactive"
        data-motion={running ? 'on' : 'off'}
        onPointerMove={move}
        onPointerLeave={() => pointer.current?.reset()}
      >
        <div className="cf-hero-atmosphere" aria-hidden="true" />
        {children}
      </section>
    </MotionContext.Provider>
  )
}

export function HeroEmblem() {
  const motion = useContext(MotionContext)
  return (
    <div className="cf-hero-emblem">
      <div className="cf-hero-stage" aria-hidden="true">
        <span className="cf-hero-orbit" />
        <div className="cf-hero-tilt">
          <div className="cf-hero-cube">
            {faces.map(({ name, style }) => (
              <span
                key={name}
                className={name === 'front' ? 'cf-face cf-face-front' : 'cf-face'}
                style={style}
              >
                {name === 'front' && (
                  <img
                    src="/brand/codefix-devil-mark.webp"
                    width="76"
                    height="76"
                    alt=""
                    decoding="async"
                    loading="lazy"
                    fetchPriority="low"
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="cf-hero-motion-control">
        <p>Diabeł tkwi w kodzie.</p>
        {motion.available ? (
          <button
            type="button"
            aria-label="Animacje w pierwszej sekcji"
            aria-pressed={motion.enabled}
            onClick={motion.toggle}
          >
            {motion.enabled ? 'Zatrzymaj ruch' : 'Włącz ruch'}
          </button>
        ) : (
          <span>Spokojny tryb</span>
        )}
      </div>
    </div>
  )
}
