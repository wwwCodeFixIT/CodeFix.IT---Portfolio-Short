import { useLayoutEffect, useRef, useState } from 'react'

type CopyState = 'idle' | 'copying' | 'copied' | 'manual'

export default function BriefCopy({
  service,
  pageUrl,
  message,
}: {
  service: string
  pageUrl: string
  message: string
}) {
  const text = [`Temat: ${service}`, pageUrl && `Adres strony: ${pageUrl}`, message]
    .filter(Boolean)
    .join('\n\n')
  const [result, setResult] = useState<{ text: string; state: CopyState }>({
    text: '',
    state: 'idle',
  })
  // Feedback describes the copied version, even if an attachment changes while copying.
  const state = result.text === text ? result.state : 'idle'
  const manualRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (state !== 'manual') return
    manualRef.current?.focus()
    manualRef.current?.select()
  }, [result, state])

  async function copyBrief() {
    setResult({ text, state: 'copying' })
    try {
      await navigator.clipboard.writeText(text)
      setResult({ text, state: 'copied' })
    } catch {
      setResult({ text, state: 'manual' })
    }
  }

  return (
    <>
      <button type="button" onClick={copyBrief} disabled={state === 'copying'}>
        {state === 'copying' ? 'Kopiuję…' : state === 'copied' ? 'Skopiowano' : 'Skopiuj brief'}
      </button>
      <span className="cf-brief-step-count" role="status">
        {state === 'copied' ? 'Brief jest w schowku.' : ''}
      </span>
      {state === 'manual' && (
        <label>
          <span>Skopiuj poniższy brief ręcznie</span>
          <textarea ref={manualRef} value={text} readOnly rows={5} />
        </label>
      )}
    </>
  )
}
