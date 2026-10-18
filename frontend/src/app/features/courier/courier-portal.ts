import { stateService, StateData } from '../../core/services/state.service';
import { icon } from '../../shared/components/icons';
import { toast } from '../../shared/components/toast';

export function renderCourierPortal(container: HTMLElement) {
  let currentState = stateService.getState();
  let pinInputVal = '';

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const courier = currentState.courier;

    // Find if there is an active job assigned to courier or ready for dispatch
    const pendingOffer = currentState.orders.find(o => o.status === 'READY_FOR_PICKUP' && !o.courier);
    const activeJob = currentState.orders.find(
      o =>
        o.courier &&
        (o.status === 'COURIER_ASSIGNED' ||
          o.status === 'EN_ROUTE_TO_PICKUP' ||
          o.status === 'ARRIVED_AT_PICKUP' ||
          o.status === 'PICKED_UP' ||
          o.status === 'EN_ROUTE_TO_DROP' ||
          o.status === 'ARRIVED_AT_DROP')
    );

    const completedJobs = currentState.orders.filter(o => o.status === 'DELIVERED');
    const totalEarnings = completedJobs.length * 14000 + completedJobs.reduce((s, o) => s + (o.tip || 0), 0);

    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-2xl mx-auto px-4 sm:px-6">
        
        <!-- Driver Profile Header -->
        <div class="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3.5">
              <div class="w-13 h-13 p-3 bg-slate-800 rounded-2xl text-brand-400 flex items-center justify-center font-bold text-xl">
                ${icon('bike', 'w-7 h-7 text-brand-400')}
              </div>
              <div>
                <h1 class="font-display font-extrabold text-lg text-white">${courier.name}</h1>
                <p class="text-xs text-slate-300 font-normal">${courier.vehicle} • <span class="font-mono font-bold">${courier.plateNumber}</span></p>
                <div class="flex items-center space-x-2 mt-1 text-xs">
                  <span class="text-amber-400 font-bold flex items-center space-x-1">
                    ${icon('star', 'w-3 h-3 text-amber-400 fill-amber-400')}
                    <span>${courier.rating}</span>
                  </span>
                  <span class="text-slate-400">• ${courier.tripsCompleted} Pengantaran</span>
                </div>
              </div>
            </div>

            <!-- Online Switch -->
            <button id="btn-toggle-online" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${courier.isOnline ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}">
              <span class="w-2 h-2 rounded-full ${courier.isOnline ? 'bg-white' : 'bg-slate-500'}"></span>
              <span>${courier.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>
          </div>

          <!-- Daily Earnings Quick Stats -->
          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div class="bg-slate-800/80 rounded-2xl p-3.5">
              <span class="text-[11px] text-slate-400 block">Pendapatan Hari Ini</span>
              <span class="font-display font-extrabold text-lg text-white mt-0.5 block">
                ${stateService.formatCurrency(totalEarnings)}
              </span>
            </div>
            <div class="bg-slate-800/80 rounded-2xl p-3.5">
              <span class="text-[11px] text-slate-400 block">Trip Selesai</span>
              <span class="font-display font-extrabold text-lg text-white mt-0.5 block">
                ${completedJobs.length} Orderan
              </span>
            </div>
          </div>
        </div>

        ${!courier.isOnline ? `
          <div class="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-400 space-y-2 shadow-card">
            <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
              ${icon('bike', 'w-7 h-7 text-slate-400')}
            </div>
            <h3 class="font-bold text-slate-800 text-sm">Status Anda Sedang Offline</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Aktifkan tombol ONLINE di atas untuk mulai menerima tawaran pesanan terdekat.</p>
          </div>
        ` : `

          <!-- Incoming Offer Card (if any) -->
          ${pendingOffer ? `
            <div class="bg-white border-2 border-brand-500 rounded-3xl p-5 shadow-float space-y-4">
              <div class="flex items-center justify-between">
                <span class="bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Tawaran Pesanan Baru
                </span>
                <span class="font-display font-extrabold text-base text-slate-900">
                  +${stateService.formatCurrency(14000 + (pendingOffer.tip || 0))}
                </span>
              </div>

              <!-- Pickup & Drop locations -->
              <div class="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div class="flex items-start space-x-3">
                  <div class="p-1.5 bg-blue-50 text-blue-700 rounded-lg flex-shrink-0">
                    ${icon('store', 'w-4 h-4')}
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase">Ambil Pesanan (Resto)</span>
                    <h4 class="font-bold text-slate-900 text-xs">${pendingOffer.restaurant.name}</h4>
                    <p class="text-[11px] text-slate-500">${pendingOffer.restaurant.address}</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3 pt-2 border-t border-slate-200/60">
                  <div class="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg flex-shrink-0">
                    ${icon('home', 'w-4 h-4')}
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold block uppercase">Antar ke (Pelanggan)</span>
                    <h4 class="font-bold text-slate-900 text-xs">${pendingOffer.customer.name}</h4>
                    <p class="text-[11px] text-slate-500">${pendingOffer.customer.address}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-1">
                <button class="btn-decline-offer flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors">
                  Lewati
                </button>
                <button class="btn-accept-offer flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all" data-id="${pendingOffer.id}">
                  Terima Orderan Ini &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Active Job Execution Flow -->
          ${activeJob ? `
            <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400">Order Aktif</span>
                  <h3 class="font-bold text-sm text-slate-900">Pesanan #${activeJob.orderNumber}</h3>
                </div>
                <span class="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200">
                  ${activeJob.status}
                </span>
              </div>

              <!-- Interactive Step-by-Step Action Pipeline -->
              <div class="space-y-3">
                ${activeJob.status === 'COURIER_ASSIGNED' || activeJob.status === 'EN_ROUTE_TO_PICKUP' ? `
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <span class="text-xs font-bold text-slate-800 block">Langkah 1: Menuju Restoran</span>
                    <p class="text-xs text-slate-600">Ambil pesanan di: <strong>${activeJob.restaurant.name}</strong></p>
                    <button class="btn-arrived-pickup w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${activeJob.id}">
                      Saya Sudah Tiba di Restoran
                    </button>
                  </div>
                ` : ''}

                ${activeJob.status === 'ARRIVED_AT_PICKUP' ? `
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <span class="text-xs font-bold text-slate-800 block">Langkah 2: Periksa & Ambil Makanan</span>
                    <div class="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      ${activeJob.items.map(i => `<div>✓ ${i.quantity}x ${i.menuItem.name}</div>`).join('')}
                    </div>
                    <button class="btn-picked-up w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${activeJob.id}">
                      Makanan Sudah Diambil & Mulai Jalan
                    </button>
                  </div>
                ` : ''}

                ${activeJob.status === 'PICKED_UP' || activeJob.status === 'EN_ROUTE_TO_DROP' ? `
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <span class="text-xs font-bold text-slate-800 block">Langkah 3: Menuju Alamat Pelanggan</span>
                    <p class="text-xs text-slate-600">Antar ke: <strong>${activeJob.customer.name}</strong> (${activeJob.customer.address})</p>
                    <button class="btn-arrived-drop w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${activeJob.id}">
                      Saya Sudah Tiba di Alamat
                    </button>
                  </div>
                ` : ''}

                ${activeJob.status === 'ARRIVED_AT_DROP' ? `
                  <div class="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-5 space-y-3 text-center">
                    <span class="text-xs font-bold text-emerald-900 block">Langkah Terakhir: Masukkan PIN Pelanggan</span>
                    <p class="text-xs text-emerald-800">Tanyakan 4 angka PIN penerimaan kepada ${activeJob.customer.name}</p>
                    
                    <input
                      type="text"
                      id="input-courier-pin"
                      maxlength="4"
                      placeholder="Contoh: 4892"
                      value="${pinInputVal}"
                      class="w-48 mx-auto text-center font-mono font-black text-2xl tracking-[0.3em] p-2.5 bg-white border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />

                    <button class="btn-verify-deliver w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${activeJob.id}">
                      Verifikasi PIN & Selesaikan Pengantaran
                    </button>
                  </div>
                ` : ''}
              </div>

            </div>
          ` : ''}

          ${!pendingOffer && !activeJob ? `
            <div class="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-400 space-y-3 shadow-card">
              <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                ${icon('bike', 'w-7 h-7 text-slate-400')}
              </div>
              <h3 class="font-bold text-slate-800 text-sm">Menunggu Pesanan Terdekat</h3>
              <p class="text-xs text-slate-500 max-w-xs mx-auto">Sistem akan otomatis mengirimkan tawaran saat restoran selesai menyiapkan makanan.</p>
            </div>
          ` : ''}

        `}

      </div>
    `;

    // Handlers
    container.querySelector('#btn-toggle-online')?.addEventListener('click', () => {
      stateService.toggleCourierOnline();
    });

    container.querySelector('.btn-accept-offer')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      stateService.assignCourierToOrder(id);
      stateService.courierEnRoutePickup(id);
    });

    container.querySelector('.btn-arrived-pickup')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      stateService.courierArrivedPickup(id);
    });

    container.querySelector('.btn-picked-up')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      stateService.courierPickedUp(id);
    });

    container.querySelector('.btn-arrived-drop')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      stateService.courierArrivedDrop(id);
    });

    const pinInput = container.querySelector('#input-courier-pin') as HTMLInputElement;
    if (pinInput) {
      pinInput.addEventListener('input', () => {
        pinInputVal = pinInput.value;
      });
    }

    container.querySelector('.btn-verify-deliver')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const success = stateService.verifyPinAndDeliver(id, pinInputVal);
      if (!success) {
        toast('PIN tidak sesuai! Silakan periksa kembali 4-digit PIN pada aplikasi pelanggan.', 'error');
      } else {
        toast('Pengantaran berhasil diselesaikan! Pendapatan telah ditambahkan ke dompet.', 'success');
        pinInputVal = '';
      }
    });
  };

  render();
  return stateService.subscribe(update);
}
