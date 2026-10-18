export type ToastType = 'success' | 'error' | 'info';

export function toast(msg: string, type: ToastType = 'info'): void {
  let c = document.getElementById('toast-root');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-root';
    c.className = 'fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs';
    document.body.appendChild(c);
  }
  const d = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
  d.className = `px-4 py-2.5 rounded-xl text-sm font-semibold shadow-float text-white ${bg}`;
  d.setAttribute('role', type === 'error' ? 'alert' : 'status');
  d.textContent = msg;
  c.appendChild(d);
  setTimeout(() => d.remove(), 2800);
}
