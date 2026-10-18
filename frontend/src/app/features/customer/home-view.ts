import { stateService, StateData } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { ServiceMode } from '../../core/models/types';
import { icon } from '../../shared/components/icons';

export function renderHomeView(container: HTMLElement, onSelectRestaurant: (restaurantId: string) => void) {
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    // Filter restaurants
    let filtered = currentState.restaurants;
    if (currentState.selectedCuisine && currentState.selectedCuisine !== 'all') {
      filtered = filtered.filter(r =>
        r.cuisine.some(c => c.toLowerCase().includes(currentState.selectedCuisine.toLowerCase()))
      );
    }
    if (currentState.searchQuery) {
      const q = currentState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.some(c => c.toLowerCase().includes(q)) ||
          r.tagline.toLowerCase().includes(q)
      );
    }

    const modes: { id: ServiceMode; label: string; sub: string; iconName: string }[] = [
      { id: 'delivery', label: i18n.t('mode_delivery'), sub: '15-25 min', iconName: 'bike' },
      { id: 'pickup', label: i18n.t('mode_pickup'), sub: 'Siap 10 min', iconName: 'shopping-bag' },
      { id: 'dine_in', label: i18n.t('mode_dine_in'), sub: 'Makan di tempat', iconName: 'utensils' },
      { id: 'drive_thru', label: i18n.t('mode_drive_thru'), sub: 'Ambil di mobil', iconName: 'navigation' },
    ];

    const cuisines = [
      { id: 'all', label: i18n.t('filter_all'), iconName: 'utensils' },
      { id: 'ayam', label: i18n.t('filter_ayam'), iconName: 'flame' },
      { id: 'burger', label: i18n.t('filter_burger'), iconName: 'burger' },
      { id: 'coffee', label: i18n.t('filter_coffee'), iconName: 'coffee' },
      { id: 'beverages', label: i18n.t('filter_drinks'), iconName: 'drink' },
    ];

    container.innerHTML = `
      <div class="space-y-7 pb-16">
        
        <!-- Hero Banner: Clean Modern Editorial Style -->
        <div class="relative bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-md overflow-hidden flex items-center justify-between">
          <div class="relative z-10 max-w-xl space-y-3">
            <div class="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-semibold text-brand-400">
              ${icon('bike', 'w-3.5 h-3.5')}
              <span>Pengantaran Instan Jakarta</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-display font-extrabold leading-tight text-white tracking-tight">
              Pesan Makanan Favorit, Pantau Langsung di Peta
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Pilihan resto terfavorit di sekitarmu dengan pelacakan live GPS kurir real-time.
            </p>
          </div>

          <!-- Decorative food composition -->
          <div class="hidden lg:block relative w-80 h-52 flex-shrink-0">
            <img
              src="/assets/food/PaMer 7 Ayam Krispy Kari Medan.webp"
              alt="Featured Crispy Chicken"
              class="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>

        <!-- Service Mode Switcher -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${modes.map(m => {
            const isSelected = currentState.serviceMode === m.id;
            return `
              <button class="btn-mode p-4 rounded-2xl border transition-all flex items-center space-x-3.5 text-left ${isSelected ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-sm' : 'border-slate-200/80 bg-white hover:border-slate-300'}" data-mode="${m.id}">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'} flex-shrink-0">
                  ${icon(m.iconName, 'w-5 h-5')}
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm ${isSelected ? 'text-brand-900' : 'text-slate-800'}">${m.label}</h4>
                  <span class="text-[11px] text-slate-400 font-medium">${m.sub}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Promo Vouchers Strip -->
        <div class="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          ${currentState.promos.filter(p => p.isActive).map(promo => `
            <div class="bg-white border border-slate-200/80 hover:border-brand-300 px-4 py-2.5 rounded-2xl flex-shrink-0 flex items-center space-x-3 text-xs shadow-sm transition-all cursor-pointer group" title="${promo.description}">
              <div class="p-2 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                ${icon('tag', 'w-4 h-4')}
              </div>
              <div>
                <span class="font-mono font-black text-slate-900 tracking-wider">${promo.code}</span>
                <span class="text-[11px] text-slate-500 block">${promo.title}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Cuisine Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          ${cuisines.map(c => {
            const isSelected = currentState.selectedCuisine === c.id;
            return `
              <button class="btn-cuisine px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${isSelected ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}" data-cuisine="${c.id}">
                ${icon(c.iconName, `w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`)}
                <span>${c.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Restaurant Listings Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                Pilihan Restoran Terdekat
              </h2>
              <span class="text-xs text-slate-500">Berdasarkan lokasi pengantaran ${currentState.currentAddress.label}</span>
            </div>
            <span class="text-xs font-bold text-slate-500">${filtered.length} Restoran</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${filtered.map(rest => `
              <div class="card-restaurant bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-card hover:shadow-float hover:border-slate-300 transition-all cursor-pointer group" data-id="${rest.id}">
                
                <!-- Hero Image & Badges -->
                <div class="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img src="${rest.banner}" alt="${rest.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  
                  <!-- Top Badges -->
                  <div class="absolute top-3 left-3 flex gap-1.5">
                    <span class="bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center space-x-1">
                      <span class="text-amber-500">${icon('star', 'w-3 h-3 text-amber-500 fill-amber-500')}</span>
                      <span>${rest.rating} (${rest.reviewCount})</span>
                    </span>
                    <span class="bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      PROMO
                    </span>
                  </div>

                  <!-- Distance / ETA Badge -->
                  <div class="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                    <span>${icon('clock', 'w-3.5 h-3.5 text-slate-300')}</span>
                    <span>${rest.etaMinutes} min</span>
                    <span class="text-slate-400">•</span>
                    <span>${rest.distanceKm} km</span>
                  </div>
                </div>

                <!-- Info Content -->
                <div class="p-4 space-y-3">
                  <div>
                    <h3 class="font-display font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                      ${rest.name}
                    </h3>
                    <p class="text-xs text-slate-500 line-clamp-1 font-normal mt-0.5">${rest.tagline}</p>
                  </div>

                  <!-- Cuisine tags & Delivery info -->
                  <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div class="flex items-center space-x-2 text-slate-600 font-medium">
                      <span>Ongkir:</span>
                      <span class="font-bold text-slate-900">${stateService.formatCurrency(rest.deliveryFee)}</span>
                    </div>
                    
                    <div class="flex items-center space-x-1 text-emerald-700 font-bold text-xs">
                      ${icon('check-circle', 'w-3.5 h-3.5 text-emerald-600')}
                      <span>Buka Sekarang</span>
                    </div>
                  </div>

                </div>

              </div>
            `).join('')}
          </div>

        </div>

      </div>
    `;

    // Handlers
    container.querySelectorAll('.btn-mode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).dataset.mode as ServiceMode;
        stateService.setServiceMode(mode);
      });
    });

    container.querySelectorAll('.btn-cuisine').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cuisine = (e.currentTarget as HTMLElement).dataset.cuisine!;
        stateService.setSelectedCuisine(cuisine);
      });
    });

    container.querySelectorAll('.card-restaurant').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        onSelectRestaurant(id);
      });
    });
  };

  render();
  return stateService.subscribe(update);
}
