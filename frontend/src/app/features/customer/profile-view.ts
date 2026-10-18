import { stateService, StateData } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { icon } from '../../shared/components/icons';

export function renderProfileView(container: HTMLElement, onBack: () => void) {
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-2xl mx-auto">
        
        <!-- Header -->
        <div class="flex items-center space-x-3">
          <button id="btn-back-home" class="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
            ${icon('arrow-left', 'w-4 h-4')}
          </button>
          <h1 class="font-display font-extrabold text-xl text-slate-900">
            Profil & Pengaturan Akun
          </h1>
        </div>

        <!-- Profile Card -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card flex items-center space-x-4">
          <div class="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
            A
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="font-display font-extrabold text-base text-slate-900">Andini Putri</h2>
              <span class="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Member Reguler</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5 font-normal">+62 812-9988-7766 • andini.putri@gmail.com</p>
          </div>
        </div>

        <!-- Saved Addresses Section -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
              ${icon('map-pin', 'w-3.5 h-3.5 text-brand-600')}
              <span>Daftar Alamat Tersimpan</span>
            </h3>
          </div>

          <div class="space-y-2.5">
            ${currentState.addresses.map(addr => {
              const isSelected = currentState.currentAddress.id === addr.id;
              return `
                <div class="p-3.5 rounded-2xl border transition-all flex items-start justify-between ${isSelected ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500' : 'border-slate-200 bg-slate-50/50'}">
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-xs text-slate-900">${addr.label}</span>
                      ${isSelected ? `<span class="bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">Aktif</span>` : ''}
                    </div>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">${addr.address}</p>
                    ${addr.notes ? `<span class="text-[11px] text-slate-400 block mt-0.5">Catatan: ${addr.notes}</span>` : ''}
                  </div>
                  ${!isSelected ? `
                    <button class="btn-select-addr text-xs font-bold text-brand-600 hover:text-brand-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm" data-id="${addr.id}">
                      Pilih
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- App Settings -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-4">
          <h3 class="font-bold text-xs text-slate-900">Preferensi Aplikasi</h3>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <span class="font-bold text-slate-800 block">Bahasa Tampilan</span>
                <span class="text-[11px] text-slate-400">Pilih bahasa aplikasi</span>
              </div>
              <button id="btn-toggle-lang" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors">
                ${i18n.lang === 'id' ? 'Bahasa Indonesia' : 'English'}
              </button>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <span class="font-bold text-slate-800 block">Notifikasi Status Pesanan</span>
                <span class="text-[11px] text-slate-400">Terima pembaruan status dan kurir via browser</span>
              </div>
              <span class="text-emerald-700 font-bold flex items-center space-x-1">
                ${icon('check', 'w-3.5 h-3.5 text-emerald-600')}
                <span>Aktif</span>
              </span>
            </div>

            <div class="flex items-center justify-between py-2">
              <div>
                <span class="font-bold text-slate-800 block">Versi Aplikasi</span>
                <span class="text-[11px] text-slate-400">Bites Web Platform</span>
              </div>
              <span class="text-slate-400 font-mono">v1.0.0</span>
            </div>
          </div>
        </div>

      </div>
    `;

    container.querySelector('#btn-back-home')?.addEventListener('click', onBack);

    container.querySelectorAll('.btn-select-addr').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const addr = currentState.addresses.find(a => a.id === id);
        if (addr) stateService.setAddress(addr);
      });
    });

    container.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
      i18n.toggleLanguage();
    });
  };

  render();
  return stateService.subscribe(update);
}
