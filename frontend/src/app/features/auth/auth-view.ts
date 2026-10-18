import { icon } from '../../shared/components/icons';
import { toast } from '../../shared/components/toast';

export const DEMO_EMAIL = 'demo@bites.co.id';
export const DEMO_PASSWORD = 'demo12345';

export function isDemoLoggedIn(): boolean {
  return localStorage.getItem('bites_demo_session') === DEMO_EMAIL;
}

export function demoLogout(): void {
  localStorage.removeItem('bites_demo_session');
}

export function renderAuthView(el: HTMLElement, onSuccess: () => void): () => void {
  el.innerHTML = `
    <div class="max-w-md mx-auto px-4 py-10">
      <div class="card p-6 sm:p-8">
        <div class="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl">B</div>
        <h1 class="mt-4 text-2xl font-extrabold text-slate-900">Masuk ke Bites</h1>
        <p class="mt-1 text-sm text-slate-500">Gunakan akun demo untuk menjelajah semua peran.</p>
        <div class="mt-4 rounded-xl bg-brand-50 border border-brand-100 px-3.5 py-3 text-[13px] text-brand-900">
          <span class="font-bold">Demo:</span> ${DEMO_EMAIL} / ${DEMO_PASSWORD}
          <button data-act="fill" class="ml-2 underline font-bold">Isi otomatis</button>
        </div>
        <form data-form="login" class="mt-5 space-y-3" novalidate>
          <div>
            <label class="text-xs font-bold text-slate-600" for="auth-email">Email</label>
            <input id="auth-email" name="email" type="email" autocomplete="email" class="input mt-1" placeholder="nama@email.com" />
            <p data-err="email" class="hidden mt-1 text-xs text-rose-600"></p>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600" for="auth-pass">Kata sandi</label>
            <input id="auth-pass" name="password" type="password" autocomplete="current-password" class="input mt-1" placeholder="••••••••" />
            <p data-err="password" class="hidden mt-1 text-xs text-rose-600"></p>
          </div>
          <button type="submit" class="btn-primary w-full">Masuk</button>
        </form>
        <button data-act="forgot" class="mt-3 text-[13px] font-semibold text-slate-500 hover:text-slate-800 w-full text-center">Lupa kata sandi?</button>
        <p data-forgot class="hidden mt-2 text-[13px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">Demo mode: tautan reset akan dikirim ke <span class="font-bold">${DEMO_EMAIL}</span>. Hubungi admin untuk reset manual.</p>
        <div class="mt-4 text-[12px] text-slate-400 flex items-center gap-1.5">${icon('shield', 'w-3.5 h-3.5')} Sesi demo tersimpan lokal, tanpa server auth sungguhan.</div>
      </div>
    </div>`;

  const emailInput = el.querySelector('#auth-email') as HTMLInputElement;
  const passInput = el.querySelector('#auth-pass') as HTMLInputElement;
  const showErr = (key: string, msg: string) => {
    const p = el.querySelector(`[data-err="${key}"]`);
    if (p) { p.textContent = msg; p.classList.remove('hidden'); }
  };
  const clearErrs = () => el.querySelectorAll('[data-err]').forEach(p => p.classList.add('hidden'));

  el.querySelector('[data-act="fill"]')?.addEventListener('click', () => {
    emailInput.value = DEMO_EMAIL;
    passInput.value = DEMO_PASSWORD;
    clearErrs();
  });
  el.querySelector('[data-act="forgot"]')?.addEventListener('click', () => {
    el.querySelector('[data-forgot]')?.classList.toggle('hidden');
    toast('Tautan reset dikirim ke email demo', 'info');
  });
  el.querySelector('[data-form="login"]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrs();
    const email = emailInput.value.trim().toLowerCase();
    const pass = passInput.value;
    let ok = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showErr('email', 'Masukkan email yang valid'); ok = false; }
    if (pass.length < 6) { showErr('password', 'Kata sandi minimal 6 karakter'); ok = false; }
    if (!ok) return;
    if (email === DEMO_EMAIL && pass === DEMO_PASSWORD) {
      localStorage.setItem('bites_demo_session', DEMO_EMAIL);
      toast('Selamat datang kembali, Andini!', 'success');
      onSuccess();
    } else {
      showErr('password', 'Email atau kata sandi salah. Gunakan akun demo di atas.');
    }
  });
  return () => { el.innerHTML = ''; };
}
