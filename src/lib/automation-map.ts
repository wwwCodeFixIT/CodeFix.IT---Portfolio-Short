export type ProcessId = 'inquiries' | 'orders' | 'documents' | 'support'
export type SystemId = 'form' | 'email' | 'crm' | 'sheet' | 'store' | 'files'

export const systemNames: Record<SystemId, string> = {
  form: 'Formularz WWW',
  email: 'Skrzynka e-mail',
  crm: 'CRM',
  sheet: 'Arkusz kalkulacyjny',
  store: 'Sklep internetowy',
  files: 'Dysk z dokumentami',
}

type Process = {
  label: string
  sources: SystemId[]
  destinations: SystemId[]
  validation: string
  task: string
  aiTask: string
  exception: string
}

export const automationProcesses: Record<ProcessId, Process> = {
  inquiries: {
    label: 'Obsługa zapytań',
    sources: ['form', 'email', 'sheet'],
    destinations: ['crm', 'sheet', 'email'],
    validation: 'Sprawdź temat, dane kontaktowe i zgodę na kontakt, jeśli jest wymagana.',
    task: 'Uporządkuj zapytanie według tematu i przygotuj listę danych do uzupełnienia.',
    aiTask: 'Przygotuj robocze podsumowanie zapytania i szkic odpowiedzi.',
    exception:
      'Niekompletne zapytanie trafia do ręcznego sprawdzenia. Zapis powinien rozpoznawać duplikaty.',
  },
  orders: {
    label: 'Obsługa zamówień',
    sources: ['store', 'email', 'sheet'],
    destinations: ['sheet', 'crm', 'email'],
    validation: 'Sprawdź numer zamówienia, pozycje i dane potrzebne do obsługi.',
    task: 'Uporządkuj pozycje zamówienia i przygotuj zestawienie do realizacji.',
    aiTask: 'Przygotuj robocze podsumowanie zamówienia i uwagi dla obsługi.',
    exception:
      'Brak numeru, niezgodne pozycje lub ponowione zamówienie wymagają ręcznego sprawdzenia.',
  },
  documents: {
    label: 'Porządkowanie dokumentów',
    sources: ['files', 'email', 'form'],
    destinations: ['sheet', 'files', 'crm'],
    validation: 'Sprawdź typ pliku, czytelność i komplet wymaganych danych.',
    task: 'Przypisz dokument według ustalonych reguł i przygotuj wpis w rejestrze.',
    aiTask: 'Przygotuj robocze streszczenie dokumentu i proponowaną kategorię.',
    exception:
      'Nieczytelny plik lub brakujące dane trafiają do ręcznego sprawdzenia, bez dopisywania domysłów.',
  },
  support: {
    label: 'Obsługa zgłoszeń',
    sources: ['email', 'form', 'crm'],
    destinations: ['crm', 'sheet', 'email'],
    validation: 'Sprawdź opis problemu, kontakt i informacje potrzebne do odtworzenia błędu.',
    task: 'Nadaj kategorię według reguł i przygotuj zgłoszenie do dalszej obsługi.',
    aiTask: 'Przygotuj robocze podsumowanie problemu i pytania uzupełniające.',
    exception:
      'Pilne, niejasne lub niekompletne zgłoszenie trafia bezpośrednio do ręcznej obsługi.',
  },
}

export type AutomationConfig = {
  process: ProcessId
  source: SystemId
  destination: SystemId
  useAi: boolean
  review: boolean
  note: string
}

export type AutomationStep = {
  id: 'input' | 'validate' | 'prepare' | 'review' | 'output'
  title: string
  mode: string
  detail: string
}

export function initialAutomationConfig(): AutomationConfig {
  return {
    process: 'inquiries',
    source: 'form',
    destination: 'crm',
    useAi: false,
    review: true,
    note: '',
  }
}

export function selectAutomationProcess(
  config: AutomationConfig,
  process: ProcessId,
): AutomationConfig {
  const definition = automationProcesses[process]
  return {
    ...config,
    process,
    source: definition.sources.includes(config.source) ? config.source : definition.sources[0],
    destination: definition.destinations.includes(config.destination)
      ? config.destination
      : definition.destinations[0],
  }
}

export function automationSteps(config: AutomationConfig): AutomationStep[] {
  const definition = automationProcesses[config.process]
  const steps: AutomationStep[] = [
    {
      id: 'input',
      title: systemNames[config.source],
      mode: 'Wejście',
      detail:
        'Pobierz nowe dane z wybranego źródła. Częstotliwość i dostępne połączenie ustalimy przy wdrożeniu.',
    },
    {
      id: 'validate',
      title: 'Sprawdź kompletność',
      mode: 'Reguły',
      detail: definition.validation,
    },
    {
      id: 'prepare',
      title: config.useAi ? 'Przygotuj szkic z AI' : 'Uporządkuj dane',
      mode: config.useAi ? 'AI · szkic' : 'Reguły',
      detail: config.useAi ? definition.aiTask : definition.task,
    },
  ]
  if (config.review)
    steps.push({
      id: 'review',
      title: 'Sprawdź i zaakceptuj',
      mode: 'Twoja decyzja',
      detail:
        'Sprawdź przygotowany wynik, popraw go w razie potrzeby i zaakceptuj przekazanie dalej.',
    })
  steps.push({
    id: 'output',
    title: systemNames[config.destination],
    mode: 'Wynik',
    detail:
      config.destination === 'email'
        ? 'Przygotuj wiadomość w skrzynce. Wysyłkę do odbiorców ustalimy osobno.'
        : `Zapisz przygotowany wynik w systemie: ${systemNames[config.destination]}. Potwierdź zapis i odnotuj błąd, jeśli się nie powiedzie.`,
  })
  return steps
}

export function automationScope(config: AutomationConfig): string {
  const definition = automationProcesses[config.process]
  const steps = automationSteps(config)
  return [
    'PLAN AUTOMATYZACJI — CodeFix.IT',
    '',
    'Proces: ' + definition.label,
    'Źródło: ' + systemNames[config.source],
    'Miejsce wyniku: ' + systemNames[config.destination],
    'AI: ' + (config.useAi ? 'przygotowanie roboczego szkicu' : 'bez modelu AI, według reguł'),
    'Akceptacja: ' +
      (config.review
        ? 'ręczna przed przekazaniem wyniku'
        : 'przekazanie wyniku po walidacji, bez osobnego etapu akceptacji'),
    '',
    'Przepływ:',
    ...steps.map((step, index) => `${index + 1}. ${step.title} [${step.mode}] — ${step.detail}`),
    '',
    'Braki lub błąd: ' + definition.exception,
    ...(config.note.trim() ? ['', 'Własne wymagania: ' + config.note.trim().slice(0, 280)] : []),
    '',
    'Do ustalenia przed wdrożeniem: dostępne połączenia systemów, zakres danych, obsługa ponowień i kryteria odbioru.',
    'Plan do omówienia. Zakres i cenę potwierdzę przed rozpoczęciem prac.',
  ].join('\n')
}
