# Bites Food-Order Platform — Portfolio-Ready Transformation Design

**Date:** 2026-10-06
**Scope:** Balanced polish (approved)
**Stack:** Vite vanilla-TS SPA + Tailwind 3 · Quarkus 3.15 (Java 21) + PostgreSQL 16 · Leaflet/OSM
**Goal:** Every folder intentional, every page functional/responsive/consistent/error-free, demo-ready, deployment-quality.

## 1. Understanding (agreed brief)

- Preserve good architecture: modular monolith `com.bites.*`, single SPA view-switcher, offline simulation fallback.
- Improve before replacing: no router rewrite, no microservices, no native apps.
- Portfolio value: customer journey shines, 4 roles work, demo data present, README + `.env.example` + demo accounts, builds pass.
- Constraints: no TODO/fake buttons/placeholders, one icon library (lucide), one design token set, standard API shape.

## 2. Completion map (Phase 1 audit)

**Completed (keep):**
- Customer flow home/restaurant/cart/checkout/tracking/orders/profile, mock-data (4 restos, 40+ items, 4 promos), i18n id/en, Leaflet tracking, cart localStorage, auto-simulation engine.
- Backend order state machine (§12), idempotency, Flyway V1+V2 seed aligned with frontend, catalog/order/payment/dispatch/tracking/admin resources, WS hub.
- Tailwind brand tokens (orange #F97316), Plus Jakarta Sans stack.

**Incomplete:**
- System pages: 404, loading, error, empty states; auth UI (login/register/forgot) is role-switcher only.
- Design system docs: color/type/spacing not enforced across portals.
- API consistency: responses not uniform `{success,message,data}`; validation partial; auth demo hard-coded.

**Broken (to fix):**
- Root `src/org.acme` template conflicts with `backend/` + `pom.xml`; default README is Quarkus template.
- `api.placeOrder` double-prefixes `/api/v1` (`API_BASE` + path) — verify and fix to single prefix.
- `hydrateFromBackend` + `mapBackendOrder` shape mismatch vs `OrderViewMapper`; WS reconnect leaks (recursive subscribe without disposer chaining).
- Seed vs mock promo definitions diverge (BITESHEMAT etc.); image asset paths under `food and drink image assets/` vs `/assets/food/` mismatch risk.

**Missing:**
- `.env.example`, demo accounts doc, deployment checklist, screenshots, sample-data generator note, admin promo CRUD wiring, courier GPS heartbeat wiring.

## 3. Design

### 3.1 Architecture
- Keep `frontend/` SPA + `backend/` Quarkus modular monolith. Delete or ignore root `src/` + root `pom.xml` in docs/build (keep file but exclude from portfolio build; document `backend/` as canonical).
- Add `frontend/src/app/features/system/` (not-found, error-view, loading-view, empty-state) + `auth/auth-view.ts` demo login. Wire into `main.ts` view-switcher: unknown view → 404; async boot → loading; fetch fail → error with retry.
- Backend: introduce `ApiResponse<T>{success,message,data}` + extend `ApiErrorMapper` to always return it; add Bean Validation on `PlaceOrderReq/ItemReq` (`@NotBlank,@NotNull,@Min`).

### 3.2 Components
- `RestaurantCard, MenuItemRow, ItemCustomizationSheet, CartDrawer, ServiceModeSelector, AddressPicker, PaymentMethodPicker, OrderStatusStepper, LiveMap, CourierCard, RatingSheet` — keep, unify via Tailwind tokens only.
- New: `Toast` (success/warn/error), `EmptyState`, `SkeletonCard`, `AuthForm` (demo login, validation, error text).
- Icons: lucide only via `icons.ts`; remove emoji-as-icon; 16/20/24px sizes, `aria-label`.

### 3.3 Data flow
- Single totals source: `state.service` (subtotal/delivery/service/discount/tip/grand). Checkout validates minSpend/stock before `placeOrder`.
- Online: `POST /orders` (Idempotency-Key) → `simulatePayment` → `attachTracking` WS → `applyTrackingEvent` reconciles. Offline: local `placeOrder` + `runAutoSimulation`. Every portal action calls `serverSync` fire-and-forget + optimistic UI.
- No fake buttons: audit header/footer/mobile-nav/admin toggles; either wire to state/API or remove.

### 3.4 Error handling
- Frontend: `api-client get/post` throw → toast + error-view with retry; forms show inline validation; tracking WS auto-reconnect 2s with single disposer.
- Backend: `IllegalArgumentException→400`, `NotFoundException→404`, `IllegalStateTransition→409`, all `{success:false,message,data:null}`; Flyway validate, ` phil` CORS locked to `http://localhost:4200` in dev + env override.

### 3.5 Testing / verification
- `npm run build` (tsc+vite), `mvn -f backend test`, manual 375/390/768/1440/1920px, offline + online order placement, restaurant accept→ready, courier accept→deliver PIN, admin promo toggle/refund/redispatch, WS live location.

## 4. Demo-ready
- Demo account: `demo@bites.co.id / demo12345` (frontend demo auth + seeded `usr-demo-cust`). Seed already has owner/courier/admin; document all four.
- Realistic data: keep 4 restos + 40 items + promos; ensure `/assets/food/` exists or fallback image; past delivered order + active order present on first load.
- Footer/header demo-mode badge: "Demo mode — backend offline" vs "Backend online".

## 5. Presentation
- Rewrite `README.md`: intro, problem, features, stack, architecture diagram, screenshots placeholder, demo accounts, install (frontend+backend+db), deployment (Docker/K8s), API table.
- Add `.env.example` + `backend/.env.example`; document `V1__init.sql/V2__seed.sql` + reset instructions.

## 6. Self-review
- No TBD/TODO; scope is single balanced-polish cycle; no contradictions (keeps view-switcher, no router); unambiguous file touch list in plan phase.

## 7. Execution transition
- Next: invoke `writing-plans` to produce phased implementation plan, then execute inline per user's do-not-stop directive.
