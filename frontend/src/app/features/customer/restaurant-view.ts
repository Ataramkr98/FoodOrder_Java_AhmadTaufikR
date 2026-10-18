import { stateService, StateData } from '../../core/services/state.service';
import { MenuItem } from '../../core/models/types';
import { openCustomizerModal } from '../../shared/components/customizer-modal';
import { icon } from '../../shared/components/icons';

export function renderRestaurantView(container: HTMLElement, restaurantId: string, onBack: () => void) {
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const restaurant = currentState.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Restoran tidak ditemukan. <button id="btn-back" class="text-brand-600 font-bold underline">Kembali</button></div>`;
      container.querySelector('#btn-back')?.addEventListener('click', onBack);
      return;
    }

    const items = currentState.menuItems.filter(i => i.restaurantId === restaurantId);

    // Group items by category
    const categories = restaurant.categories;
    const groupedItems: { [cat: string]: MenuItem[] } = {};
    categories.forEach(cat => {
      groupedItems[cat] = items.filter(i => i.category === cat);
    });

    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-6xl mx-auto">
        
        <!-- Back Navigation & Quick Actions -->
        <div class="flex items-center justify-between">
          <button id="btn-back-home" class="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-colors">
            ${icon('arrow-left', 'w-3.5 h-3.5 text-slate-600')}
            <span>Kembali ke Beranda</span>
          </button>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${restaurant.isOpen ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}">
              <span class="w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
              <span>${restaurant.isOpen ? 'Buka Sekarang' : 'Sedang Tutup'}</span>
            </span>
          </div>
        </div>

        <!-- Restaurant Banner & Info Card -->
        <div class="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-card">
          <div class="relative h-56 sm:h-72 bg-slate-100">
            <img src="${restaurant.banner}" alt="${restaurant.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
            
            <div class="absolute bottom-5 left-5 right-5 text-white">
              <div class="flex items-center space-x-2 mb-2">
                <span class="bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Partner Resmi
                </span>
                <span class="text-xs text-slate-200 font-semibold flex items-center space-x-1">
                  ${icon('star', 'w-3.5 h-3.5 text-amber-400 fill-amber-400')}
                  <span>${restaurant.rating} (${restaurant.reviewCount} ulasan)</span>
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                ${restaurant.name}
              </h1>
              <p class="text-xs text-slate-200 line-clamp-1 mt-1 font-normal">${restaurant.tagline}</p>
            </div>
          </div>

          <!-- Metadata row -->
          <div class="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 bg-slate-50/50">
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Estimasi Pengantaran</span>
              <span class="font-bold text-slate-800 text-xs flex items-center space-x-1 mt-0.5">
                ${icon('clock', 'w-3.5 h-3.5 text-slate-500')}
                <span>${restaurant.etaMinutes} Menit</span>
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Biaya Ongkir</span>
              <span class="font-bold text-slate-800 text-xs mt-0.5 block">${stateService.formatCurrency(restaurant.deliveryFee)}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Jam Operasional</span>
              <span class="font-bold text-slate-800 text-xs mt-0.5 block">${restaurant.openingHours}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Alamat Restoran</span>
              <span class="font-semibold text-slate-700 truncate block mt-0.5" title="${restaurant.address}">${restaurant.address}</span>
            </div>
          </div>
        </div>

        <!-- Sticky Category Nav -->
        <div class="sticky top-16 z-20 bg-slate-50/95 backdrop-blur-md py-2.5 border-b border-slate-200/80 flex gap-2 overflow-x-auto no-scrollbar">
          ${categories.map(cat => `
            <a href="#cat-${encodeURIComponent(cat)}" class="px-4 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-brand-500 hover:text-brand-600 text-slate-700 text-xs font-bold whitespace-nowrap transition-colors shadow-sm">
              ${cat}
            </a>
          `).join('')}
        </div>

        <!-- Menu Categories & Items Grid -->
        <div class="space-y-9">
          ${categories.map(cat => {
            const catItems = groupedItems[cat] || [];
            if (catItems.length === 0) return '';

            return `
              <div id="cat-${encodeURIComponent(cat)}" class="space-y-4 scroll-mt-28">
                <div class="flex items-center space-x-2">
                  <h2 class="font-display font-extrabold text-lg text-slate-900 tracking-tight">${cat}</h2>
                  <span class="text-xs text-slate-400 font-semibold">(${catItems.length})</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${catItems.map(item => `
                    <div class="card-menu-item bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:shadow-float hover:border-slate-300 transition-all flex justify-between gap-4 group ${!item.isAvailable ? 'opacity-60' : ''}" data-id="${item.id}">
                      
                      <!-- Info -->
                      <div class="flex-1 flex flex-col justify-between">
                        <div class="space-y-1">
                          <div class="flex items-center space-x-1.5">
                            ${item.isBestSeller ? `<span class="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">Favorit</span>` : ''}
                            ${item.isSpicy ? `<span class="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">${icon('flame', 'w-3 h-3 text-red-500')}<span>Pedas</span></span>` : ''}
                          </div>
                          
                          <h3 class="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                            ${item.name}
                          </h3>
                          
                          <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            ${item.description}
                          </p>
                        </div>

                        <div class="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
                          <div class="flex items-center space-x-2">
                            <span class="font-extrabold text-sm text-slate-900">
                              ${stateService.formatCurrency(item.price)}
                            </span>
                            ${item.originalPrice ? `
                              <span class="text-[11px] text-slate-400 line-through">
                                ${stateService.formatCurrency(item.originalPrice)}
                              </span>
                            ` : ''}
                          </div>

                          <button class="btn-add-item bg-brand-50 hover:bg-brand-500 hover:text-white text-brand-700 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5" data-id="${item.id}" ${!item.isAvailable ? 'disabled' : ''}>
                            ${icon('plus', 'w-3.5 h-3.5')}
                            <span>${item.isAvailable ? 'Tambah' : 'Habis'}</span>
                          </button>
                        </div>
                      </div>

                      <!-- Thumbnail -->
                      <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-100">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ${!item.isAvailable ? `
                          <div class="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white font-bold text-[10px]">
                            Stok Habis
                          </div>
                        ` : ''}
                      </div>

                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Handlers
    container.querySelector('#btn-back-home')?.addEventListener('click', onBack);

    container.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const item = currentState.menuItems.find(i => i.id === id);
        if (item && item.isAvailable) {
          openCustomizerModal(item);
        }
      });
    });

    container.querySelectorAll('.card-menu-item').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const item = currentState.menuItems.find(i => i.id === id);
        if (item && item.isAvailable) {
          openCustomizerModal(item);
        }
      });
    });
  };

  render();
  return stateService.subscribe(update);
}
