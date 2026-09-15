import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: 'WordPress Rescue',
    description:
      'Naprawy błędów, formularzy, WooCommerce, integracji i problemów po aktualizacjach.',
    meta: 'Szybka diagnoza • konkretna wycena',
  },
  {
    icon: Braces,
    title: 'Development',
    description:
      'Dedykowane sekcje, komponenty i funkcje w WordPress, React oraz Next.js.',
    meta: 'ACF • API • React • Next.js',
  },
  {
    icon: Gauge,
    title: 'Performance',
    description:
      'Optymalizacja Core Web Vitals, obrazów, JavaScriptu, cache i warstwy front-end.',
    meta: 'LCP • CLS • INP • Cloudflare',
  },
];

const process = [
  'Opisujesz problem albo zakres prac.',
  'Dostajesz konkretny plan i wycenę.',
  'Zmiany trafiają na preview przed publikacją.',
  'Po akceptacji wdrażamy produkcję.',
];

export function HomepageV1() {
  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-red-600 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-red-700/15 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[34rem] h-[24rem] w-[24rem] rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070707]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-3" aria-label="CodeFix.IT - strona główna">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 font-mono text-sm font-bold text-red-400 transition-colors group-hover:bg-red-500/15">
              &lt;/&gt;
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] text-white">
              CODEFIX<span className="text-red-500">.IT</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex" aria-label="Główna nawigacja">
            <a className="transition-colors hover:text-white" href="#services">
              Usługi
            </a>
            <a className="transition-colors hover:text-white" href="#process">
              Proces
            </a>
          </nav>

          <a
            href="#services"
            className="rounded-lg border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Zobacz usługi
          </a>
        </div>
      </header>

      <main id="top" className="relative">
        <section className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Dostępny do nowych zleceń
            </div>

            <p className="mb-4 font-mono text-sm font-medium uppercase tracking-[0.22em] text-red-400">
              WordPress • React • Next.js • API
            </p>

            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              Diabeł tkwi
              <span className="block text-zinc-500">w kodzie.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              Naprawiam, rozwijam i optymalizuję strony oraz aplikacje internetowe.
              Bez zbędnego procesu — diagnoza, konkretne rozwiązanie i wdrożenie.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Zobacz, w czym pomagam
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#process"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.06]"
              >
                Jak wygląda współpraca
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Preview przed wdrożeniem
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Git + CI/CD
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Mobile-first
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-6 rounded-[2rem] bg-red-600/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 font-mono text-[11px] text-zinc-600">codefix.it / diagnose</span>
              </div>

              <div className="space-y-6 p-6 font-mono text-sm">
                <div>
                  <p className="text-zinc-600">$ audit --project client-site</p>
                  <p className="mt-2 text-zinc-300">Analiza projektu...</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.025] px-4 py-3">
                    <span className="text-zinc-400">Błędy krytyczne</span>
                    <span className="text-red-400">3 znalezione</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.025] px-4 py-3">
                    <span className="text-zinc-400">Performance</span>
                    <span className="text-amber-300">do poprawy</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.025] px-4 py-3">
                    <span className="text-zinc-400">Plan naprawczy</span>
                    <span className="text-emerald-400">gotowy ✓</span>
                  </div>
                </div>

                <p className="text-zinc-500">
                  <span className="text-red-400">→</span> problem znaleziony. Możemy naprawiać.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Usługi
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Kod ma działać. Szybko, stabilnie i bez niespodzianek.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {services.map(({ icon: Icon, title, description, meta }) => (
                <article
                  key={title}
                  className="group rounded-2xl border border-white/8 bg-[#0b0b0b] p-6 transition duration-300 hover:-translate-y-1 hover:border-red-500/25 hover:bg-[#0e0e0e]"
                >
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  <p className="mt-6 border-t border-white/5 pt-4 font-mono text-xs text-zinc-600">{meta}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Proces</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Bez wrzucania zmian w ciemno.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-zinc-400">
                Każda większa zmiana przechodzi przez branch, automatyczne testy i osobne środowisko preview.
              </p>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {process.map((item, index) => (
                <li key={item} className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  <span className="font-mono text-xs text-red-400">0{index + 1}</span>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 CodeFix.IT</span>
          <span className="font-mono text-xs">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}
