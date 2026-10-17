import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import homepageContent from '../data/homepage-content.json'
import './MobileNavigation.css'

export function MobileNavigation() {
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 981px)')
    const closeOnDesktop = () => {
      if (desktop.matches && panel.current?.matches(':popover-open')) panel.current.hidePopover()
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  function navigate(event: MouseEvent<HTMLElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const link = event.target instanceof Element ? event.target.closest('a') : null
    if (!link) return
    panel.current?.hidePopover()
    const href = link.getAttribute('href')
    // The homepage contact handler focuses the current form step itself.
    if (!href?.startsWith('#') || href === '#contact') return
    const heading = document.getElementById(href.slice(1))?.querySelector('h2')
    window.requestAnimationFrame(() => {
      if (!heading?.isConnected) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
      window.requestAnimationFrame(() => {
        if (heading.isConnected) heading.scrollIntoView({ block: 'start', behavior: 'instant' })
      })
    })
  }

  return (
    <>
      <button
        className="cf-mobile-menu-toggle"
        type="button"
        popoverTarget="cf-mobile-navigation"
        aria-controls="cf-mobile-navigation"
      >
        Menu
      </button>
      <nav
        ref={panel}
        id="cf-mobile-navigation"
        className="cf-mobile-navigation"
        aria-label="Nawigacja mobilna"
        popover="auto"
        onClick={navigate}
      >
        {homepageContent.navigation.map(({ href, label }) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </>
  )
}
