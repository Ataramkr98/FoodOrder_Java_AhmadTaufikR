import { stateService, StateData } from '../../core/services/state.service';
import { LiveTrackingMap } from '../../shared/components/leaflet-map';
import { renderStatusStepper } from '../../shared/components/status-stepper';
import { openDriverChatModal } from '../../shared/components/chat-modal';
import { openRatingModal } from '../../shared/components/rating-modal';
import { icon } from '../../shared/components/icons';
import { toast } from '../../shared/components/toast';

export function renderTrackingView(container: HTMLElement, orderId: string, onBack: () => void) {
  let trackingMap: LiveTrackingMap | null = null;
  let hasShownRatingModal = false;

  const update = (state: StateData) => {
    render(state);
  };

  const render = (state: StateData) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500">
          Pesanan #${orderId} tidak ditemukan.
          <button id="btn-back-orders" class="text-brand-600 font-bold underline ml-2">Kembali</button>
        </div>
      `;
      container.querySelector('#btn-back-orders')?.addEventListener('click', onBack);
      return;
    }

    // If order delivered and rating modal not yet shown, trigger rating modal
    if (order.status === 'DELIVERED' && !hasShownRatingModal && !order.rating) {
      hasShownRatingModal = true;
      setTimeout(() => openRatingModal(order), 400);
    }

    const latestTimeline = order.timeline[order.timeline.length - 1];

    container.innerHTML = `
      <div class="space-y-5 pb-20 max-w-4xl mx-auto">
        
        <!-- Header Info Bar -->
        <div class="flex items-center justify-between bg-white border border-slate-200/80 p-4 sm:p-5 rounded-3xl shadow-card">
          <div class="flex items-center space-x-3.5">
            <button id="btn-back-nav" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors">
              ${icon('arrow-left', 'w-4 h-4')}
            </button>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  Pesanan #${order.orderNumber}
                </h1>
                <span class="bg-brand-50 text-brand-700 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-brand-200/60">
                  ${order.status}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium">${order.restaurant.name}</p>
            </div>
          </div>

          <!-- Live ETA Pill -->
          ${order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? `
            <div class="bg-slate-900 text-white px-4 py-2 rounded-2xl text-right shadow-sm">
              <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Estimasi Tiba</span>
              <span class="font-extrabold text-sm sm:text-base font-display text-brand-400">
                ~${order.etaMinutesRemaining || 12} Menit
              </span>
            </div>
          ` : `
            <span class="text-xs font-bold px-3 py-1.5 rounded-xl ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}">
              ${order.status === 'DELIVERED' ? 'Pesanan Selesai' : 'Dibatalkan'}
            </span>
          `}
        </div>

        <!-- Interactive Real-Time Leaflet Map Container -->
        <div class="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-card relative">
          <div id="live-map-el" class="w-full h-80 sm:h-96 z-10"></div>
          
          <!-- Map Overlay Status Badge -->
          <div class="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-bold text-slate-800">Pelacakan Langsung</span>
          </div>

          <!-- Share Tracking Link Trigger -->
          <button id="btn-share-tracking" class="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center space-x-1.5 transition-colors">
            ${icon('share', 'w-3.5 h-3.5')}
            <span class="hidden sm:inline">Bagikan Link</span>
          </button>
        </div>

        <!-- Status Stepper Component -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-3">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center space-x-2.5">
              <div class="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                ${icon('map-pin', 'w-4 h-4')}
              </div>
              <div>
                <h3 class="font-bold text-xs text-slate-900">${latestTimeline?.label || 'Memproses Pesanan'}</h3>
                <p class="text-[11px] text-slate-500 font-normal">${latestTimeline?.description || 'Status pengantaran diperbarui real-time'}</p>
              </div>
            </div>
            <span class="text-[11px] font-mono text-slate-400">
              ${new Date(latestTimeline?.timestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>

          ${renderStatusStepper(order.status)}
        </div>

        <!-- 4-Digit Proof of Delivery PIN & Driver Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- PIN Card -->
          <div class="bg-slate-900 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Bukti Pengantaran (PIN)</span>
                <span class="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold">Wajib</span>
              </div>
              <h4 class="font-display font-bold text-base text-white mt-1">
                PIN Serah Terima
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed mt-0.5 font-normal">
                Berikan 4 angka PIN ini kepada kurir ${order.courier?.name || ''} saat pesanan tiba di lokasimu.
              </p>
            </div>

            <div class="bg-slate-800 text-white border border-slate-700/80 rounded-2xl p-3 text-center shadow-inner">
              <span class="font-mono font-black text-3xl tracking-[0.4em] text-brand-400 pl-2">
                ${order.pin}
              </span>
            </div>
          </div>

          <!-- Driver Profile Card -->
          ${order.courier ? `
            <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card flex flex-col justify-between space-y-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Driver Pengantar
                </span>
                <div class="flex items-center space-x-3.5">
                  <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    ${icon('bike', 'w-6 h-6 text-brand-600')}
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900">${order.courier.name}</h4>
                    <span class="text-xs text-slate-500 block font-normal">${order.courier.vehicle}</span>
                    <span class="text-[11px] font-bold text-slate-700 font-mono">${order.courier.plateNumber}</span>
                  </div>
                </div>
              </div>

              <!-- Driver Action Buttons (Call / Chat) -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button id="btn-call-driver" class="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors">
                  ${icon('phone', 'w-3.5 h-3.5 text-slate-600')}
                  <span>Telepon (Masked)</span>
                </button>
                <button id="btn-chat-driver" class="py-2.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors">
                  ${icon('message-square', 'w-3.5 h-3.5 text-white')}
                  <span>Chat Driver</span>
                </button>
              </div>
            </div>
          ` : `
            <div class="bg-slate-50 border border-slate-200/70 rounded-3xl p-5 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <div class="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                ${icon('clock', 'w-6 h-6')}
              </div>
              <h4 class="font-bold text-xs text-slate-800">Menugaskan Driver Terdekat...</h4>
              <p class="text-[11px] text-slate-500">Driver otomatis ditugaskan saat makanan siap diambil.</p>
            </div>
          `}

        </div>

        <!-- Order Items Summary Drawer -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-3">
          <h3 class="font-bold text-xs text-slate-900 flex items-center justify-between">
            <span>Rincian Pesanan (${order.items.length} Item)</span>
            <span class="font-extrabold text-slate-900 text-sm">${stateService.formatCurrency(order.grandTotal)}</span>
          </h3>

          <div class="divide-y divide-slate-100">
            ${order.items.map(item => `
              <div class="py-2.5 flex items-center justify-between text-xs">
                <div class="flex items-center space-x-3">
                  <span class="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                    ${item.quantity}x
                  </span>
                  <div>
                    <h4 class="font-bold text-slate-900">${item.menuItem.name}</h4>
                    ${item.selectedModifiers.length > 0 ? `
                      <span class="text-[10px] text-slate-400">${item.selectedModifiers.map(m => m.optionName).join(', ')}</span>
                    ` : ''}
                  </div>
                </div>
                <span class="font-bold text-slate-800">${stateService.formatCurrency(item.totalPrice)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Cancel Order Action (if allowed) -->
        ${order.status === 'PENDING' || order.status === 'ACCEPTED' ? `
          <div class="text-center pt-1">
            <button id="btn-cancel-order" class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline">
              Batalkan Pesanan (Pengembalian Dana 100%)
            </button>
          </div>
        ` : ''}

      </div>
    `;

    // Initialize Leaflet map fresh each render (container was rebuilt via innerHTML).
    // LiveTrackingMap.init() removes the previous map instance internally.
    const mapEl = container.querySelector('#live-map-el') as HTMLElement;
    if (mapEl) {
      if (!trackingMap) trackingMap = new LiveTrackingMap();
      trackingMap.init(mapEl, order);
    }

    // Attach Event Handlers
    container.querySelector('#btn-back-nav')?.addEventListener('click', onBack);

    container.querySelector('#btn-call-driver')?.addEventListener('click', () => {
      toast(`Menghubungkan panggilan ke ${order.courier?.name} (${order.courier?.maskedPhone}).`, 'info');
    });

    container.querySelector('#btn-chat-driver')?.addEventListener('click', () => {
      if (order.courier) {
        openDriverChatModal(order.courier);
      }
    });

    container.querySelector('#btn-share-tracking')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      toast(`Link tracking pesanan #${order.orderNumber} disalin!`, 'success');
    });

    container.querySelector('#btn-cancel-order')?.addEventListener('click', () => {
      stateService.cancelOrderAdmin(order.id, 'Dibatalkan oleh pelanggan');
      toast('Pesanan dibatalkan, dana dikembalikan.', 'info');
    });
  };

  render(stateService.getState());
  const unsubscribe = stateService.subscribe(update);
  return () => { unsubscribe(); trackingMap?.destroy(); trackingMap = null; };
}
