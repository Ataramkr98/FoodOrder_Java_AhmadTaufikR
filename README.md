# Bites — Food Order Platform

Multi-restaurant ordering: browse → customize → pay → live courier map. Web-responsive customer app plus restaurant, courier, and admin consoles in one repo.

## Demo

Customer (works offline, backend optional):

- Email: `demo@bites.co.id`
- Password: `demo12345`

Other roles: switch role in the header (Restaurant / Courier / Admin) — demo mode, no extra login.

Try: Home → restaurant → customize required modifiers → cart → checkout with `BITESHEMAT` → tracking map with PIN → restaurant accept → courier deliver → rating.

## Features

- Customer: search, cuisine filter, restaurant detail, modifiers, cart (single-resto guard), promo, tip, checkout, live tracking (Leaflet + WS), orders history, profile, ID/EN toggle
- Restaurant: order feed with sound, accept / start-prep / ready / reject, menu availability + price, store open/close
- Courier: online toggle, offers, EN_ROUTE → ARRIVED → PICKED_UP → ARRIVED_DROP → PIN deliver, live GPS simulation
- Admin: ops overview, order inspector, refund / redispatch / cancel, promo toggle
- System: 404, loading, error with retry, empty states, toast, demo login with validation

## Tech stack

- Frontend: Vite 6 + TypeScript 5 + Tailwind 3 (`brand #F97316`), Leaflet 1.9 + OSM, lucide icons, Signals-style `state.service` + `localStorage`
- Backend: Quarkus 3.15 Java 21, REST + WebSocket Next, Hibernate Panache, Flyway, SmallRye JWT (HS256 dev), Scheduler, Health
- Data: PostgreSQL 16 (Flyway `V1__init` + `V2__seed`), 4 restos / 40+ items / 4 promos aligned frontend/backend
- API envelope: `{success,message,data}` with `ApiErrorMapper` (400/404/409/500); idempotency via `Idempotency-Key`

## Architecture

```
Browser (4 roles, one SPA view-switcher)
  -> Vite proxy /api -> Quarkus /api/v1 (catalog, orders, payments, dispatch, tracking WS /ws/tracking/{id})
  -> Postgres (users, restaurants, menu, orders, payments, promos) + localStorage demo fallback
```

Backend modules: `com.bites.catalog|order|payment|dispatch|tracking|restaurantops|admin|user|common`. Order state machine in `OrderStatus` (`PENDING→AWAITING_RESTAURANT→ACCEPTED→PREPARING→READY_FOR_PICKUP→COURIER_ASSIGNED→...→DELIVERED`).

## Run

Frontend:

```bash
cd frontend
npm install
npm run dev # http://localhost:4200
npm run build # tsc + vite
```

Backend (optional — app works offline without it):

```bash
# needs Postgres db `bites` on localhost (user postgres/admin), Flyway auto-migrates
./mvnw.cmd -f backend quarkus:dev # http://localhost:8080
./mvnw.cmd -f backend test "-Dtest=OrderStatusTest,PromoCodeTest"
```

Env: copy `.env.example` → `.env` (root/backend/frontend variants included).

## Deployment

- Frontend: static `frontend/dist` → any CDN (Vercel/Netlify/Nginx); set `VITE_API_BASE=/api/v1`, proxy `/api` + `/ws` to Quarkus
- Backend: `mvn package` → `target/quarkus-app/quarkus-run.jar` → Docker/K8s; set `DB_HOST/DB_USER/DB_PASSWORD`, `quarkus.http.cors.origins` to your domain
- Health: `/q/health`, metrics: `/q/metrics`

## API (excerpt)

- `GET /api/v1/restaurants?q=` → `{success,data:Restaurant[]}`
- `GET /api/v1/restaurants/{key}/menu` → `{success,data:MenuItem[]}`
- `GET /api/v1/promos` → `{success,data:PromoCode[]}`
- `POST /api/v1/orders` (Idempotency-Key) → `201 {success,data:{id,orderNumber,status,pin,grandTotal}}`
- `POST /api/v1/payments/{id}/simulate-success` (demo settlement)
- `GET /api/v1/orders` / `GET /api/v1/orders/{id}` / `POST /api/v1/orders/{id}/rating`
- WS ` /ws/tracking/{orderId}` frames: `order_status, courier_assigned, courier_location, eta_update`

Note: root `src/org.acme` + root `pom.xml` are legacy Quarkus starter left untouched; canonical code is `frontend/` + `backend/`.
