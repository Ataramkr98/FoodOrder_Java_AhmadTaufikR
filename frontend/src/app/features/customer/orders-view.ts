import { stateService, StateData } from '../../core/services/state.service';
import { icon } from '../../shared/components/icons';
import { toast } from '../../shared/components/toast';

export function renderOrdersView(container: HTMLElement, onSelectOrder: (orderId: string) => void, onBack: () => void) {
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const orders = currentState.orders;

    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-3xl mx-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button id="btn-back-home" class="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
              ${icon('arrow-left', 'w-4 h-4')}
            </button>
            <h1 class="font-display font-extrabold text-xl text-slate-900">
              Riwayat Pesanan Saya
            </h1>
          </div>
          <span class="text-xs font-semibold text-slate-500">${orders.length} Pesanan</span>
        </div>

        ${orders.length === 0 ? `
          <div class="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-card">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
              ${icon('file-text', 'w-8 h-8')}
            </div>
            <h3 class="font-bold text-slate-800 text-sm">Belum Ada Riwayat Pesanan</h3>
            <p class="text-xs text-slate-500">Pesanan makanan lezatmu akan tercatat di sini.</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${orders.map(order => {
              const isDelivered = order.status === 'DELIVERED';
              const isCancelled = order.status === 'CANCELLED';
              const isInFlight = !isDelivered && !isCancelled;

              return `
                <div class="card-order bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card hover:shadow-float hover:border-slate-300 transition-all cursor-pointer space-y-3.5" data-id="${order.id}">
                  
                  <!-- Top Row -->
                  <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div class="flex items-center space-x-3.5">
                      <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        ${icon('store', 'w-6 h-6 text-brand-600')}
                      </div>
                      <div>
                        <h3 class="font-bold text-sm text-slate-900">${order.restaurant.name}</h3>
                        <span class="text-[11px] text-slate-500 font-normal">
                          ${new Date(order.timestamps.placedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(order.timestamps.placedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                    </div>

                    <!-- Status Pill -->
                    <span class="text-[10px] font-bold px-3 py-1 rounded-full ${isInFlight ? 'bg-amber-50 border border-amber-200 text-amber-800' : isDelivered ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}">
                      ${order.status}
                    </span>
                  </div>

                  <!-- Items Summary -->
                  <div class="text-xs text-slate-600 space-y-1">
                    ${order.items.map(item => `
                      <div class="flex justify-between">
                        <span>${item.quantity}x ${item.menuItem.name}</span>
                        <span class="font-semibold text-slate-800">${stateService.formatCurrency(item.totalPrice)}</span>
                      </div>
                    `).join('')}
                  </div>

                  <!-- Bottom Row: Price & Actions -->
                  <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span class="text-slate-400 block text-[10px]">Total Pembayaran</span>
                      <span class="font-extrabold text-slate-900 text-sm">${stateService.formatCurrency(order.grandTotal)}</span>
                    </div>

                    <div class="flex items-center space-x-2">
                      ${isInFlight ? `
                        <button class="btn-track-live bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center space-x-1.5" data-id="${order.id}">
                          <span>Pantau di Peta</span>
                          ${icon('arrow-right', 'w-3.5 h-3.5')}
                        </button>
                      ` : `
                        <button class="btn-reorder bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5" data-id="${order.id}">
                          ${icon('refresh', 'w-3.5 h-3.5 text-slate-600')}
                          <span>Pesan Lagi</span>
                        </button>
                      `}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    `;

    container.querySelector('#btn-back-home')?.addEventListener('click', onBack);

    container.querySelectorAll('.card-order').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        onSelectOrder(id);
      });
    });

    container.querySelectorAll('.btn-track-live').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        onSelectOrder(id);
      });
    });

    container.querySelectorAll('.btn-reorder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const order = currentState.orders.find(o => o.id === id);
        if (order) {
          order.items.forEach(i => stateService.addToCart(i));
          toast('Menu berhasil dimasukkan kembali ke keranjang belanja!');
          onBack();
        }
      });
    });
  };

  render();
  return stateService.subscribe(update);
}
