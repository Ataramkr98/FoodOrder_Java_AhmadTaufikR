import { icon } from '../../shared/components/icons';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function renderNotFound(el: HTMLElement, onHome: () => void): () => void {
  el.innerHTML = `
    <div class="max-w-md mx-auto text-center py-16 px-4">
      <div class="mx-auto w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">${icon('search', 'w-7 h-7 text-brand-600')}</div>
      <h1 class="mt-4 text-2xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1>
      <p class="mt-2 text-sm text-slate-500">Tautan yang kamu buka tidak tersedia atau sudah dipindahkan.</p>
      <button data-act="home" class="btn-primary mt-6">Kembali ke Beranda</button>
    </div>`;
  el.querySelector('[data-act="home"]')?.addEventListener('click', onHome);
  return () => { el.innerHTML = ''; };
}

export function renderLoadingView(el: HTMLElement): () => void {
  el.innerHTML = `
    <div class="py-16 flex flex-col items-center gap-3">
      <div class="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" role="status" aria-label="Memuat"></div>
      <p class="text-sm text-slate-500">Memuat...</p>
    </div>`;
  return () => { el.innerHTML = ''; };
}

export function renderErrorView(el: HTMLElement, msg: string, onRetry: () => void): () => void {
  const safe = escapeHtml(msg);
  el.innerHTML = `
    <div class="max-w-md mx-auto text-center py-16 px-4">
      <div class="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">${icon('alert', 'w-7 h-7 text-rose-600')}</div>
      <h1 class="mt-4 text-xl font-extrabold text-slate-900">Terjadi kesalahan</h1>
      <p class="mt-2 text-sm text-slate-500">${safe}</p>
      <button data-act="retry" class="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800">Coba lagi</button>
    </div>`;
  el.querySelector('[data-act="retry"]')?.addEventListener('click', onRetry);
  return () => { el.innerHTML = ''; };
}

export function renderEmptyState(el: HTMLElement, title: string, sub: string, label: string, onAction: () => void): () => void {
  el.innerHTML = `
    <div class="card text-center py-12 px-6">
      <p class="font-bold text-slate-900">${title}</p>
      <p class="text-sm text-slate-500 mt-1">${sub}</p>
      <button data-act="go" class="btn-primary mt-4">${label}</button>
    </div>`;
  el.querySelector('[data-act="go"]')?.addEventListener('click', onAction);
  return () => { el.innerHTML = ''; };
}
