import { motion, AnimatePresence } from 'framer-motion';

interface LegalPageProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ isOpen, onClose, type }) => {
  const content = type === 'privacy' ? privacyContent : termsContent;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Ostatnia aktualizacja: {content.lastUpdate}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-zinc max-w-none">
              {content.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-red-500">{section.icon}</span>
                    {section.title}
                  </h3>
                  <div className="text-zinc-300 space-y-3">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                    {section.list && (
                      <ul className="list-disc list-inside space-y-2 text-zinc-400">
                        {section.list.map((item, lIndex) => (
                          <li key={lIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 p-6 bg-zinc-900/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-zinc-400">
                  Masz pytania? Skontaktuj się: <a href="mailto:wwwcodefixit@gmail.com" className="text-red-500 hover:underline">wwwcodefixit@gmail.com</a>
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const privacyContent = {
  title: 'Polityka Prywatności',
  lastUpdate: '1 stycznia 2025',
  sections: [
    {
      icon: '📋',
      title: '1. Informacje ogólne',
      content: [
        'Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem ze strony internetowej CodeFix.IT.',
        'Administratorem danych osobowych jest Patryk (CodeFix.IT), prowadzący działalność w Warszawie, Polska.',
      ],
    },
    {
      icon: '📊',
      title: '2. Zakres zbieranych danych',
      content: [
        'Zbieramy następujące dane osobowe:',
      ],
      list: [
        'Imię i nazwisko (przy wypełnianiu formularza kontaktowego)',
        'Adres e-mail (przy wypełnianiu formularza kontaktowego)',
        'Numer telefonu (opcjonalnie, przy wypełnianiu formularza)',
        'Treść wiadomości (przy wypełnianiu formularza kontaktowego)',
        'Dane techniczne (adres IP, typ przeglądarki, czas wizyty)',
      ],
    },
    {
      icon: '🎯',
      title: '3. Cele przetwarzania danych',
      content: [
        'Dane osobowe przetwarzane są w celu:',
      ],
      list: [
        'Odpowiedzi na zapytania przesłane przez formularz kontaktowy',
        'Przygotowania oferty na realizację usług',
        'Realizacji zawartych umów',
        'Analityki i statystyki strony internetowej',
        'Wypełnienia obowiązków prawnych',
      ],
    },
    {
      icon: '🔒',
      title: '4. Bezpieczeństwo danych',
      content: [
        'Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych.',
        'Dane przesyłane za pomocą formularza kontaktowego są szyfrowane przy użyciu protokołu SSL.',
      ],
    },
    {
      icon: '🍪',
      title: '5. Pliki cookies',
      content: [
        'Strona wykorzystuje pliki cookies w celu:',
      ],
      list: [
        'Zapewnienia prawidłowego funkcjonowania strony',
        'Zapamiętania preferencji użytkownika (np. język, motyw)',
        'Analityki ruchu na stronie (Google Analytics)',
        'Poprawy jakości usług',
      ],
    },
    {
      icon: '⚖️',
      title: '6. Prawa użytkownika',
      content: [
        'Użytkownik ma prawo do:',
      ],
      list: [
        'Dostępu do swoich danych osobowych',
        'Sprostowania nieprawidłowych danych',
        'Usunięcia danych ("prawo do bycia zapomnianym")',
        'Ograniczenia przetwarzania',
        'Przenoszenia danych',
        'Wniesienia sprzeciwu wobec przetwarzania',
        'Złożenia skargi do organu nadzorczego (UODO)',
      ],
    },
    {
      icon: '📧',
      title: '7. Kontakt',
      content: [
        'W sprawach związanych z ochroną danych osobowych można kontaktować się:',
        'Email: wwwcodefixit@gmail.com',
        'Telefon: +48 883 667 943',
      ],
    },
  ],
};

const termsContent = {
  title: 'Regulamin',
  lastUpdate: '1 stycznia 2025',
  sections: [
    {
      icon: '📜',
      title: '1. Postanowienia ogólne',
      content: [
        'Niniejszy Regulamin określa zasady korzystania ze strony internetowej CodeFix.IT oraz świadczenia usług przez Patryka (CodeFix.IT).',
        'Korzystanie ze strony oznacza akceptację niniejszego Regulaminu.',
      ],
    },
    {
      icon: '💼',
      title: '2. Zakres usług',
      content: [
        'CodeFix.IT świadczy usługi w zakresie:',
      ],
      list: [
        'Tworzenia stron internetowych',
        'Tworzenia aplikacji webowych',
        'Projektowania interfejsów użytkownika (we współpracy z partnerem)',
        'Tworzenia i modyfikacji szablonów WordPress',
        'Optymalizacji i redesignu istniejących stron',
        'Administracji i wsparcia technicznego',
      ],
    },
    {
      icon: '📝',
      title: '3. Realizacja zamówień',
      content: [
        'Proces realizacji zamówienia obejmuje:',
      ],
      list: [
        'Konsultację i omówienie wymagań projektu',
        'Przygotowanie oferty i wyceny',
        'Podpisanie umowy i ustalenie harmonogramu',
        'Realizację projektu z regularnymi aktualizacjami',
        'Testy i poprawki',
        'Wdrożenie i przekazanie projektu',
      ],
    },
    {
      icon: '💰',
      title: '4. Płatności',
      content: [
        'Warunki płatności ustalane są indywidualnie dla każdego projektu.',
        'Standardowo stosowany jest podział: 50% zaliczki przed rozpoczęciem prac, 50% po zakończeniu projektu.',
        'Płatności można dokonać przelewem bankowym.',
      ],
    },
    {
      icon: '📋',
      title: '5. Prawa autorskie',
      content: [
        'Po zakończeniu projektu i otrzymaniu pełnej płatności, klient otrzymuje pełne prawa do użytkowania wykonanego dzieła.',
        'CodeFix.IT zastrzega sobie prawo do umieszczenia zrealizowanego projektu w portfolio (chyba że umowa stanowi inaczej).',
      ],
    },
    {
      icon: '⚠️',
      title: '6. Ograniczenie odpowiedzialności',
      content: [
        'CodeFix.IT nie ponosi odpowiedzialności za:',
      ],
      list: [
        'Przerwy w działaniu strony spowodowane czynnikami niezależnymi',
        'Szkody wynikające z nieprawidłowego użytkowania strony',
        'Treści umieszczone przez klienta na wykonanej stronie',
        'Działania osób trzecich',
      ],
    },
    {
      icon: '🔄',
      title: '7. Gwarancja i wsparcie',
      content: [
        'Na wykonane prace udzielana jest gwarancja na okres ustalony w umowie (standardowo 30 dni).',
        'Gwarancja obejmuje poprawki błędów wynikających z wady wykonania.',
        'Wsparcie techniczne po okresie gwarancji świadczone jest odpłatnie.',
      ],
    },
    {
      icon: '📞',
      title: '8. Kontakt i reklamacje',
      content: [
        'Reklamacje należy zgłaszać na adres: wwwcodefixit@gmail.com',
        'Reklamacje rozpatrywane są w terminie 14 dni roboczych.',
      ],
    },
  ],
};
