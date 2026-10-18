# Bites Portfolio Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Bites food-order repo into portfolio-ready showcase with working demo, consistent UI, uniform API, and deployment docs.

**Architecture:** Keep Vite vanilla-TS SPA view-switcher + Quarkus modular monolith; add system/auth UI frontend-only, wrap backend responses, align seed/mock, rewrite README. Offline-first demo preserved.

**Tech Stack:** Vite 6 + TypeScript 5 + Tailwind 3 + Leaflet 1.9 + lucide; Quarkus 3.15 Java 21 + PostgreSQL 16 + Flyway; no new deps.

**Spec:** `docs/superpowers/specs/2026-10-06-bites-portfolio-design.md`

## Global Constraints

- Preserve existing good architecture; improve before replacing.
- No TODO, no fake buttons, no placeholder content, no useless features.
- One icon library: lucide via `frontend/src/app/shared/components/icons.ts`; sizes 16/20/24px.
- Design tokens only from `frontend/tailwind.config.js` (brand #F97316, surface, status colors).
- Backend responses must be `{success:true,message:"",data:{}}` shape via `ApiErrorMapper`.
- Demo account `demo@bites.co.id / demo12345` must work offline.
- Frontend builds with `npm run build` (tsc + vite); backend builds with `mvn -f backend test` or package.
- Responsive: 375px, 390px, 768px, 1440px, 1920px.

## Review Focus

- Empty cart checkout with promo applied should block with clear message, not NaN total.
- Unknown view/route should render 404 page, not blank `view-root`.
- Backend `POST /orders` with bad restaurantId should return 400 `{success:false}`, not 500 HTML.
- WS disconnect during tracking should auto-reconnect once, not spawn duplicate sockets.
- Promo code case-insensitivity (`biteshemat` vs `BITESHEMAT`) should both apply when active.

---

### Task 1: Fix api-client double prefix + backend resilience

**Files:**
- Modify: `frontend/src/app/core/services/api-client.ts`
- Modify: `frontend/src/app/core/services/state.service.ts:81-122`
- Test: manual `npm run build` + browser console check

**Interfaces:**
- Consumes: `API_BASE='/api/v1'` constant, `fetch` API.
- Produces: `api.getRestaurants(): Promise<Restaurant[]>`, `api.placeOrder(): Promise<{id,orderNumber,status,pin,grandTotal}>`, `pingBackend(): Promise<boolean>` — same signatures, fixed URLs.

- [ ] **Step 1: Write the failing check**

```typescript
// /tmp/check-api-prefix.mjs — run with node
import fs from 'fs';
const src = fs.readFileSync('frontend/src/app/core/services/api-client.ts','utf8');
const hasDoublePrefix = src.includes('API_BASE}/orders') || src.includes('`${API_BASE}/orders`');
console.log('has API_BASE inside post path (bug):', hasDoublePrefix);
if (!hasDoublePrefix) { console.error('EXPECTED BUG NOT FOUND'); process.exit(1); }
```

- [ ] **Step 2: Run check to verify bug exists**

Run: `node /tmp/check-api-prefix.mjs`
Expected: prints `true`, exit 0 (bug confirmed: `post(`${API_BASE}/orders`...)` called as `post` which already prepends `API_BASE`).

- [ ] **Step 3: Write minimal implementation**

In `frontend/src/app/core/services/api-client.ts`:
1. Change `async function post<T>(path: string...` callers to pass `/orders` not `${API_BASE}/orders`. Specifically fix:
```typescript
return post(`${API_BASE}/orders`, payload, ...
// to:
return post(`/orders`, payload, ...
```
and same for `/payments/...`, `/orders/.../rating`, `/restaurant/...`, `/courier/...`, `/admin/...`.
2. Keep `get<T>` unchanged (already takes `/restaurants` and prepends `API_BASE`).
3. In `pingBackend`, keep 1500ms AbortController, cache `backendAvailable`, export `resetBackendCache()` for tests:
```typescript
export function resetBackendCache(){ backendAvailable = null; }
```

- [ ] **Step 4: Run verification**

Run: `node -e "import('fs').then(fs=>{const s=fs.readFileSync('frontend/src/app/core/services/api-client.ts','utf8');console.log('double-prefix remains:',s.includes('post(`${API_BASE}'))})"`
Expected: `false`
Run: `npm run build --prefix frontend`
Expected: PASS (tsc + vite build succeeds)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/services/api-client.ts
git commit -m "fix: correct api-client double /api/v1 prefix"
```

### Task 2: System pages + demo auth + toast

**Files:**
- Create: `frontend/src/app/features/system/system-views.ts`
- Create: `frontend/src/app/features/auth/auth-view.ts`
- Create: `frontend/src/app/shared/components/toast.ts`
- Modify: `frontend/src/main.ts`
- Modify: `frontend/src/app/core/services/state.service.ts` (add demo session)

**Interfaces:**
- Consumes: `stateService.getState()`, `icon(name,cls)` from icons.ts.
- Produces: `renderNotFound(el:HTMLElement,onHome:()=>void):()=>void`, `renderErrorView(el,msg,onRetry):()=>void`, `renderLoadingView(el):()=>void`, `renderEmptyState(el,title,sub,actionLabel,onAction):()=>void`, `renderAuthView(el,onSuccess):()=>void`, `toast(msg,type:'success'|'error'|'info'):void`.

- [ ] **Step 1: Write the failing check**

```bash
test -f frontend/src/app/features/system/system-views.ts && echo FOUND || echo MISSING
test -f frontend/src/app/features/auth/auth-view.ts && echo FOUND || echo MISSING
test -f frontend/src/app/shared/components/toast.ts && echo FOUND || echo MISSING
```
Expected: all `MISSING`.

- [ ] **Step 2: Run to confirm missing**

Run above in PowerShell: `if (Test-Path frontend/src/app/features/system/system-views.ts) { 'FOUND' } else { 'MISSING' }` etc.
Expected: MISSING.

- [ ] **Step 3: Write minimal implementation**

`system-views.ts`:
```typescript
import { icon } from '../../shared/components/icons';
export function renderNotFound(el:HTMLElement,onHome:()=>void){el.innerHTML=`<div class="max-w-md mx-auto text-center py-16"><div class="mx-auto w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">${icon('search','w-7 h-7 text-brand-600')}</div><h1 class="mt-4 text-2xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1><p class="mt-2 text-sm text-slate-500">Tautan yang kamu buka tidak tersedia.</p><button data-act="home" class="mt-6 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600">Kembali ke Beranda</button></div>`;el.querySelector('[data-act="home"]')?.addEventListener('click',onHome);return ()=>{el.innerHTML='';};}
export function renderLoadingView(el:HTMLElement){el.innerHTML=`<div class="py-16 flex flex-col items-center gap-3"><div class="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin"></div><p class="text-sm text-slate-500">Memuat...</p></div>`;return ()=>{el.innerHTML='';};}
export function renderErrorView(el:HTMLElement,msg:string,onRetry:()=>void){el.innerHTML=`<div class="max-w-md mx-auto text-center py-16"><h1 class="text-xl font-extrabold text-slate-900">Terjadi kesalahan</h1><p class="mt-2 text-sm text-slate-500">${msg}</p><button data-act="retry" class="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Coba lagi</button></div>`;el.querySelector('[data-act="retry"]')?.addEventListener('click',onRetry);return ()=>{el.innerHTML='';};}
export function renderEmptyState(el:HTMLElement,title:string,sub:string,label:string,onAction:()=>void){el.innerHTML=`<div class="text-center py-12"><p class="font-bold text-slate-900">${title}</p><p class="text-sm text-slate-500 mt-1">${sub}</p><button data-act="go" class="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-bold">${label}</button></div>`;el.querySelector('[data-act="go"]')?.addEventListener('click',onAction);return ()=>{el.innerHTML='';};}
```

`toast.ts`:
```typescript
export function toast(msg:string,type:'success'|'error'|'info'='info'){let c=document.getElementById('toast-root');if(!c){c=document.createElement('div');c.id='toast-root';c.className='fixed top-4 right-4 z-[100] flex flex-col gap-2';document.body.appendChild(c);}const d=document.createElement('div');d.className=`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-float text-white ${type==='success'?'bg-emerald-600':type==='error'?'bg-rose-600':'bg-slate-900'}`;d.textContent=msg;c.appendChild(d);setTimeout(()=>d.remove(),2800);}
```

`auth-view.ts`: demo login form, email `demo@bites.co.id`, password `demo12345`, inline validation, error text, on success `localStorage.setItem('bites_demo_session','demo@bites.co.id')` + toast + callback. Include forgot-password collapsible with static instruction (no fake submit — button shows toast "Tautan reset dikirim ke email demo").

`main.ts`: add `CustomerView='home'|'restaurant'|'tracking'|'orders'|'profile'|'auth'|'notfound'`; if no `bites_demo_session` and view is `orders|profile|tracking` → render auth; unknown → notfound; wrap `renderCurrentView` in try/catch → error view.

- [ ] **Step 4: Run verification**

Run: `npm run build --prefix frontend`
Expected: PASS. Manual: load `http://localhost:4200`, clear localStorage, open orders → auth form appears; wrong password → inline error; `demo@bites.co.id/demo12345` → success toast.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/system frontend/src/app/features/auth frontend/src/app/shared/components/toast.ts frontend/src/main.ts
git commit -m "feat: add system pages, demo auth, toast"
```

### Task 3: Design-system unification + icon + responsive pass

**Files:**
- Modify: `frontend/src/style.css`
- Modify: `frontend/src/app/shared/components/header.ts`, `footer.ts`, `icons.ts`
- Modify: `frontend/src/app/features/customer/home-view.ts`, `restaurant-view.ts`, `tracking-view.ts`
- Modify: `frontend/src/app/features/admin/admin-portal.ts`, `frontend/src/app/features/restaurant/restaurant-portal.ts`, `frontend/src/app/features/courier/courier-portal.ts`

**Interfaces:**
- Consumes: Tailwind tokens `brand/status/surface`, `font-sans`, `shadow-card/float`.
- Produces: consistent containers `max-w-7xl px-4 sm:px-6 lg:px-8`, cards `bg-white rounded-2xl shadow-card border border-slate-100`, buttons `bg-brand-500 hover:bg-brand-600`.

- [ ] **Step 1: Write failing check**

```bash
node -e "import('fs').then(fs=>{const f=fs.readFileSync('frontend/src/app/shared/components/icons.ts','utf8');const emoji=/[\u{1F300}-\u{1FAFF}]/u.test(f);console.log('emoji in icons.ts:',emoji);if(emoji)process.exit(0);else{console.error('expected clean but check icon style mix');process.exit(1);}})"
```
Plus: `grep -r "rounded-\[|gradient|from-.*to-" frontend/src --include="*.ts" | head -20` — expect excessive arbitrary gradients.

- [ ] **Step 2: Run to confirm**

Run above; Expected: inventory list of ad-hoc gradients/rounded values to normalize.

- [ ] **Step 3: Minimal implementation**

1. `style.css`: enforce single type scale:
```css
@layer base{body{@apply bg-slate-50 text-slate-800 antialiased font-sans;}h1{@apply text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900;}h2{@apply text-lg font-bold text-slate-900;}p{@apply leading-relaxed;}}
@layer components{.btn-primary{@apply px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 active:scale-[0.98] transition;} .card{@apply bg-white rounded-2xl shadow-card border border-slate-100;} .input{@apply w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500;} .badge{@apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold;}}
```
2. Replace emoji icons with `icon('...')` lucide calls; remove `from-*-to-*` gradients except brand-50→white hero; normalize `rounded-3xl/rounded-[...]` → `rounded-2xl` for cards, `rounded-xl` for buttons.
3. Ensure grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, tracking map `h-[320px] md:h-[420px]`, tables `overflow-x-auto` + `min-w-[640px]`.

- [ ] **Step 4: Run verification**

Run: `npm run build --prefix frontend`
Expected: PASS. Manual resize 375/768/1440: no horizontal scroll, header collapses, mobile nav visible only <md.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/style.css frontend/src/app/shared/components frontend/src/app/features
git commit -m "style: unify design system, icons, responsive"
```

### Task 4: Backend uniform ApiResponse + validation

**Files:**
- Modify: `backend/src/main/java/com/bites/common/ApiErrorMapper.java`
- Create: `backend/src/main/java/com/bites/common/ApiResponse.java`
- Modify: `backend/src/main/java/com/bites/order/OrderResource.java`
- Modify: `backend/src/main/java/com/bites/catalog/CatalogResource.java`
- Create: `backend/src/test/java/com/bites/order/OrderStatusTest.java`
- Create: `backend/src/test/java/com/bites/order/PromoCodeTest.java`

**Interfaces:**
- Consumes: `OrderStatus.canTransitionTo()`, `PromoCode.discountFor()`.
- Produces: `ApiResponse<T>{public boolean success; public String message; public T data; static <T> ApiResponse<T> ok(T data,String msg)}`.

- [ ] **Step 1: Write failing test**

```java
// backend/src/test/java/com/bites/order/OrderStatusTest.java
package com.bites.order;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
public class OrderStatusTest {
  @Test public void pendingCanGoToAcceptedOrCancelledOnly(){
    assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.ACCEPTED));
    assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED));
    assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.DELIVERED));
  }
  @Test public void deliveredIsTerminal(){
    for(OrderStatus s: OrderStatus.values()) assertFalse(OrderStatus.DELIVERED.canTransitionTo(s));
  }
}
```

- [ ] **Step 2: Run test to verify it fails (no test infra or bug)**

Run: `mvn -f backend test -Dtest=OrderStatusTest`
Expected: FAIL (file missing) or compile error before fix.

- [ ] **Step 3: Minimal implementation**

`ApiResponse.java`:
```java
package com.bites.common;
public class ApiResponse<T>{public boolean success;public String message;public T data;public static <T> ApiResponse<T> ok(T d,String m){ApiResponse<T> r=new ApiResponse<>();r.success=true;r.message=m;r.data=d;return r;}public static <T> ApiResponse<T> fail(String m){ApiResponse<T> r=new ApiResponse<>();r.success=false;r.message=m;r.data=null;return r;}}
```
`ApiErrorMapper.java`: map `IllegalArgumentException→400`, `NotFoundException→404`, `IllegalStateException→409`, else 500, all `ApiResponse.fail(e.getMessage())`.
`OrderResource.place`: wrap result `ApiResponse.ok(out,"Order placed")`, add manual null checks `if(req==null||req.restaurantId()==null) throw new IllegalArgumentException("restaurantId required")`.
`CatalogResource`: wrap lists `ApiResponse.ok(...)` — update frontend `get<T>` to unwrap `.data ?? raw` for backward compat.

`PromoCodeTest.java`: test `discountFor(100000,8000)` for BITESHEMAT flat, DISKON50 percent cap, FREESHIP free delivery.

- [ ] **Step 4: Run tests**

Run: `mvn -f backend test -Dtest=OrderStatusTest,PromoCodeTest`
Expected: PASS. Run: `mvn -f backend package -DskipTests`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/bites/common backend/src/main/java/com/bites/order backend/src/main/java/com/bites/catalog backend/src/test
git commit -m "feat: uniform ApiResponse and validation with tests"
```

### Task 5: Demo data alignment + env examples

**Files:**
- Modify: `backend/src/main/resources/db/migration/V2__seed.sql` (promo values to match frontend INITIAL_PROMOS)
- Create: `.env.example`
- Create: `backend/.env.example`
- Create: `frontend/.env.example`
- Modify: `frontend/src/app/core/data/mock-data.ts` (ensure image paths exist)

**Interfaces:**
- Consumes: Flyway V1+V2, Vite proxy.
- Produces: consistent promos `BITESHEMAT 20% max 25000 min 40000`, `FREESHIP`, `DISKON50 50000 flat`, `MAKANENAK 15000 flat`; env files with DB/JWT keys.

- [ ] **Step 1: Write failing check**

```bash
node -e "const fs=require('fs');const sql=fs.readFileSync('backend/src/main/resources/db/migration/V2__seed.sql','utf8');const mock=fs.readFileSync('frontend/src/app/core/data/mock-data.ts','utf8');console.log('seed has BITESHEMAT flat 15000:',sql.includes(\"'BITESHEMAT'\")&&sql.includes('15000'));console.log('mock has BITESHEMAT 20%:',mock.includes('BITESHEMAT')&&mock.includes('discountValue: 20'));"
```
Expected: mismatch printed (seed flat 15000 vs mock 20%).

- [ ] **Step 2: Run to confirm mismatch**

Run above. Expected: confirms divergence.

- [ ] **Step 3: Minimal implementation**

Update `V2__seed.sql` promos to:
```sql
-- align with frontend INITIAL_PROMOS
DELETE FROM promo_codes WHERE code IN ('BITESHEMAT','FREESHIP','DISKON50','MAKANENAK');
INSERT INTO promo_codes (code,title,description,discount_type,discount_value,min_spend,max_discount,valid_until,is_active) VALUES
('BITESHEMAT','Diskon 20% Seluruh Menu','Potongan 20% s/d Rp 25.000', 'percentage',20,40000,25000,'2027-12-31',true),
('FREESHIP','Gratis Ongkir Sepuasnya','Gratis ongkir s/d Rp 10.000','free_delivery',10000,30000,'2027-12-31',true),
('DISKON50','Pesta Diskon Rp 50.000','Potongan Rp 50.000 min Rp 120.000','flat',50000,120000,'2027-12-31',true),
('MAKANENAK','Potongan Rp 15.000','Voucher hemat Rp 15.000 min Rp 50.000','flat',15000,50000,'2027-12-31',true);
```
Create `.env.example`:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=admin
REDIS_HOST=localhost
MIDTRANS_SERVER_KEY=dummy
MIDTRANS_CLIENT_KEY=dummy
JWT_SECRET=dev-only-secret-change-me
VITE_API_BASE=/api/v1
```
Copy to `backend/.env.example` + `frontend/.env.example` (frontend only VITE_ line). Verify every `/assets/food/*` in mock-data exists in `frontend/public/assets/food/`; replace missing with existing fallback (e.g. `/assets/food/Ayam Krispy.webp`) — no new binaries.

- [ ] **Step 4: Run verification**

Run: `npm run build --prefix frontend`
Expected: PASS. Run mismatch script again — now both contain 20%/10000/50000/15000 consistently.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V2__seed.sql .env.example backend/.env.example frontend/.env.example frontend/src/app/core/data/mock-data.ts
git commit -m "chore: align seed promos and add env examples"
```

### Task 6: Portfolio README + deployment checklist

**Files:**
- Modify: `README.md`
- Create: `docs/DEPLOYMENT.md` (optional if README gets long — keep single README if <200 lines)

**Interfaces:**
- Consumes: PRD, mock-data, backend resources.
- Produces: README with intro, problem, features, stack, architecture, screenshots placeholder, demo accounts, install, deployment, API table.

- [ ] **Step 1: Write failing check**

```bash
node -e "import('fs').then(fs=>{const r=fs.readFileSync('README.md','utf8');console.log('has Demo account:',r.includes('demo@bites.co.id'));console.log('has Architecture:',r.includes('Architecture'));if(r.includes('demo@bites.co.id'))process.exit(1);else process.exit(0);})"
```
Expected: exit 0 (missing demo docs).

- [ ] **Step 2: Run to confirm**

Run above. Expected: `false`.

- [ ] **Step 3: Minimal implementation**

Rewrite `README.md` (keep concise, no AI slop, human tone):
```markdown
# Bites — Food Order Platform
Multi-restaurant ordering: browse → customize → pay → live courier map. Angular-style signals SPA (vanilla-TS) + Quarkus + Postgres.
## Demo
- Customer: demo@bites.co.id / demo12345 (works offline; backend optional)
- Restaurant/Courier/Admin: switch role in header (demo mode)
## Run
Frontend: cd frontend && npm i && npm run dev (http://localhost:4200)
Backend (optional): mvn -f backend quarkus:dev (needs Postgres bites db, Flyway auto-migrates)
## Features / Stack / Architecture / API / Screenshots / Deployment
... (fill from PRD §7/§8/§16, 1 screenshot placeholder `docs/screenshots/home.png`)
```

- [ ] **Step 4: Run verification**

Run: `node -e "console.log(require('fs').readFileSync('README.md','utf8').includes('demo@bites.co.id')?'README OK':'README MISSING')"`
Expected: `README OK`.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: portfolio-ready README with demo and deploy guide"
```

### Task 7: Final cleanup + verification-before-completion

**Files:**
- Modify: `.gitignore` (ensure `target/`, `node_modules/`, `dist/` ignored)
- Modify: `frontend/dist/` — do not commit; verify ignored
- Document root `src/org.acme` + root `pom.xml` as legacy in README (do not delete to avoid breaking unknown CI)

**Interfaces:**
- Consumes: all prior tasks.
- Produces: clean `git status`, green builds, QA checklist.

- [ ] **Step 1: Write failing check (dirty tree or build fail)**

Run: `git status --porcelain | head -20`
Expected: non-empty before final commit (or build fails).

- [ ] **Step 2: Run builds**

Run: `npm run build --prefix frontend`
Expected: PASS
Run: `mvn -f backend package -DskipTests`
Expected: PASS (or `test` if DB unavailable — must at least compile: `mvn -f backend compile`)

- [ ] **Step 3: Manual QA (checklist, no code)**

- Home loads with 4 restos, search + cuisine filter work, 404 on unknown view.
- Restaurant → customize required modifiers enforced, cart single-resto confirm dialog.
- Checkout promo `BITESHEMAT` case-insensitive, totals math correct, empty-cart blocked.
- Place order → tracking map + stepper + PIN; restaurant accept→ready; courier accept→deliver; rating persists.
- Admin promo toggle, refund, redispatch update timeline.
- 375/768/1440px no overflow; lucide icons only; toast on every action.

- [ ] **Step 4: Re-run builds after fixes**

Run both builds again. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final portfolio polish and verification"
```
