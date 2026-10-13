import type { WordPressGuide } from '../data/wordpress-guides'

let catalogPromise: Promise<WordPressGuide[]> | null = null

export function loadWordPressGuideCatalog(): Promise<WordPressGuide[]> {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/wordpress-guides.json', { cache: 'no-cache' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Nie udało się załadować poradników.')
        const guides: unknown = await response.json()
        if (!Array.isArray(guides) || !guides.length)
          throw new Error('Nieprawidłowy katalog poradników.')
        return guides as WordPressGuide[]
      })
      .catch((error: unknown) => {
        catalogPromise = null
        throw error
      })
  }
  return catalogPromise
}
