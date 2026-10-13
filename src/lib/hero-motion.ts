type Bounds = { left: number; top: number; width: number; height: number }
type PointerTarget = {
  getBoundingClientRect: () => Bounds
  style: { setProperty: (name: string, value: string) => void }
}
type FrameClock = { request: (callback: () => void) => number; cancel: (id: number) => void }

const origin = { rotateX: 0, rotateY: 0, lightX: 0, lightY: 0 }

export function heroPointerMotion(x: number, y: number, bounds: Bounds) {
  if (
    ![x, y, bounds.left, bounds.top, bounds.width, bounds.height].every(Number.isFinite) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  )
    return origin
  const clamp = (value: number) => Math.max(-1, Math.min(1, value))
  const horizontal = clamp(((x - bounds.left) / bounds.width) * 2 - 1)
  const vertical = clamp(((y - bounds.top) / bounds.height) * 2 - 1)
  return {
    rotateX: -vertical * 5,
    rotateY: horizontal * 7,
    lightX: horizontal * 18,
    lightY: vertical * 12,
  }
}

export function createHeroPointerController(target: () => PointerTarget | null, clock: FrameClock) {
  let frame: number | null = null
  let latestX = 0
  let latestY = 0

  function apply(value: typeof origin) {
    const element = target()
    if (!element) return
    element.style.setProperty('--cf-rotate-x', `${value.rotateX.toFixed(2)}deg`)
    element.style.setProperty('--cf-rotate-y', `${value.rotateY.toFixed(2)}deg`)
    element.style.setProperty('--cf-light-x', `${value.lightX.toFixed(2)}px`)
    element.style.setProperty('--cf-light-y', `${value.lightY.toFixed(2)}px`)
  }

  return {
    move(x: number, y: number) {
      latestX = x
      latestY = y
      if (frame !== null) return
      frame = clock.request(() => {
        frame = null
        const element = target()
        if (element) apply(heroPointerMotion(latestX, latestY, element.getBoundingClientRect()))
      })
    },
    reset() {
      if (frame !== null) clock.cancel(frame)
      frame = null
      apply(origin)
    },
  }
}

export type HeroPointerController = ReturnType<typeof createHeroPointerController>
