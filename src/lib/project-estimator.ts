import type { ServiceKey, ServiceLandingCatalog } from '../data/service-landings'

export const estimatorServices = {
  site: { label: 'Nowa strona', service: 'CODEFIX_BUSINESS_SITE' },
  fix: { label: 'Naprawa WordPress', service: 'WORDPRESS_QUICK_FIX' },
  care: { label: 'Stała opieka', service: 'WORDPRESS_CARE' },
  agency: { label: 'Dla agencji', service: 'AGENCY_WHITE_LABEL' },
} as const

export const siteTypes = {
  company: 'Strona firmowa',
  landing: 'Landing page',
  shop: 'Sklep WooCommerce',
}
export const pageRanges = {
  one: '1 strona',
  small: '2–5 podstron',
  medium: '6–10 podstron',
  large: '11–20 podstron',
  custom: 'Ponad 20 podstron',
}
export const materialOptions = {
  ready: 'Mam teksty i zdjęcia',
  partial: 'Mam część materiałów',
  help: 'Potrzebuję pomocy z materiałami',
}
export const featureOptions = {
  blog: 'Blog / poradniki',
  languages: 'Dodatkowy język',
  booking: 'Rezerwacje',
  crm: 'Integracja z CRM / newsletterem',
}
export const issueOptions = {
  form: 'Formularz / wiadomości',
  update: 'Błąd po aktualizacji',
  shop: 'WooCommerce / płatności',
  layout: 'Wygląd / wersja mobilna',
  other: 'Inny pojedynczy problem',
  multiple: 'Kilka problemów',
}
export const carePeriods = { month: '1 miesiąc', quarter: '3 miesiące', year: '12 miesięcy' }
export const agencyRanges = {
  small: '2–4 godziny',
  medium: '4–8 godzin',
  large: '8–16 godzin',
  ongoing: '16–40 godzin',
}

export type EstimatorAnswers = {
  kind: keyof typeof estimatorServices
  siteType: keyof typeof siteTypes
  pages: keyof typeof pageRanges
  materials: keyof typeof materialOptions
  features: (keyof typeof featureOptions)[]
  issue: keyof typeof issueOptions
  period: keyof typeof carePeriods
  hours: keyof typeof agencyRanges
}

export type EstimatorRates = { quickFix: number | null; care: number | null; agency: number | null }
export type ProjectBrief = { service: ServiceKey; brief: string }

export function initialEstimatorAnswers(service = ''): EstimatorAnswers {
  const kind =
    (Object.keys(estimatorServices) as EstimatorAnswers['kind'][]).find(
      (key) => estimatorServices[key].service === service,
    ) || 'site'
  return {
    kind,
    siteType: 'company',
    pages: 'small',
    materials: 'ready',
    features: [],
    issue: 'form',
    period: 'month',
    hours: 'small',
  }
}

function readPrice(value: string | undefined, pattern: RegExp) {
  const match = value?.match(pattern)
  if (!match) return null
  const amount = Number(match[1].replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

// Read only the published offer. Unrecognised price formats fall back to an individual quote.
export function readEstimatorRates(catalog: ServiceLandingCatalog): EstimatorRates {
  return {
    quickFix: readPrice(
      catalog['/naprawa-wordpress']?.price,
      /^Od\s+(\d[\d\s]*(?:,\d{1,2})?)\s+zł$/i,
    ),
    care: readPrice(
      catalog['/opieka-wordpress']?.price,
      /^Od\s+(\d[\d\s]*(?:,\d{1,2})?)\s+zł\s*\/\s*mies\.$/i,
    ),
    agency: readPrice(
      catalog['/dla-agencji-wordpress']?.price,
      /^(\d[\d\s]*(?:,\d{1,2})?)\s+zł\s*\/\s*h$/i,
    ),
  }
}

const currency = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 })
const money = (amount: number) => `${currency.format(amount)} zł`

export function estimateProject(answers: EstimatorAnswers, rates: EstimatorRates | null) {
  const { service, label } = estimatorServices[answers.kind]
  let price = 'Wycena indywidualna'
  let note = 'Cenę nowej strony ustalam po poznaniu zakresu, materiałów i integracji.'
  let details: string[]

  switch (answers.kind) {
    case 'site':
      details = [
        siteTypes[answers.siteType],
        pageRanges[answers.pages],
        materialOptions[answers.materials],
        `Dodatki: ${answers.features.length ? answers.features.map((key) => featureOptions[key]).join(', ') : 'bez dodatkowych funkcji'}`,
        'Podstawa: wersja mobilna, formularz, edycja treści i techniczne SEO',
      ]
      break
    case 'fix':
      if (answers.issue !== 'multiple' && rates?.quickFix) price = `Od ${money(rates.quickFix)}`
      note = 'Quick Fix obejmuje jeden uzgodniony problem. Po diagnozie potwierdzam zakres i cenę.'
      details = [issueOptions[answers.issue], 'Diagnoza, uzgodniona naprawa i test po wdrożeniu']
      break
    case 'care': {
      const months = { month: 1, quarter: 3, year: 12 }[answers.period]
      if (rates?.care)
        price = `Od ${money(rates.care * months)}${months === 1 ? ' / mies.' : ` / ${months} mies.`}`
      note = rates?.care
        ? `Przeliczenie ceny startowej ${money(rates.care)} / mies. Dokładny abonament i okres współpracy ustalam przed startem.`
        : 'Zakres abonamentu i okres współpracy ustalam przed startem.'
      details = [
        `Planowany okres: ${carePeriods[answers.period]}`,
        'Aktualizacje, backupy i uzgodniony zakres drobnych zmian',
      ]
      break
    }
    case 'agency': {
      const [min, max] = { small: [2, 4], medium: [4, 8], large: [8, 16], ongoing: [16, 40] }[
        answers.hours
      ]
      if (rates?.agency) price = `${money(min * rates.agency)} – ${money(max * rates.agency)}`
      note = rates?.agency
        ? `${money(rates.agency)} / h × wybrany zakres godzin. Czas konkretnego zadania potwierdzam po briefie.`
        : 'Czas i stawkę konkretnego zadania potwierdzam po briefie.'
      details = [
        `Planowana pula: ${agencyRanges[answers.hours]}`,
        'WordPress / ACF PRO / front-end, staging i Git',
      ]
      break
    }
  }

  const brief = [
    'Zakres z kalkulatora CodeFix.IT',
    `Usługa: ${label}`,
    ...details,
    `Orientacyjny wynik: ${price}`,
    note,
  ].join('\n')
  return { service, label, price, note, details, brief }
}

export function mergeProjectBrief(message: string, project: ProjectBrief | null) {
  return [message.trim(), project?.brief].filter(Boolean).join('\n\n')
}
