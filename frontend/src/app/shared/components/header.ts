import { stateService, StateData } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { icon } from './icons';
import { toast } from './toast';

export function renderHeader(
  container: HTMLElement,
  onOpenCart: () => void,
  onOpenHistory: () => void,
  onOpenProfile: () => void,
  onGoHome: () => void
) {
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const activeOrder = currentState.orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    const totalCartItems = currentState.cart.reduce((sum, i) => sum + i.quantity, 0);

    container.innerHTML = `
      <!-- Role Switcher & Dev Toolbar -->
      <div class="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-1.5 font-bold tracking-tight text-white">
            <span class="w-2 h-2 rounded-full bg-brand-500"></span>
            <span>Bites Portal Hub</span>
          </div>
          <span class="text-slate-500 hidden sm:inline">|</span>
          <span class="text-slate-400 hidden sm:inline text-[11px]">Ganti Tampilan Role:</span>
        </div>

        <!-- Role Pills -->
        <div class="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/60">
          <button id="role-customer" class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${currentState.currentRole === 'customer' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}">
            ${icon('user', 'w-3.5 h-3.5')}
            <span>Pelanggan</span>
          </button>
          <button id="role-restaurant" class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 relative ${currentState.currentRole === 'restaurant' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}">
            ${icon('store', 'w-3.5 h-3.5')}
            <span>Resto KDS</span>
            ${currentState.orders.filter(o => o.status === 'PENDING').length > 0 ? `<span class="w-2 h-2 rounded-full bg-red-400"></span>` : ''}
          </button>
          <button id="role-courier" class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${currentState.currentRole === 'courier' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}">
            ${icon('bike', 'w-3.5 h-3.5')}
            <span>Driver</span>
          </button>
          <button id="role-admin" class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${currentState.currentRole === 'admin' ? 'bg-brand-500 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}">
            ${icon('settings', 'w-3.5 h-3.5')}
            <span>Admin Ops</span>
          </button>
        </div>

        <!-- Simulation Toggles & Quick Links -->
        <div class="flex items-center space-x-2.5">
          <button id="toggle-sim" class="text-xs px-2.5 py-1 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center space-x-1.5 transition-colors">
            <span class="w-2 h-2 rounded-full ${currentState.autoSimulate ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
            <span class="hidden md:inline text-[11px]">Auto Simulasi:</span>
            <span class="font-bold text-[11px]">${currentState.autoSimulate ? 'ON' : 'OFF'}</span>
          </button>
          
          <button id="btn-lang" class="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-colors">
            ${i18n.lang === 'id' ? 'ID' : 'EN'}
          </button>

          <button id="btn-reset" class="text-xs px-2 py-1 text-slate-400 hover:text-rose-400 transition-colors" title="Reset semua data simulasi">
            ${icon('refresh', 'w-3.5 h-3.5')}
          </button>
        </div>
      </div>

      <!-- Active Order Notice Bar (Customer view) -->
      ${activeOrder && currentState.currentRole === 'customer' ? `
        <div class="bg-brand-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm">
          <div class="flex items-center space-x-2.5 truncate">
            <div class="p-1 bg-brand-700 rounded-full flex-shrink-0">
              ${icon('bike', 'w-3.5 h-3.5')}
            </div>
            <span class="font-semibold text-white">Pesanan aktif #${activeOrder.orderNumber}:</span>
            <span class="bg-brand-700 px-2 py-0.5 rounded font-medium truncate">${activeOrder.restaurant.name.split('—')[0]}</span>
            <span class="hidden md:inline text-brand-100 font-normal">• ${activeOrder.timeline[activeOrder.timeline.length - 1]?.label}</span>
          </div>
          <button id="btn-view-tracking" class="bg-white text-brand-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-brand-50 shadow-sm transition-all flex items-center space-x-1 flex-shrink-0 ml-2">
            <span>Pantau Live</span>
            ${icon('chevron-right', 'w-3 h-3')}
          </button>
        </div>
      ` : ''}

      <!-- Main Navigation Header (Customer view) -->
      ${currentState.currentRole === 'customer' ? `
        <header class="bg-white border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-3">
              
              <!-- Brand Logo -->
              <div class="flex items-center space-x-3 cursor-pointer select-none" id="btn-logo-home">
                <div class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                  ${icon('utensils', 'w-5 h-5 text-white')}
                </div>
                <div>
                  <span class="font-display font-extrabold text-2xl tracking-tight text-slate-900">
                    bites<span class="text-brand-500">.</span>
                  </span>
                </div>
              </div>

              <!-- Location Picker -->
              <div class="hidden md:flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs cursor-pointer transition-colors max-w-sm truncate" id="btn-address-picker" title="${currentState.currentAddress.address}">
                <span class="text-brand-500 flex-shrink-0">${icon('map-pin', 'w-4 h-4')}</span>
                <div class="truncate">
                  <span class="font-bold text-slate-800">${currentState.currentAddress.label}</span>
                  <span class="text-slate-500 ml-1 truncate">— ${currentState.currentAddress.address}</span>
                </div>
                <span class="text-slate-400 flex-shrink-0">${icon('chevron-down', 'w-3.5 h-3.5')}</span>
              </div>

              <!-- Search Bar -->
              <div class="flex-1 max-w-md hidden sm:block">
                <div class="relative">
                  <input
                    type="text"
                    id="input-global-search"
                    placeholder="${i18n.t('search_placeholder')}"
                    value="${currentState.searchQuery}"
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                  />
                  <span class="absolute left-3 top-2.5 text-slate-400">
                    ${icon('search', 'w-4 h-4')}
                  </span>
                </div>
              </div>

              <!-- Right Actions -->
              <div class="flex items-center space-x-1.5 sm:space-x-2">
                <!-- Orders History Button -->
                <button id="btn-nav-orders" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-semibold" title="Riwayat Pesanan">
                  ${icon('file-text', 'w-4 h-4 text-slate-500')}
                  <span class="hidden lg:inline">${i18n.t('nav_orders')}</span>
                </button>

                <!-- Profile Button -->
                <button id="btn-nav-profile" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-semibold" title="Profil Pengguna">
                  ${icon('user', 'w-4 h-4 text-slate-500')}
                  <span class="hidden lg:inline">${i18n.t('nav_profile')}</span>
                </button>

                <!-- Cart Trigger Button -->
                <button id="btn-nav-cart" class="relative bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center space-x-2 ml-1">
                  ${icon('shopping-bag', 'w-4 h-4 text-white')}
                  <span class="hidden sm:inline">${i18n.t('nav_cart')}</span>
                  ${totalCartItems > 0 ? `
                    <span class="bg-white text-brand-600 font-extrabold px-1.5 py-0.2 rounded-full text-[11px] shadow-sm">
                      ${totalCartItems}
                    </span>
                  ` : ''}
                </button>
              </div>

            </div>
          </div>
        </header>
      ` : ''}
    `;

    // Event listeners
    container.querySelector('#role-customer')?.addEventListener('click', () => stateService.setRole('customer'));
    container.querySelector('#role-restaurant')?.addEventListener('click', () => stateService.setRole('restaurant'));
    container.querySelector('#role-courier')?.addEventListener('click', () => stateService.setRole('courier'));
    container.querySelector('#role-admin')?.addEventListener('click', () => stateService.setRole('admin'));

    container.querySelector('#toggle-sim')?.addEventListener('click', () => stateService.toggleAutoSimulate());
    container.querySelector('#btn-lang')?.addEventListener('click', () => i18n.toggleLanguage());
    container.querySelector('#btn-reset')?.addEventListener('click', () => {
      stateService.resetAllData();
      toast('Demo direset ke data awal', 'info');
    });

    container.querySelector('#btn-logo-home')?.addEventListener('click', () => {
      stateService.setSelectedRestaurant(null);
      onGoHome();
    });

    container.querySelector('#btn-nav-cart')?.addEventListener('click', onOpenCart);
    container.querySelector('#btn-nav-orders')?.addEventListener('click', onOpenHistory);
    container.querySelector('#btn-nav-profile')?.addEventListener('click', onOpenProfile);
    container.querySelector('#btn-address-picker')?.addEventListener('click', onOpenProfile);

    const searchInput = container.querySelector('#input-global-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        stateService.setSearchQuery((e.target as HTMLInputElement).value);
      });
    }

    container.querySelector('#btn-view-tracking')?.addEventListener('click', () => {
      onOpenHistory();
    });
  };

  render();
  return stateService.subscribe(update);
}
