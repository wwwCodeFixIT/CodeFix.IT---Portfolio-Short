# CodeFix.IT - Profesjonalne Środowisko Technologiczne

Nowoczesna aplikacja webowa będąca profesjonalną stroną wizytówką i portfolio dla marki CodeFix.IT, zbudowana w React z rozbudowanym ekosystemem integracji.

## 🚀 Szybki start

### Uruchomienie

```bash
npm install
npm run dev
```

### Build produkcyjny

```bash
npm run build
```

## ⚙️ Konfiguracja

### Metoda 1: Setup Wizard (Zalecane)

Po pierwszym uruchomieniu aplikacji automatycznie pojawi się Setup Wizard, który przeprowadzi Cię przez proces konfiguracji.

Możesz też uruchomić go ręcznie:
- Naciśnij `⌘ + Shift + S` (Mac) lub `Ctrl + Shift + S` (Windows)

### Metoda 2: Panel Ustawień

1. Naciśnij `⌘ + ,` (Mac) lub `Ctrl + ,` (Windows)
2. Lub kliknij ikonę ⚙️ w nawigacji

### Metoda 3: Edycja pliku konfiguracji

Edytuj `src/context/SettingsContext.tsx`:

```typescript
const defaultSettings: AppSettings = {
  github: {
    username: 'TWOJA_NAZWA_UŻYTKOWNIKA',
    token: 'ghp_xxxxxxxxxxxxx', // opcjonalne
  },
  contact: {
    email: 'kontakt@twojafirma.pl',
    phone: '+48 123 456 789',
    address: 'Warszawa, Polska',
  },
  company: {
    name: 'Twoja Firma',
    foundedYear: 2020,
    description: 'Opis Twojej firmy',
  },
  // ...
};
```

## 🔗 Integracje

### GitHub API

Połącz swoje konto GitHub, aby wyświetlać:
- Statystyki repozytoriów (gwiazdki, forki)
- Contribution graph (365 dni)
- Top języki programowania
- Streaks (serie commitów)

**Konfiguracja:**
1. Otwórz Ustawienia (`⌘ + ,`)
2. Zakładka "GitHub"
3. Wpisz swoją nazwę użytkownika
4. Opcjonalnie: dodaj Personal Access Token

**Uzyskanie tokena:**
1. Przejdź do https://github.com/settings/tokens
2. Kliknij "Generate new token (classic)"
3. Wybierz uprawnienia: `public_repo`, `read:user`
4. Skopiuj token

### Monitoring usług

System sprawdza dostępność skonfigurowanych endpointów:
- Czas odpowiedzi (response time)
- Historia uptime (90 dni)
- Powiadomienia o awariach

**Dodawanie usług:**

Edytuj `src/context/SettingsContext.tsx`:

```typescript
monitoring: {
  enabled: true,
  checkInterval: 60000, // co 1 minutę
  services: [
    {
      id: 'website',
      name: 'Strona główna',
      url: 'https://twojastrona.pl',
      description: 'Główna strona'
    },
    {
      id: 'api',
      name: 'API',
      url: 'https://api.twojastrona.pl/health',
      description: 'Backend API'
    },
  ],
},
```

### Analytics

Lokalne śledzenie odwiedzin bez zewnętrznych serwisów:
- Page views
- Czas na stronie
- Typ urządzenia
- Źródło ruchu
- Interakcje

Dane przechowywane lokalnie w przeglądarce (localStorage).

## ⌨️ Skróty klawiszowe

| Skrót | Akcja |
|-------|-------|
| `⌘ + K` | Command Palette |
| `⌘ + ,` | Ustawienia |
| `⌘ + ⇧ + S` | Setup Wizard |
| `?` | Lista skrótów |
| `G + H` | Idź do Hero |
| `G + S` | Idź do Usług |
| `G + P` | Idź do Portfolio |
| `G + C` | Idź do Kontaktu |
| `Esc` | Zamknij modal |

## 📂 Struktura projektu

```
src/
├── components/           # Komponenty UI
│   ├── Hero.tsx         # Sekcja główna
│   ├── Services.tsx     # Usługi
│   ├── Portfolio.tsx    # Portfolio z modalem
│   ├── GitHubStats.tsx  # Statystyki GitHub
│   ├── StatusPage.tsx   # Monitoring usług
│   ├── SetupWizard.tsx  # Kreator konfiguracji
│   ├── SettingsPanel.tsx # Panel ustawień
│   └── ...
├── context/
│   └── SettingsContext.tsx  # Globalny stan ustawień
├── contexts/
│   ├── ThemeContext.tsx     # Dark/Light mode
│   └── NotificationContext.tsx
├── hooks/
│   ├── useGitHubStats.ts    # Hook do GitHub API
│   ├── useServiceStatus.ts  # Hook do monitoringu
│   └── useAnalytics.ts      # Hook do analytics
└── config/
    └── settings.ts          # Stara konfiguracja (deprecated)
```

## 🎨 Personalizacja

### Kolory

Edytuj `tailwind.config.js` lub użyj zmiennych CSS w `src/index.css`:

```css
:root {
  --color-primary: #dc2626; /* Czerwony */
  --color-background: #0a0a0a; /* Czarny */
}
```

### Typografia

Domyślnie używany jest font Inter. Zmień w `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## 🔒 Prywatność

- Wszystkie dane przechowywane lokalnie w przeglądarce
- Brak śledzenia zewnętrznego (chyba że dodasz GA4)
- Tokeny GitHub przechowywane tylko lokalnie
- Brak cookies trzecich stron

## 📝 Licencja

MIT License

---

Zbudowane z ❤️ przez CodeFix.IT
