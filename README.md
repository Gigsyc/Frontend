# GigSyc — Powering Flexible Work

GigSyc is a Kigali-based workforce platform that connects businesses with verified professionals for short-term, event and project work. A hotel, conference centre or brand agency posts a shift (banquet service, delegate registration, a retail activation, a stock count) with a flat RWF rate; ranked, verified professionals apply or are invited; the employer confirms a crew, runs QR check-in on the day, then approves hours and rates the work — which releases payment to the worker's mobile money and rolls the cost into a fortnightly invoice with an 18% service fee. GigSyc also runs the public events calendar those shifts staff: customers browse what is on across Rwanda at `/events`, organisers submit the listings, and GigSyc staff approve them. This repository is a **front-end prototype** of that product: four experiences in one Next.js codebase — a public **events site** (`/events`), a desktop-first **employer portal** (`/employer/*`), a mobile-first **worker app** (`/worker/*`) and an internal **admin console** (`/admin/*`), plus the marketing site — all running against an in-browser mock backend with no server, no real accounts and no real money.

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

Go to **[/login](http://localhost:3000/login)** and pick one of the four accounts — clicking a row signs you straight in, no password needed. The page lists each one with its name, role and seeded email address. Above the rows the same page also takes a real email and password, or a simulated Google or Apple identity, and **[/signup](http://localhost:3000/signup)** creates a new account that goes through verification and onboarding like any first-time visitor.

| Account | Who | Lands on | What you can do |
| --- | --- | --- | --- |
| **Explorer** | **Chantal Iradukunda**, a customer in Kigali (`pu_chantal`) | `/events` | Browse and filter what is on across Rwanda, open an event, save it, and take a ticket or registration through to confirmation |
| **Partner** | Diane Mukamana, Events & Banquets Manager at **Ikaze Hospitality Group** (`emp_ikaze`) | `/employer` | Post shifts, rank and confirm candidates, run QR attendance, approve hours and rate workers, review invoices and analytics |
| **Professional** | **Aline Uwase**, hospitality student, 4.9★ over 42 shifts (`wk_aline`) | `/worker` | Browse and apply to open shifts, accept an invitation, check in by QR, track MoMo payouts and build a profile |
| **Platform admin** | **Patrick Nsengimana**, GigSyc operations (`pu_patrick`) | `/admin` | Approve, reject, feature or pull events; manage destinations, users, partners and reports; read platform analytics and service status |

`/login?as=<customer\|organizer\|worker\|admin>` preselects a row, which is how the marketing pages and the account menu link into it. An email the seed does not recognise is now rejected — sign-in goes through `authService`, so unknown addresses fail with "We don't recognise that email address." Create one at `/signup` instead.

All four accounts share one live dataset, so an action on one side shows up on the others — confirm Aline for a shift as the partner, then switch and see it in her schedule; approve a pending event as the admin, then open `/events` and find it listed. Switch accounts any time from the account menu in the shell.

The signed-in account is stored in `localStorage` under `gigsyc.prototype.auth`, and every persona (`useEmployerSession`, `useWorkerSession`, …) is derived from it. The public surfaces — `/`, `/events`, `/events/[slug]`, `/become-a-partner` — are open to anyone. The portals are not: `/employer/*` and `/worker/*` require a session and `/admin/*` requires the admin role, so a signed-out deep link lands on `/login?next=…` and returns to the page you asked for once you pick an account.

## Route map

**Marketing** — `src/app/(marketing)`

| Route | Page |
| --- | --- |
| `/` | Home — brand, how it works, what's happening (live events), featured shift, both audiences |
| `/business` | For businesses — the employer pitch |
| `/workers` | For professionals — the worker pitch |
| `/how-it-works` | End-to-end flow for both sides |
| `/become-a-partner` | Partner pitch — what GigSyc does for organisers, and the way into `/signup?role=partner` |

**Accounts, sign-up and onboarding** — `src/app/login`, `signup`, `verify-email`, `forgot-password`, `reset-password`, `onboarding`, `account`, `partner`; centred auth shell

| Route | Page |
| --- | --- |
| `/login` | Sign in — email and password, a simulated Google or Apple identity, or one of the four demo rows. `?as=customer\|organizer\|worker\|admin` preselects a row; `?next=` returns you to the page that bounced you |
| `/signup` | Create an account — name, email, password with a strength meter, or a provider button. `?role=partner` signs you up as a partner; `?next=` is carried through verification and onboarding |
| `/verify-email` | Six-digit code for the address on the account — resend on a 30s cooldown, or change the address. Nothing is sent and any six digits pass |
| `/forgot-password` | Ask for reset instructions. The answer never reveals whether an address is registered |
| `/reset-password` | Choose a new password. `?token=demo` stands in for the link the prototype would have emailed; without a token the page says the link is invalid |
| `/onboarding` | Customer onboarding — where you are, what you like, and how you want to discover. Three questions and an optional fourth |
| `/onboarding/partner` | Partner onboarding — organisation, contact, location. Finishing creates the `Employer` record and opens the workspace |
| `/partner` | Partner home — forwards a finished partner into `/employer`, and everyone else wherever they belong |
| `/account` | Your profile, interests, saved events and settings. Tabs via `?tab=profile\|interests\|saved\|settings`; a worker, partner or admin sees profile and settings only |

Try: `/signup?role=partner`, `/login?next=%2Faccount`, `/reset-password?token=demo`, `/account?tab=saved`.

**Public events** — `src/app/events`, site header/footer shell, mobile-first grid

| Route | Page |
| --- | --- |
| `/events` | Discovery — search, category rail, date windows, place browser, featured row, saved view |
| `/events/[slug]` | Event detail — hero, about, when & where, tickets, organiser, gallery, related events |

Everything `/events` is narrowed by lives in the URL, so a filtered board is shareable: `?q=` search · `?when=today\|tomorrow\|weekend\|week\|month` · `?cat=` comma-separated categories · `?place=` · `?price=free\|paid` · `?sort=soonest\|popular\|price_asc\|newest` · `?view=saved`.

Try: `/events?when=weekend`, `/events?cat=music,food`, `/events?view=saved`, `/events/kigali-jazz-junction`, `/events/ubumuntu-arts-festival`.

**Employer portal** — `src/app/employer`, sidebar shell, desktop-first

| Route | Page |
| --- | --- |
| `/employer` | Dashboard — today's shifts, staffing gaps, applications to review |
| `/employer/jobs` | All shifts: drafts, open, filled, in progress, completed, cancelled |
| `/employer/events` | All shifts: drafts, open, filled, in progress, completed, cancelled | — a partner's own events: list, detail, and the submit-event wizard at `/employer/events/new`; submissions enter the admin review queue
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

**Admin console** — `src/app/admin`, sidebar shell, desktop-first

| Route | Page |
| --- | --- |
| `/admin` | Overview — what is waiting on review, and the week on the public site |
| `/admin/events` | Every event organisers have submitted, published or pulled — a tab per review state via `?status=`, plus `?q=`, `?category=`, `?place=`, `?sort=` |
| `/admin/events/[id]` | Event detail — approve, reject with a reason, feature, unpublish or cancel |
| `/admin/destinations` | The eight places customers browse; unpublishing one removes it from "Browse by place" |
| `/admin/users` | Everyone with an account: customers, professionals, organisers and staff |
| `/admin/partners` | Organisations that run events; verifying one unlocks ticket sales and the verified mark |
| `/admin/moderation` | Reports raised against events, organisers and users |
| `/admin/analytics` | What is live publicly: categories, places and who fills the calendar |
| `/admin/system` | Mock service status — uptime and latency per service |
| `/admin/settings` | Platform naming, the review rule for new events, and who can open the console |

Try: `/admin/events?status=pending_review`, `/admin/events/ev_braaifest`, `/admin/events/ev_jazz`.

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

**The mock store** (`src/lib/mock/store.ts`) behaves like a real HTTP backend so the UI never has to be rewritten: every method is `async`, returns cloned data, applies ~320ms of jittered latency, and throws a typed `MockApiError` with `not_found` / `conflict` / `network` / `validation` codes. State is seeded from `src/data/mocks/` (12 employers, 24 workers, 24 shifts and 43 events spanning past, present and future, plus 8 destinations, platform users, bookings, invoices, payouts, reports and notifications) and persisted to `localStorage` under `gigsyc.prototype.state.v5`. A stored day stamp means the data **re-seeds on the first visit each day**, so the demo never drifts too far from its intended shape.

### Auth, verification and onboarding

Identity is its own feature slice (`src/features/auth`), built on the same seam as the data layers above.

- **`useAuth()`** (`auth-provider.tsx`) is the only way to read or change the session. It exposes `user`, the derived `persona`, `isAuthenticated`, and a **`ready`** flag that stays false until `localStorage` has been read on the client — every guard waits for it, which is what stops a signed-in visitor being bounced to `/login` on reload. Every mutation (`login`, `signup`, `loginWithGoogle`, `loginWithApple`, `verifyEmail`, `completeOnboarding`, `completePartnerOnboarding`, `updateUser`, `logout`) writes through one place, and `useSyncExternalStore` keeps every tab on the same session, stored under `gigsyc.prototype.auth`.
- **`authService`** (`auth-service.ts`) is the identity seam, and the only file in the slice that touches the store — the same rule `api.ts` follows for domain data. Going live means rewriting these bodies and nothing above them: `signIn` becomes a credential POST, `signInWithGoogle` an OAuth code exchange. Note what the provider methods accept — an already-chosen identity, never a credential. No third-party password is ever typed into this app.
- **`model.ts`** holds the routing rules as pure functions, written once rather than re-derived per page: `destinationForUser` (where a user belongs right now), `destinationAfterSignIn` (the same, with `?next=` applied), `onboardingPathForRole`, and `safeNext`, which follows only a same-origin path — one leading slash, never `//` or `/\`, both of which a browser reads as another host.
- **The guards** (`guards.tsx`) apply those rules in the tree, on the client after hydration, because the session lives in `localStorage` and there is no server to check it in middleware. `RequireAuth` sends a signed-out visitor to `/login?next=…` (it wraps `/employer/*`, `/worker/*`, `/verify-email` and `/account`); `RequireRole` sends the wrong role to its own home (`/admin/*`, and both onboarding flows); `RedirectIfAuthenticated` walks an already-signed-in visitor past `/login` and `/signup`; `RequireOnboarding` keeps the onboarding routes open only while they are actually unfinished.

**The journey.** `/signup` creates the account and signs it in; from there `destinationAfterSignIn` takes over, and the pending step always wins — an unverified address or unfinished onboarding outranks whatever `?next=` asked for, so a deep link can never walk past either:

```
  /signup ──► /verify-email ──► /onboarding ─────────────► /events      customer
   │           six digits,       place, interests,
   │           any six pass      discovery preference
   │
   │  ?role=partner              /onboarding/partner ────► /partner ──► /employer
   │                             organisation, contact,    creates the Employer
   │                             location                  record and the workspace
   │
   └─ Google / Apple ──► straight past /verify-email — the provider vouched for the
                         address, so the account is created already verified
```

A professional's equivalent is `/worker/onboarding`. An admin has none: `onboardingPathForRole("admin")` returns `/admin`, and `/onboarding` is wrapped in `RequireRole roles={["customer"]}`, so the consumer flow is closed to every other role from both directions — and `RequireOnboarding` redirects anyone whose `onboardingCompleted` is already true.

### One event model, two audiences

The public events site and the admin console are not two datasets. There is a single `Event` record (`src/types/events.ts`), and its `status` is the only switch between them:

| Status | On `/events` | Reachable at `/events/[slug]` | Set by |
| --- | --- | --- | --- |
| `draft` | No | No | Not submitted yet, or unpublished by an admin |
| `pending_review` | No | No | Submitted, waiting on an admin |
| `published` | Listed while upcoming, then under past events | Yes | An admin approved it |
| `rejected` | No | No | An admin turned it down, with a reason |
| `cancelled` | No | Yes, marked cancelled | Called off after publishing |
| `completed` | Under past events | Yes | Its last day has passed |

The public read path never widens this. `store.listPublicEvents` keeps `published` events that have not finished; `store.getPublicEventBySlug` throws `not_found` for anything `isPubliclyReachable()` rejects (`src/data/events.ts`). So **approving an event in the admin console is what puts it on the public site**, and rejecting, unpublishing or cancelling one genuinely takes it down.

Try it: `/events/crypto-wealth-seminar` (rejected) and `/events/kigali-christmas-market` (draft) both land on the "we couldn't find that event" state. Open `/admin/events?status=pending_review`, publish one of the eight events waiting there, and it appears on `/events` immediately — same record, same store, no second copy to keep in sync.

The event detail route server-renders the seed's answer for the first paint, so the page has a real title and content in its HTML, then refetches on mount and lets the browser store — where the admin's change actually lands — have the last word. An event the seed does not already consider public renders nothing on the server, so a draft or rejected listing never reaches the HTML even for a moment.

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

Keep returning the same domain types, and keep throwing errors with a human-readable `message` (the UI surfaces `err.message` in `ErrorState` and `toast.error`). Query keys, hooks, cache invalidation and every component stay untouched. Real auth swaps the same way, one file down: rewrite the bodies in `src/features/auth/auth-service.ts`. The `Persona` shape (`{ role, userId, employerId? }`) that the rest of the app consumes via `useEmployerSession()` / `useWorkerSession()` is derived from the signed-in `AuthUser` by `personaForUser` (`src/features/auth/model.ts`), so there is one identity to replace, not two.

## Folder structure

```
src/
├── app/                      Routes only — thin server components that await params
│   ├── (marketing)/          /, /business, /workers, /how-it-works
│   ├── events/               Public events discovery + event detail
│   ├── employer/             Employer portal + employer shell layout
│   ├── worker/               Worker app + worker shell layout
│   ├── admin/                Admin console + admin shell layout
│   ├── login/  signup/       Sign in, create an account
│   ├── verify-email/         Six-digit code step
│   ├── forgot-password/  reset-password/
│   ├── onboarding/           Customer flow + onboarding/partner
│   ├── account/              Profile, interests, saved, settings
│   ├── partner/  become-a-partner/
│   ├── layout.tsx            Fonts, QueryProvider, AuthProvider, SessionProvider, Toaster
│   ├── error.tsx  not-found.tsx
│   └── globals.css           Tailwind v4 theme: the whole design system's tokens
│
├── features/                 One folder per domain slice — the unit of ownership
│   ├── <feature>/api.ts      Service layer (the swap point for a real API)
│   ├── <feature>/queries.ts  TanStack Query hooks
│   ├── <feature>/components/ Feature-local screens and components
│   ├── <feature>/index.ts    Public surface of the feature
│   ├── auth/auth-service.ts  Identity seam · auth-provider.tsx (useAuth)
│   ├── auth/guards.tsx       RequireAuth · RequireRole · RequireOnboarding
│   └── auth/model.ts         destinationForUser, safeNext — the routing rules
│       admin · analytics · auth · bookings · discover · earnings
│       employer-dashboard · employer-settings · employers · events
│       job-posting · marketing · notifications · onboarding · payments
│       profile · prototype · schedule · session · shifts · talent-pool · workers
│
├── components/
│   ├── ui/                   Design-system primitives (Button, Card, Dialog, StatusBadge…)
│   ├── common/               Shared domain components (ShiftCard, WorkerCard, RoleIcon…)
│   ├── layout/               employer-shell, worker-shell, site-header, site-footer
│   └── brand/                Logo and wordmark
│
├── data/
│   ├── mocks/                Seed dataset — employers, workers, shifts, bookings,
│   │                         events, destinations, platform users, reports
│   ├── events.ts             Event categories, places, date windows, visibility rule
│   ├── roles.ts              Role catalogue (waiter, registration, setup crew…)
│   └── images.ts             Photo keys used by <Photo>
│
├── lib/
│   ├── mock/store.ts         The mock backend
│   ├── query/                QueryProvider + qk key factory
│   └── utils/                cn, formatRwf, phone, error helpers
│
└── types/
    ├── domain.ts             Shift, Booking, Worker, Employer, Invoice, Payout…
    ├── auth.ts               AuthUser, SignUpInput, onboarding inputs
    └── events.ts             Event, EventStatus, EventCategory, Destination…
```

## Design system

**[DESIGN.md](./DESIGN.md) is the contract** — read it before touching any UI. It defines the colour roles (navy primary, amber accent, cyan informational), the Onest type scale, radius and elevation rules, spacing, motion limits, the fixed meaning of every status colour, component rules, voice and tone, and the anti-patterns to reject on sight. Tokens live in `src/app/globals.css`; primitives live in `src/components/ui`.

## Known prototype limitations

This is a front-end prototype built to demonstrate the product, not a deployable system.

- **No backend.** No server, database or API. Everything runs in the browser against `src/lib/mock/store.ts`.
- **Authentication is real in shape, not in substance.** There are accounts, passwords, roles and route guards, and they behave consistently — a signed-out deep link lands on `/login?next=…`, `/admin/*` turns away every non-admin, and unfinished verification or onboarding outranks any `?next=`. But it is all client-side: the session is a `localStorage` record, passwords are checked by the mock store, and the guards run after hydration in the browser. **None of it is a security boundary** — anyone can edit `localStorage` and reach any screen. Real enforcement needs a server, which this prototype does not have.
- **Third-party sign-in is simulated.** The Google and Apple buttons open a plain account chooser that asks for nothing — no password, no PIN, no recovery question — and says on its face that it is a prototype simulation. No provider is ever contacted and no third-party credential is ever collected.
- **Data is per-browser and resets daily.** State is stored in `localStorage` and re-seeds on the first visit of each new day, so bookings you create will disappear. Nothing is shared between browsers, devices or users — two people using the demo do not see each other's changes. Private browsing falls back to in-memory only.
- **Payments are simulated.** Mobile money payouts, invoice generation and the 18% service fee are calculated and animated, but no money moves and no payment provider is integrated.
- **QR check-in is simulated.** The QR code is generated and the check-in flow is complete, but there is no camera scanning or geofence verification — the shift detail page advances the booking state directly.
- **Notifications, email and SMS are display-only.** The notification centres read from the mock store; nothing is ever sent. The two screens that would otherwise depend on an email say so on the page: `/verify-email` accepts any six digits, and the "check your email" panel after a reset request offers `/reset-password?token=demo` instead of mailing a link.
- **Verifications are seeded, not performed.** Identity, phone, photo, reference and skill badges come from the seed data; no document upload or identity check happens.
- **Search, ranking and analytics run on the seed set.** Candidate matching (`useShiftCandidates`) is a real scoring function, but over 24 mock workers — it is illustrative, not tuned.
- **Content is fictional.** All businesses, professionals, venues, ratings and figures are invented for the demo.
- **English only.** The product targets a Kinyarwanda / English / French market; the prototype is not localised.

Two demo-only controls are exposed in **Settings** on every side (`/employer/settings`, `/worker/profile/settings`, `/admin/settings`): **reset demo data** and **simulate an unreliable network**, which makes roughly one request in four fail so you can see the error and retry states.
