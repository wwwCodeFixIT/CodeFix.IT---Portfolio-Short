import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type GuideHeading = { id: string; title: string }

export function GuideNavigation({ items }: { items: readonly GuideHeading[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const disclosure = useRef<HTMLDetailsElement>(null)

  useLayoutEffect(() => {
    const id = window.location.hash.slice(1)
    if (!items.some((item) => item.id === id)) return
    const target = document.getElementById(id)
    target?.scrollIntoView({ block: 'start', behavior: 'instant' })
    target?.focus({ preventScroll: true })
  }, [items])

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null)
    let frame = 0
    const updateCurrent = () => {
      frame = 0
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let current = headings[0]
      for (const heading of headings) {
        // Native history may restore just below the exact anchor offset.
        // At the page end the last heading cannot always reach this band.
        if (!atEnd && heading.getBoundingClientRect().top > 201) break
        current = heading
      }
      if (current) setActive(current.id)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateCurrent)
    }
    const focusHashTarget = () => {
      const id = window.location.hash.slice(1)
      if (items.some((item) => item.id === id)) {
        document.getElementById(id)?.focus({ preventScroll: true })
      }
      scheduleUpdate()
    }
    const contents = disclosure.current
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', focusHashTarget)
    contents?.addEventListener('toggle', scheduleUpdate)
    scheduleUpdate()
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', focusHashTarget)
      contents?.removeEventListener('toggle', scheduleUpdate)
    }
  }, [items])

  return (
    <details
      className="guide-toc"
      ref={disclosure}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !disclosure.current?.open) return
        event.preventDefault()
        disclosure.current.open = false
        disclosure.current.querySelector('summary')?.focus({ preventScroll: true })
      }}
    >
      <summary>
        Spis treści
        <span aria-hidden="true">
          {Math.max(
            0,
            items.findIndex((item) => item.id === active),
          ) + 1}{' '}
          / {items.length}
        </span>
      </summary>
      <nav aria-label="Spis treści poradnika">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return
                  if (disclosure.current) disclosure.current.open = false
                  document.getElementById(item.id)?.focus({ preventScroll: true })
                }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
