# GigSyc prototype — design & engineering conventions

Read this before touching any UI. It is the contract that keeps seven parallel slices looking like one product.

## What GigSyc is
A Kigali-based workforce platform: businesses post short-term shifts (banquets, conferences, activations, stock counts), verified professionals accept them, check in by QR, get rated, and are paid to mobile money. Brand line: **Powering Flexible Work**. Employer line: *The talent you need. When you need it.* Worker line: *Your skills. More opportunities. Your professional reputation.*

Two products in one codebase:
- **Employer portal** `/employer/*` — desktop-first, dense, operational. Sidebar shell already built (`components/layout/employer-shell.tsx`).
- **Worker app** `/worker/*` — mobile-first, bottom tabs, single column max-w-3xl. Shell built (`components/layout/worker-shell.tsx`).
- **Marketing** `/`, `/business`, `/workers`, `/how-it-works` and `/login` — header/footer built.

## Voice
Plain, specific, warm. Rwandan context (RWF, Kigali districts, MTN MoMo, real venue types). No "revolutionary", "seamless", "unlock", "empower". Buttons say what happens: "Post shift", "Confirm 4 workers", "Check in". Empty states explain *why* it's empty and offer the next step. Errors are human: "We couldn't reach GigSyc. Check your connection and try again."

## Visual system (already in `globals.css`)
- **Fonts**: **Onest** for everything (loaded via `next/font/google` as `--font-onest`). `font-display` and `font-sans` both resolve to Onest; use `font-display font-semibold` on headings, stats and money so weight carries hierarchy, not a second family. h1–h4 already use display + navy. Do not add other fonts.
- **Colour**: `navy-*` is the brand primary (`navy-900` = #001b56). `amber-500` (#ffb703) is the accent — use for *the* primary action on dark surfaces, urgency, ratings stars, small emphasis. Never as a large background block on white pages. `cyan-*` is informational only (open status, verified marks, focus ring). Neutrals are `ink-*`; page bg is `bg-canvas`, cards are `bg-surface`. Semantic: `success-*`, `warning-*`, `danger-*`, `info-*`. Text: `text-fg`, `text-fg-muted`, `text-fg-subtle`.
- **Radius**: cards/dialogs `rounded-lg` (12px). Buttons/inputs `rounded-md` (8px). Badges `rounded-sm`. Only avatars and chips are fully round. Do not exceed `rounded-2xl` anywhere.
- **Elevation**: cards use `shadow-card` (hairline + whisper). Hover lift `shadow-raised`. Popovers/modals `shadow-pop`. No other shadows. No gradients except a photo scrim (`from-navy-950/70 to-transparent`) when text sits on an image.
- **Spacing**: page sections `space-y-8` (employer) / `space-y-6` (worker). Card padding `p-5` (desktop) / `p-4` (mobile). Grid gaps `gap-4` or `gap-6`.
- **Type scale**: page title 24–28px (`PageHeader` does this). Section h2 18px. Card title 15–16px semibold. Body 14px. Meta 13px muted. Caption 12px. Never larger than 40px except the marketing hero (max ~56px).
- **Icons**: `lucide-react` only, 16px in text, 18–20px in buttons/nav. No emoji as icons.
- **Numbers**: add `tabular` class to any number that sits in a column or updates. Money via `formatRwf()`; never hand-format.
- **Photos**: only via `<Photo>` (`components/ui/photo.tsx`) with keys from `data/images.ts`. Alt text must be meaningful or `""` if purely decorative next to a title. Do not add new remote hosts.
- **Avatars**: initials only (`WorkerAvatar`, `EmployerMark`). No stock faces.
- **Motion**: `motion/react` for list stagger (`initial={{opacity:0,y:6}}`, ≤ 0.35s, `ease: [0.22,1,0.36,1]`), success moments (check-in confirmed, shift posted), drawer/modal entrance (already in Dialog). Tailwind transitions for hover/focus. Nothing loops, nothing bounces, nothing longer than 400ms. Respect `prefers-reduced-motion` (global CSS already does).

## Component rules
- Use primitives from `@/components/ui` — Button, Badge, *StatusBadge, Avatar, Card, Input/Textarea/Select, Field (render-prop for a11y wiring), Checkbox/Switch(+Field), Skeleton, EmptyState, ErrorState, Dialog/SheetContent, DropdownMenu, Tabs/Segmented, Chip, Progress/FillMeter, Stat, PageHeader/SectionHeading, Rating/StarInput, VerifiedMark, Tooltip, Stepper, Photo, DataList.
- Shared domain components in `@/components/common`: `ShiftCard` (worker-facing), `WorkerCard` (employer-facing), `RoleIcon`, `NotificationRow`/`NotificationBell`. Reuse these; do not fork them. If you need a variant, add a prop and keep existing usages working.
- **Status meaning is fixed** — see `status-badge.tsx`. Open=cyan, Filled=green, In progress=amber(dot), Completed=neutral, Cancelled=red. Do not invent new status colours.
- Every page: `PageHeader` at top. Employer pages may add `actions`. Worker pages keep headers short.
- Feature-local components live in `src/features/<feature>/components/`. Route files in `src/app/**` should be thin: server component page.tsx that renders one client "screen" component (`<JobsScreen />`). `params` are Promises in Next 16 — `const { id } = await params;` in page.tsx then pass `id` down.
- Client components only where interactivity or hooks are needed (`"use client"` at the top of the screen component, not the page).
- Never import from `@/lib/mock/store` in components. Use hooks from `@/features/*` (e.g. `useOpenShifts`, `useShift`, `useApplyToShift`). All hooks/services already exist; add new ones in the feature's `api.ts` + `queries.ts` if truly needed, and add the store method there.
- Every data-driven screen handles **loading** (skeleton matching layout — use `ShiftCardSkeleton`, `WorkerCardSkeleton`, `Skeleton`), **empty** (`EmptyState` with icon + next step), **error** (`ErrorState` with `onRetry={() => refetch()}`), and **success** (toast via `import { toast } from "sonner"` — `toast.success("Applied to Banquet servers", { description: "Ikaze usually confirms within a day." })`).
- Mutations: disable the button and show `loading` while pending; on error, `toast.error(err.message)`. Confirm destructive actions (cancel shift, withdraw, mark no-show) in a `Dialog`.
- Forms: `Field` + `Input`. Validate on submit and on blur after first submit; show errors inline. Multi-step uses `Stepper`. Keep state in one `useReducer`/`useState` object in the screen component.
- Lists > 8 items: search + filters at top (`Input leading={<Search/>}`, `Chip`s or `Segmented`). Sort in a `Select`. Show result count.
- Tables (employer): use semantic `<table>` inside `overflow-x-auto`; on `<md` collapse to stacked cards. Row click navigates; actions in a `DropdownMenu` (⋯).
- Accessibility: real `<button>`/`<a>`, labels on all inputs (Field handles it), `aria-current` on nav, focus visible (global), colour never the only signal (badge text + icon), min 44px touch targets on mobile.

## Data facts (don't contradict)
- Currency RWF, flat pay per shift (`payPerShift`), optional `transportAllowance`, `mealProvided`. Hours via `shiftHours()`.
- Employer invoices = worker pay + 18% service fee (`SERVICE_FEE_RATE`).
- Demo employer: **Ikaze Hospitality Group** (id `emp_ikaze`, user Diane Mukamana). Demo worker: **Aline Uwase** (id `wk_aline`). Use `useEmployerSession().employerId` / `useWorkerSession().workerId` — never hardcode ids in components.
- Booking flow: worker `applied` → employer `confirmed` (talent-pool workers auto-confirm) → `checked_in` (QR) → `completed` → employer approves + rates → payout `processing` → `paid`. Employers can `invite`; workers accept/decline. Statuses in `types/domain.ts`.
- Matching: `useShiftCandidates(shiftId)` returns `{worker, score, reasons}` ranked.
- Store persists to localStorage and resets daily; `store.reset()` exists for a Settings action. `store.chaos` toggles simulated failures.

## Anti-patterns (reject on sight)
Gradient heroes, glassmorphism, glow, floating blobs, 3-column icon feature grids repeated per page, pill badges as decoration, `Loading...` text, `any`, hardcoded arrays of data inside components, inline hex colours, `<img>`, `<div onClick>`, `alert()`, `console.log`, unused imports, one 600-line page component.

---

# Iteration 2 — Events, Login, Admin

Three surfaces added on top of the workforce product. They share the design system but must **feel different**:

| Surface | Feeling | Density | Signature |
|---|---|---|---|
| `/events`, `/events/[slug]`, homepage | Visual, exploratory, warm | Generous | Photography leads; amber for dates |
| `/login` | Premium, calm, trustworthy | Focused | Split screen, one image, no chrome |
| `/admin/*` | Practical, quiet, operational | Dense | **Light** sidebar, tables, no photography except thumbnails |

Do not make the admin look like the employer portal (that one is navy-sidebar). The admin shell is already built and is deliberately light.

## The shared event model — read this first
`Event` lives in `src/types/events.ts`. **One dataset, two audiences.** Public queries return only `status === "published"` events that have not finished. Admin queries return everything. So:
- Admin publishes → the event appears on `/events`.
- Admin unpublishes, rejects, archives or cancels → it disappears from `/events` and its detail page 404s (except `completed`/`cancelled`, which stay reachable by direct link so a customer with a link sees why).
- Never build a second events array. Never filter by status inside a component — the store already does it.

Hooks (all exist, do not add more):
- Public: `useEvents(filters)`, `usePastEvents()`, `useEvent(slug)`, `useRelatedEvents(id)`, `useDestinations()`, `useSavedEventIds(userId)`, `useToggleSavedEvent(userId)`, `useAttendEvent()`
- Admin: `useAdminEvents(filters)`, `useAdminEvent(id)`, `useSetEventStatus()`, `useSetEventFeatured()`, `useAdminDestinations()`, `useUpdateDestination()`, `useAdminUsers()`, `useSetUserStatus()`, `useSetPartnerVerified()`, `useReports()`, `useResolveReport()`, `useSystemServices()`
- Session: `useCustomerSession()` → `{ userId, signedIn }`, `useAdminSession()` → `{ userId }`, `DEMO_PERSONAS`, `HOME_FOR_ROLE`

## Event components — reuse, do not fork
`@/components/common`:
- `EventCard` — `layout="vertical" | "horizontal"`, `emphasis="default" | "hero"`, optional `saved` + `onToggleSave`, `organizerName`. This is **the** card. Every event anywhere uses it.
- `EventCardSkeleton`, `DateBlock`, `SaveEventButton`, `CategoryIcon`, `categoryIcon()`
- `eventPriceLabel(event)` → "Free" | "From RWF 12,000" · `isEventFree(event)` · `eventDateLabel(event)` (handles multi-day)

`@/components/ui`: `EventStatusBadge`, `UserStatusBadge`, `ReportStatusBadge`, `SeverityBadge`, `ServiceStatusBadge` — status colours are fixed, do not invent new ones.

Data: `EVENT_CATEGORIES` / `CATEGORY_LIST` / `PLACES` / `WHEN_OPTIONS` / `EVENT_STATUS_LABEL` from `@/data/events`.

## Events voice
Say **event**, not "listing" or "experience". Dates read as "Sat 19 Sep · 18:00". Prices are "Free" or "From RWF 12,000". Places are real: Kigali, Musanze, Rubavu, Huye, Nyanza, Karongi, Nyungwe, Akagera. Never claim real geolocation — "Events near you" is only acceptable if the user picked a place; otherwise say "Around Rwanda" or name the city.

## Amber is the events accent
On the public event surfaces amber marks **time** (dates, "Today", featured). Navy stays structural. Cyan stays informational. Green only for "Free".

## Admin rules
- Tables, not cards, on desktop; stacked rows under `md`. Row click opens the record; destructive and state-changing actions sit in a `⋯` menu or an explicit button with a confirm `Dialog`.
- Every state change toasts what happened in plain words: "Published. Kigali Jazz Junction is now live on the public site."
- Lead pages with what needs attention, not with KPI walls. Four stat tiles maximum.
- No photography beyond small thumbnails in tables.

---

# Iteration 3 — Authentication & onboarding

Identity is now one layer. Everything else derives from it.

## The auth layer (built, do not duplicate)
`src/features/auth/`
- `model.ts` — `personaForUser()`, `destinationForUser()`, `onboardingPathForRole()`
- `auth-service.ts` — **the only seam to "the identity provider"**. Replace its bodies with real HTTP/OAuth later; nothing above it changes.
- `auth-provider.tsx` — `useAuth()` → `{ user, persona, isAuthenticated, ready, login, loginWithGoogle, signup, logout, verifyEmail, completeOnboarding, completePartnerOnboarding, updateUser, setUser, destination }`
- `guards.tsx` — `<RequireAuth>`, `<RequireRole roles={[...]}>`, `<RedirectIfAuthenticated>`, `<RequireOnboarding role>`

**Components must never invent auth state.** Use `useAuth()`. The old `useSession`, `useEmployerSession`, `useWorkerSession`, `useCustomerSession`, `useAdminSession` still work — they are now derived views of the same user, so do not "fix" them.

`ready` is false until localStorage is read. Always wait for it before redirecting, or a signed-in user gets bounced to /login on reload.

## User model
`AuthUser` in `src/types/auth.ts`: `id, name, email, role, avatarColor, emailVerified, onboardingCompleted, signInMethod, createdAt, location?, interests[], discoveryPreference?, organization?, employerId?, workerId?, platformUserId?`.

Roles: `customer` · `partner` · `worker` · `admin`. Partner maps to the existing Employer record, so a partner's workspace is the employer portal.

## Routing rules — centralised, do not re-implement
```
signed out + protected page  → /login?next=…
signed in + /login|/signup   → destinationForUser(user)
email signup, unverified     → /verify-email
onboarding not completed     → /onboarding (customer) · /onboarding/partner · /worker/onboarding
customer                     → /events
partner                      → /partner
worker                       → /worker
admin                        → /admin   (admins never see consumer onboarding)
```

## Shared shells (built, reuse them)
- `AuthLayout` + `AUTH_PANELS` + `AuthHeading` — `src/components/layout/auth-layout.tsx`. Photo left from `lg`, form right, photo dropped entirely below `lg`. Used by /login, /signup, /forgot-password, /reset-password, /verify-email.
- `OnboardingShell` + `OnboardingProgress` + `OnboardingHeading` + `SelectTile` — `src/components/layout/onboarding-shell.tsx`. Slim bar and "2 of 3", sticky footer action.
- `GoogleButton` + `AppleButton` + `GoogleMark` + `AppleMark` + `AuthDivider` — `src/components/ui/social-auth.tsx` (the old `google-button.tsx` path still re-exports these). Both marks are the providers' official assets; never redraw, recolour or restyle them. Google's button is white with a hairline border, Apple's is black with a white mark — that contrast is deliberate and required by their guidelines. Stack them in that order above the `AuthDivider` on both /login and /signup.

## Federated sign-in — the safety rule
The simulated choosers **must never ask for a password, PIN or any credential**. Each presents accounts from `src/data/mocks/accounts.ts` (`GOOGLE_ACCOUNTS`, `APPLE_ACCOUNTS`), the person picks one, and `loginWithGoogle()` / `loginWithApple()` returns a user. Label every such dialog plainly as a prototype simulation. A fake provider credential form is a phishing pattern and is forbidden.

Apple specifics worth honouring: one of the seeded Apple IDs has `hideMyEmail: true`. When that account is chosen, sign in with a relay address at `APPLE_RELAY_DOMAIN` rather than the real one, and say so in one quiet line — it is what Apple actually does and it changes what an organiser sees. Federated accounts arrive with `emailVerified: true` and therefore skip /verify-email.

## Onboarding rules
Customer: 3 steps (welcome is part of step one, then location, then interests) plus an optional preference step. Maximum 4. Partner: organisation, contact, location, done. `onboardingCompleted` is set once and never asked again.

Interests live in `INTERESTS` / `INTEREST_LIST` (`src/data/auth.ts`) with `categoriesForInterests()` mapping them to event categories for mock personalisation. Say "Because you like culture", never imply a real recommendation engine.

## Email verification
Six-digit code, any six digits accepted. No developer button anywhere in the design.

---

# Iteration 4 — Partner events & the two workspaces

## The gap being closed
Partners could hire staff but not list events. Now the loop is complete: **partner submits → admin reviews → public sees**. The partner workspace lives at `/employer/*` (`/partner` redirects there).

## Organizer event layer (built, reuse)
`@/features/events`: `useOrganizerEvents(employerId)`, `useOrganizerEvent(employerId, id)`, `useCreateOrganizerEvent(employerId)`, `useUpdateOrganizerEvent(employerId)`, `useSubmitOrganizerEvent(employerId)`, `useCancelOrganizerEvent(employerId)`. Input type `OrganizerEventInput`. Get `employerId` from `useEmployerSession()`.

Rules the store enforces — do not duplicate them in the UI, but do reflect them:
- A partner's event enters as `pending_review` or `draft`, never `published`. Only admin publishes.
- Partners can edit `draft`, `pending_review` and `rejected`. Editing a rejected event resubmits it. Published events are read-only for the partner.
- Cancelling is the partner's one power over a live event; it leaves `/events` immediately.
- Every submission notifies the admin persona, so the console's bell moves when a partner acts.

## Two workspaces, two temperatures
| | Partner (`/employer`) | Admin (`/admin`) |
|---|---|---|
| Sidebar | Navy | Light |
| Voice | Warm, first-person plural, outward: "your next event", "guests" | Neutral, operational: "pending review", "reports" |
| Imagery | Event cover photos lead. The organiser's own `EmployerMark`. | Thumbnails only |
| Lead metric | The next event and who is coming | What needs a decision |
| Amber | Primary action and the date on event cards | Attention badges only |

Partner screens should feel like a promoter's desk, not a moderator's. Use `Photo` for event covers generously; use `EventCard` for the partner's own events where a card fits, and `EventStatusBadge` for status — the same colours the admin sees, so a partner's "Pending review" and the admin's are one thing.

## Status vocabulary for partners (map, don't invent)
`draft` → "Draft — only you can see this" · `pending_review` → "With GigSyc for review" · `published` → "Live on GigSyc" · `rejected` → "Needs changes" (show the review note) · `cancelled` → "Cancelled" · `completed` → "Finished".
