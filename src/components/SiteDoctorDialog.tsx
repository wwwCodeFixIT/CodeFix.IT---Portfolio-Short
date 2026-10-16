import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import './SiteDoctorDialog.css'

const SiteDoctor = lazy(() =>
  import('./SiteDoctor').catch(() => ({
    default: () => (
      <p role="alert">Nie udało się załadować diagnozy. Wróć do zgłoszenia i spróbuj ponownie.</p>
    ),
  })),
)

type Props = {
  initialUrl: string
  onAttach: (summary: string) => void
  onClose: () => void
}

export function SiteDoctorDialog({ initialUrl, onAttach, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPress = useRef(false)

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

  function dismiss() {
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="cf-doctor-dialog"
      aria-labelledby="cf-doctor-dialog-title"
      onClose={onClose}
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
          )
            dismiss()
        }
        backdropPress.current = false
      }}
    >
      <header className="cf-doctor-dialog-header">
        <div>
          <h2 id="cf-doctor-dialog-title" tabIndex={-1} autoFocus>
            Diagnoza strony
          </h2>
          <p>Wpisane informacje pozostają w formularzu.</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Zamknij diagnozę">
          Zamknij ×
        </button>
      </header>
      <Suspense fallback={<p role="status">Ładuję Site Doctor…</p>}>
        <SiteDoctor
          initialUrl={initialUrl}
          onAttach={(summary) => {
            onAttach(summary)
            dismiss()
          }}
          onDismiss={dismiss}
        />
      </Suspense>
    </dialog>
  )
}
