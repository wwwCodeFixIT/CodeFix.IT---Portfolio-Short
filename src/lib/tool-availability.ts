import { useSyncExternalStore } from 'react'

type Availability = { ai: boolean; doctor: boolean; state: 'loading' | 'ready' | 'error' }
const loading: Availability = { ai: false, doctor: false, state: 'loading' }
let snapshot = loading
let running = false
const listeners = new Set<() => void>()

function publish(next: Availability) {
  snapshot = next
  for (const listener of listeners) listener()
}

export async function refreshToolAvailability() {
  if (running) return
  running = true
  publish(loading)
  try {
    const response = await fetch('/api/tool-status', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw Error()
    const data: unknown = await response.json()
    if (
      !data ||
      typeof data !== 'object' ||
      !('ai' in data) ||
      !('doctor' in data) ||
      typeof data.ai !== 'boolean' ||
      typeof data.doctor !== 'boolean'
    )
      throw Error()
    publish({ ai: data.ai, doctor: data.doctor, state: 'ready' })
  } catch {
    publish({ ai: false, doctor: false, state: 'error' })
  } finally {
    running = false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (snapshot.state === 'loading' && !running) void refreshToolAvailability()
  return () => {
    listeners.delete(listener)
  }
}

export function useToolAvailability() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => loading,
  )
}
