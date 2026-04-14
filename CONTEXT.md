# CONTEXT — RelyAssets BESS Development Platform

> File di contesto per allineare Claude (e Angelo) all'inizio di ogni sessione.
> Mantenere corto. Aggiornare a fine sessione con "Fatto oggi" e "Prossimi step".

---

## Cosa è l'app

Dashboard interna di RelyAssets per gestire la pipeline di sviluppo di progetti BESS
(Battery Energy Storage System) in Italia. Viste principali: Dashboard, Pipeline,
Budget/Finance, Scoring, Board Report, PreAuction.

Dati originari: `Italy_Pipeline_150126.xlsx` e `ITALY_PIPELINE_BUDGET_26.xlsx`
(non nella repo, solo usati per estrarre i seed iniziali).

## Stack

- **Vite + React 18** (SPA, nessun router — navigazione tramite state)
- **TailwindCSS 3** per lo styling (solo utility classes, niente CSS custom)
- **Recharts** per i grafici
- **Nessun backend, nessun DB, nessuna auth** — dati hardcoded in `SEED_PROJECTS`

Deploy: **Vercel** collegato a questa repo, auto-deploy su push a `main`.
**URL live:** https://dev-platform-psi.vercel.app/

## Struttura codice

Attualmente tutto in un singolo file monolitico:

- `src/App.jsx` — ~1479 righe, contiene:
  - Costanti brand/colori (`C`)
  - Taxonomy (`TAX`)
  - Seed data (`SEED_PROJECTS`, budget 2026, scoring matrix)
  - Tutti i componenti (Dashboard, Pipeline, BudgetFinance, Scoring, BoardReport,
    PreAuction, ProjectDetail, EditProjectModal, AddExpenseModal, SettingsModal)
  - `App` default export con navigation state

- `src/main.jsx` — entry point (monta `<App />`)
- `src/index.css` — direttive Tailwind

## Decisioni prese

- **Monolitico per ora.** Va spezzato appena iniziamo a iterare seriamente su
  singoli componenti — Vercel/Lovable fanno fatica su diff grossi.
- **Dati in memoria.** Ogni modifica dal browser si perde al refresh. Per
  persistenza vera → Supabase (da fare quando serve, non prima).
- **Niente auth.** L'URL Vercel è pubblico ma non indicizzato. Se serve
  protezione → password basic o Supabase auth.
- **Niente import Excel diretto.** I dati sono hardcoded come seed.

## Stato attuale

- ✅ Codice su GitHub (`angelomgiordano/dev-platform`)
- ✅ Vercel connesso, auto-deploy attivo, app live e funzionante
- ⬜ Split del monolite in file separati
- ⬜ Persistenza dati
- ⬜ Funzionalità/miglioramenti specifici (da definire con Angelo)

## Prossimi step

1. Angelo verifica deploy Vercel funzionante
2. Primo giro di feedback: cosa migliorare sull'app attuale
3. Valutare se splittare `App.jsx` prima di entrare in modifiche pesanti

## Note / gotcha

- `SEED_PROJECTS` è hardcoded dentro `App.jsx` → se si aggiungono progetti
  nell'UI, non persistono.
- Le classi Tailwind devono stare in `content` di `tailwind.config.js`
  (già configurato per `./src/**/*.{js,jsx,ts,tsx}`).
- Recharts richiede width/height definiti dai parent — evitare container
  senza altezza esplicita.

## Come riprendere in una nuova sessione

Dire a Claude:
> "Stiamo lavorando su angelomgiordano/dev-platform. Clona la repo e leggi
> CONTEXT.md per allinearti, poi ti dico cosa fare."

---

## Log sessioni

### 2026-04-14 — Setup iniziale
- Creata repo GitHub, scaffold Vite/React/Tailwind/recharts
- Push del monolite `App.jsx` esistente (1479 righe)
- Setup Vercel per auto-deploy
- Creato questo CONTEXT.md
