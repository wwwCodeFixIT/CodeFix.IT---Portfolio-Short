import { useLayoutEffect, useRef, useState } from 'react'

export function ProjectLinkCopy({ slug }: { slug: string }) {
  const url = `https://codefix.it/realizacje/${slug}/`
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'manual'>('idle')
  const manualRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (state !== 'manual') return
    manualRef.current?.focus()
    manualRef.current?.select()
  }, [state])

  async function copy() {
    setState('copying')
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      setState('manual')
    }
  }

  return (
    <>
      <button type="button" onClick={copy} disabled={state === 'copying'}>
        {state === 'copying' ? 'Kopiuję…' : state === 'copied' ? 'Skopiowano link' : 'Skopiuj link'}
      </button>
      <span className="project-link-status" role="status">
        {state === 'copied'
          ? 'Link do realizacji jest w schowku.'
          : state === 'manual'
            ? 'Schowek jest niedostępny. Skopiuj zaznaczony adres ręcznie.'
            : ''}
      </span>
      {state === 'manual' && (
        <label className="project-link-manual">
          Skopiuj adres ręcznie
          <input ref={manualRef} type="url" value={url} readOnly />
        </label>
      )}
    </>
  )
}
