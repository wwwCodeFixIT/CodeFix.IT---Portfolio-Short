import { useEffect } from 'react';
import { Brand } from '../components/Brand';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import './PrivacyPolicy.css';

const contactEmail = 'wwwcodefixit@gmail.com';

export function PrivacyPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Polityka prywatności | CodeFix.IT';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="homepage-v1 cf-privacy-page">
      <header className="cf-header">
        <div className="cf-container cf-privacy-nav">
          <Brand />
          <a href="/" className="cf-privacy-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Wróć na stronę
          </a>
        </div>
      </header>

      <main className="cf-container cf-privacy-main">
        <div className="cf-privacy-hero">
          <p className="cf-section-kicker">Prywatność • CodeFix.IT</p>
          <h1>Polityka prywatności</h1>
          <p>
            Poniżej wyjaśniam, jakie dane są przetwarzane przez codefix.it,
            po co są potrzebne i jakie masz prawa.
          </p>
          <span>Ostatnia aktualizacja: 1 października 2026 r.</span>
        </div>

        <div className="cf-privacy-grid">
          <aside className="cf-privacy-summary">
            <ShieldCheck size={24} aria-hidden="true" />
            <h2>Najważniejsze w skrócie</h2>
            <p>
              Formularz służy do obsługi zapytania. Analityka Google i pomiar reklam
              OpenAI mają osobne, dobrowolne zgody. Nie sprzedaję danych osobowych.
            </p>
            <a href={`mailto:${contactEmail}`}>
              <Mail size={15} aria-hidden="true" />
              {contactEmail}
            </a>
          </aside>

          <article className="cf-privacy-content">
            <section>
              <h2>1. Administrator i kontakt</h2>
              <p>
                Administratorem danych przekazywanych przez serwis jest właściciel
                CodeFix.IT. W sprawach dotyczących danych osobowych możesz napisać na
                <a href={`mailto:${contactEmail}`}> {contactEmail}</a>.
              </p>
            </section>

            <section>
              <h2>2. Formularz kontaktowy</h2>
              <p>
                Przy wysłaniu formularza przetwarzane są dane, które podasz:
                imię lub nazwa firmy, adres e-mail, opcjonalny adres strony, wybrany
                temat i treść wiadomości. Zapisywane mogą być także ograniczone dane
                o źródle zgłoszenia: wartości UTM, ścieżka wejścia oraz domena strony,
                z której nastąpiło przejście.
              </p>
              <p>
                Dane służą do odpowiedzi na zapytanie, przygotowania zakresu lub
                wyceny, prowadzenia historii kontaktu w CRM oraz ochrony formularza
                przed nadużyciami.
              </p>
            </section>

            <section>
              <h2>3. Podstawa przetwarzania</h2>
              <p>
                Dane z zapytania są przetwarzane w celu podjęcia działań na Twoje
                żądanie przed zawarciem umowy albo obsługi dalszej współpracy.
                W zakresie bezpieczeństwa, historii ustaleń i podstawowej atrybucji
                źródła zgłoszenia podstawą jest uzasadniony interes administratora.
                Analityka Google i pomiar reklam OpenAI są uruchamiane wyłącznie
                po wyrażeniu odpowiedniej zgody.
              </p>
            </section>

            <section>
              <h2>4. Analityka, pomiar reklam i pamięć zgody</h2>
              <p>
                Google Analytics 4 mierzy odwiedziny i wysłane zapytania po zgodzie
                na analitykę. Osobna zgoda na pomiar reklam uruchamia Pixel OpenAI,
                który pozwala powiązać wysłanie zapytania z reklamą w ChatGPT.
                Wcześniejsza zgoda na samą analitykę nie uruchamia pomiaru reklam.
              </p>
              <p>
                Decyzje są zapamiętywane lokalnie w przeglądarce. Każdy z pomiarów
                możesz zmienić w „Ustawieniach prywatności” dostępnych na stronie.
                Skrypt danego dostawcy jest ładowany dopiero po odpowiedniej zgodzie.
                Odrzucenie nie ogranicza formularza ani korzystania ze strony.
              </p>
              <p>
                Pixel używa identyfikatora przeglądarki w cookie __obref (do 365 dni)
                oraz identyfikatora przypisania kliknięcia w __oppref (do 30 dni).
                Wycofanie zgody usuwa te cookies. Przy włączonym automatycznym
                dopasowaniu Pixel może także przetwarzać kryptograficzne skróty
                obsługiwanych danych kontaktowych z formularza; surowe dane
                kontaktowe nie są wysyłane w ramach tego dopasowania.
              </p>
            </section>

            <section>
              <h2>5. Odbiorcy danych</h2>
              <p>
                Dane mogą być przetwarzane przez dostawców infrastruktury potrzebnej
                do działania serwisu, CRM i poczty transakcyjnej, w szczególności
                usług hostingowych i chmurowych. Dane analityczne trafiają do Google
                wyłącznie po wyrażeniu zgody.
                Dane pomiaru reklam trafiają do OpenAI po osobnej zgodzie.
              </p>
            </section>

            <section>
              <h2>6. Jak długo przechowuję dane</h2>
              <p>
                Dane z zapytania są przechowywane przez okres potrzebny do obsługi
                kontaktu i dalszych ustaleń oraz przez okres uzasadniony ochroną przed
                roszczeniami lub obowiązkami związanymi z realizowaną współpracą.
                Dane analityczne podlegają ustawieniom retencji Google Analytics.
              </p>
            </section>

            <section>
              <h2>7. Twoje prawa</h2>
              <p>
                Możesz poprosić o dostęp do swoich danych, ich sprostowanie,
                usunięcie, ograniczenie przetwarzania lub — gdy ma to zastosowanie —
                przeniesienie danych. Możesz również sprzeciwić się przetwarzaniu
                opartemu na uzasadnionym interesie oraz w dowolnym momencie wycofać
                zgodę na analitykę lub pomiar reklam.
              </p>
              <p>
                Jeżeli uważasz, że dane są przetwarzane nieprawidłowo, przysługuje
                Ci prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
              </p>
            </section>

            <section>
              <h2>8. Automatyczne decyzje</h2>
              <p>
                Dane z formularza nie są wykorzystywane do podejmowania wobec Ciebie
                decyzji wywołujących skutki prawne w sposób wyłącznie zautomatyzowany.
              </p>
            </section>
          </article>
        </div>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/">Strona główna</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}
