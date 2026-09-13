# GigSyc — Powering Flexible Work

GigSyc is a Kigali-based workforce platform that connects businesses with verified professionals for short-term, event and project work. A hotel, conference centre or brand agency posts a shift (banquet service, delegate registration, a retail activation, a stock count) with a flat RWF rate; ranked, verified professionals apply or are invited; the employer confirms a crew, runs QR check-in on the day, then approves hours and rates the work — which releases payment to the worker's mobile money and rolls the cost into a fortnightly invoice with an 18% service fee. This repository is a **front-end prototype** of that product: two complete experiences in one Next.js codebase — a desktop-first **employer portal** (`/employer/*`) and a mobile-first **worker app** (`/worker/*`), plus the marketing site — all running against an in-browser mock backend with no server, no real accounts and no real money.

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. No environment variables, database, or API keys are needed — the prototype is entirely self-contained.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint over the repo |
| `npx tsc --noEmit` | Type check |

Requires Node 20+. Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 · Radix UI · motion · lucide-react · sonner.

## Demo accounts

Go to **[/login](http://localhost:3000/login)** and pick one of the two personas — no password, no sign-up:

| Persona | Who | Lands on | What you can do |
| --- | --- | --- | --- |
| **Business** | Diane Mukamana, Events & Banquets Manager at **Ikaze Hospitality Group** (`emp_ikaze`) | `/employer` | Post shifts, rank and confirm candidates, run QR attendance, approve hours and rate workers, review invoices and analytics |
| **Professional** | **Aline Uwase**, hospitality student, 4.9★ over 42 shifts (`wk_aline`) | `/worker` | Browse and apply to open shifts, accept an invitation, check in by QR, track MoMo payouts and build a profile |

Both personas share one live dataset, so an action on one side shows up on the other — confirm Aline for a shift as the employer, then switch personas and see it in her schedule. Switch sides any time from the account menu in the shell. The "sign in with email" form on `/login` is deliberately non-functional: it validates the address, then points you back at the demo accounts.

The chosen persona is stored in `localStorage` under `gigsyc.prototype.session`. Deep links work without signing in — every `/employer/*` and `/worker/*` route falls back to the demo persona so you can share a URL directly.

## Route map

**Marketing** — `src/app/(marketing)`

| Route | Page |
| --- | --- |
| `/` | Home — brand, how it works, featured shift, both audiences |
| `/business` | For businesses — the employer pitch |
| `/workers` | For professionals — the worker pitch |
| `/how-it-works` | End-to-end flow for both sides |
| `/login` | Persona picker |

**Employer portal** — `src/app/employer`, sidebar shell, desktop-first

| Route | Page |
| --- | --- |
| `/employer` | Dashboard — today's shifts, staffing gaps, applications to review |
| `/employer/jobs` | All shifts: drafts, open, filled, in progress, completed, cancelled |
| `/employer/jobs/new` | Post a shift (multi-step form; `?from=<shiftId>` duplicates an existing shift) |
| `/employer/jobs/[id]` | Shift detail. Tabs via `?tab=` — `overview` (default), `staffing`, `attendance` (QR check-in), `review` (approve hours + rate) |
| `/employer/talent` | Talent pool and worker search |
| `/employer/talent/[id]` | Worker profile — history with you, ratings, verifications |
| `/employer/payments` | Fortnightly invoices and spend |
| `/employer/payments/[id]` | Invoice detail — line items, worker pay, 18% service fee |
| `/employer/analytics` | Fill rate, spend, reliability, role mix |
| `/employer/settings` | Company, team, billing, notifications, prototype controls |
| `/employer/notifications` | Notification centre |

Try: `/employer/jobs/sh_ikaze_gala`, `/employer/jobs/sh_ikaze_brunch?tab=attendance`, `/employer/jobs/sh_ikaze_wedding_past?tab=review`, `/employer/talent/wk_divine`, `/employer/payments/inv_003`.

**Worker app** — `src/app/worker`, bottom tabs, mobile-first single column

| Route | Page |
| --- | --- |
| `/worker` | Home — next shift, invitations, matched open shifts |
| `/worker/shifts/[id]` | Shift detail — apply, accept/decline, QR check-in, employer + venue info |
| `/worker/schedule` | Upcoming, pending and past shifts |
| `/worker/earnings` | Payouts to mobile money, pending vs paid, totals |
| `/worker/profile` | Public profile — skills, languages, ratings, verifications |
| `/worker/profile/settings` | Availability, payout details, notifications, prototype controls |
| `/worker/onboarding` | Sign-up flow: skills, availability, verification, MoMo number |
| `/worker/notifications` | Notification centre |

Try: `/worker/shifts/sh_ikaze_gala`.

**System** — `src/app/not-found.tsx` (any unknown path, e.g. `/does-not-exist`) and `src/app/error.tsx`.

## Architecture

Data flows one way, through four layers. Each layer only knows about the one below it:

```
  UI component            src/app/**, src/features/*/components/**
        │                 Thin route file → one client "screen" component.
        │                 Renders loading / empty / error / success. Never fetches.
        ▼
  Feature hook            src/features/<feature>/queries.ts
        │                 useOpenShifts(), useShift(id), useCreateShift() …
        │                 Owns query keys, cache invalidation, optimistic updates.
        ▼
  TanStack Query          src/lib/query/provider.tsx + keys.ts
        │                 Caching, retries, refetching. qk.* is the single key factory.
        ▼
  Service                 src/features/<feature>/api.ts
        │                 shiftsApi.listOpen(filters) — the seam. Pure async functions,
        │                 domain types in, domain types out. No React, no cache.
        ▼
  Mock store              src/lib/mock/store.ts  ←  src/data/mocks/seed.ts
                          In-memory backend: async methods, returns deep copies,
                          simulated latency + optional failures. localStorage-backed.
```

Two rules keep the seam clean, and both are enforced by convention across every feature:

- **Components never import `@/lib/mock/store`.** They only use hooks from `@/features/*`.
- **`api.ts` is the only file that touches the store.** Everything above it deals in domain types from `src/types/domain.ts`.

**The mock store** (`src/lib/mock/store.ts`) behaves like a real HTTP backend so the UI never has to be rewritten: every method is `async`, returns cloned data, applies ~320ms of jittered latency, and throws a typed `MockApiError` with `not_found` / `conflict` / `network` / `validation` codes. State is seeded from `src/data/mocks/` (8 employers, 24 workers, 23 shifts spanning past, present and future, plus bookings, invoices, payouts and notifications) and persisted to `localStorage` under `gigsyc.prototype.state.v4`. A stored day stamp means the data **re-seeds on the first visit each day**, so the demo never drifts too far from its intended shape.

**Swapping in a real API.** Rewrite the bodies in `src/features/*/api.ts` and delete `src/lib/mock/`. Nothing else has to change:

```ts
// src/features/shifts/api.ts — before
export const shiftsApi = {
  get: (id: string) => store.getShift(id),
  create: (input: CreateShiftInput) => store.createShift(input),
};

// after
export const shiftsApi = {
  get: (id: string) => http.get<Shift>(`/api/shifts/${id}`),
  create: (input: CreateShiftInput) => http.post<Shift>("/api/shifts", input),
};
```

Keep returning the same domain types, and keep throwing errors with a human-readable `message` (the UI surfaces `err.message` in `ErrorState` and `toast.error`). Query keys, hooks, cache invalidation and every component stay untouched. Real auth would replace `src/features/session/session-provider.tsx`, whose `Persona` shape (`{ role, userId, employerId? }`) is what the rest of the app consumes via `useEmployerSession()` / `useWorkerSession()`.

## Folder structure

```
src/
├── app/                      Routes only — thin server components that await params
│   ├── (marketing)/          /, /business, /workers, /how-it-works
│   ├── employer/             Employer portal + employer shell layout
│   ├── worker/               Worker app + worker shell layout
│   ├── login/                Persona picker
│   ├── layout.tsx            Fonts, QueryProvider, SessionProvider, Toaster
│   ├── error.tsx  not-found.tsx
│   └── globals.css           Tailwind v4 theme: the whole design system's tokens
│
├── features/                 One folder per domain slice — the unit of ownership
│   ├── <feature>/api.ts      Service layer (the swap point for a real API)
│   ├── <feature>/queries.ts  TanStack Query hooks
│   ├── <feature>/components/ Feature-local screens and components
│   └── <feature>/index.ts    Public surface of the feature
│       analytics · auth · bookings · discover · earnings · employer-dashboard
│       employer-settings · employers · job-posting · marketing · notifications
│       onboarding · payments · profile · prototype · schedule · session
│       shifts · talent-pool · workers
│
├── components/
│   ├── ui/                   Design-system primitives (Button, Card, Dialog, StatusBadge…)
│   ├── common/               Shared domain components (ShiftCard, WorkerCard, RoleIcon…)
│   ├── layout/               employer-shell, worker-shell, site-header, site-footer
│   └── brand/                Logo and wordmark
│
├── data/
│   ├── mocks/                Seed dataset — employers, workers, shifts, bookings
│   ├── roles.ts              Role catalogue (waiter, registration, setup crew…)
│   └── images.ts             Photo keys used by <Photo>
│
├── lib/
│   ├── mock/store.ts         The mock backend
│   ├── query/                QueryProvider + qk key factory
│   └── utils/                cn, formatRwf, phone, error helpers
│
└── types/domain.ts           Shift, Booking, Worker, Employer, Invoice, Payout…
```

## Design system

**[DESIGN.md](./DESIGN.md) is the contract** — read it before touching any UI. It defines the colour roles (navy primary, amber accent, cyan informational), the Onest type scale, radius and elevation rules, spacing, motion limits, the fixed meaning of every status colour, component rules, voice and tone, and the anti-patterns to reject on sight. Tokens live in `src/app/globals.css`; primitives live in `src/components/ui`.

## Known prototype limitations

This is a front-end prototype built to demonstrate the product, not a deployable system.

- **No backend.** No server, database or API. Everything runs in the browser against `src/lib/mock/store.ts`.
- **No real authentication.** `/login` picks a persona; there are no passwords, sessions or access control. Any `/employer/*` or `/worker/*` route can be opened directly, and the persona lives in `localStorage`.
- **Data is per-browser and resets daily.** State is stored in `localStorage` and re-seeds on the first visit of each new day, so bookings you create will disappear. Nothing is shared between browsers, devices or users — two people using the demo do not see each other's changes. Private browsing falls back to in-memory only.
- **Payments are simulated.** Mobile money payouts, invoice generation and the 18% service fee are calculated and animated, but no money moves and no payment provider is integrated.
- **QR check-in is simulated.** The QR code is generated and the check-in flow is complete, but there is no camera scanning or geofence verification — the shift detail page advances the booking state directly.
- **Notifications, email and SMS are display-only.** The notification centres read from the mock store; nothing is ever sent.
- **Verifications are seeded, not performed.** Identity, phone, photo, reference and skill badges come from the seed data; no document upload or identity check happens.
- **Search, ranking and analytics run on the seed set.** Candidate matching (`useShiftCandidates`) is a real scoring function, but over 24 mock workers — it is illustrative, not tuned.
- **Content is fictional.** All businesses, professionals, venues, ratings and figures are invented for the demo.
- **English only.** The product targets a Kinyarwanda / English / French market; the prototype is not localised.

Two demo-only controls are exposed in **Settings** on both sides (`/employer/settings`, `/worker/profile/settings`): **reset demo data** and **simulate an unreliable network**, which makes roughly one request in four fail so you can see the error and retry states.
