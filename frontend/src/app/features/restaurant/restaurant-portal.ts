import { stateService, StateData } from '../../core/services/state.service';
import { icon } from '../../shared/components/icons';

export function renderRestaurantPortal(container: HTMLElement) {
  let activeTab: 'kds' | 'menu' | 'analytics' = 'kds';
  let selectedRestId = 'res-pak-budi';
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const restaurant = currentState.restaurants.find(r => r.id === selectedRestId) || currentState.restaurants[0];
    const restOrders = currentState.orders.filter(o => o.restaurant.id === restaurant.id);
    const restMenuItems = currentState.menuItems.filter(i => i.restaurantId === restaurant.id);

    // KDS Categories
    const incomingOrders = restOrders.filter(o => o.status === 'PENDING');
    const preparingOrders = restOrders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING');
    const readyOrders = restOrders.filter(
      o => o.status === 'READY_FOR_PICKUP' || o.status === 'COURIER_ASSIGNED' || o.status === 'EN_ROUTE_TO_PICKUP' || o.status === 'ARRIVED_AT_PICKUP'
    );
    const completedOrders = restOrders.filter(
      o => o.status === 'PICKED_UP' || o.status === 'EN_ROUTE_TO_DROP' || o.status === 'ARRIVED_AT_DROP' || o.status === 'DELIVERED'
    );

    // Analytics calculations
    const todayGmv = restOrders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.subtotal, 0);

    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        
        <!-- Resto Console Top Bar -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-card flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="w-13 h-13 p-3.5 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl shadow-sm">
              ${icon('store', 'w-7 h-7 text-brand-600')}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                  ${restaurant.name}
                </h1>
                <span class="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                  Kitchen Console (KDS)
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${restaurant.address}</p>
            </div>
          </div>

          <!-- Outlet Selector & Store Status Switch -->
          <div class="flex items-center space-x-3">
            <select id="select-outlet" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
              ${currentState.restaurants.map(r => `
                <option value="${r.id}" ${r.id === selectedRestId ? 'selected' : ''}>${r.name.split('—')[0]}</option>
              `).join('')}
            </select>

            <button id="btn-toggle-store" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${restaurant.isOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'}">
              <span class="w-2 h-2 rounded-full bg-white"></span>
              <span>${restaurant.isOpen ? 'Buka (Menerima Order)' : 'Tutup Sementara'}</span>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-200 gap-6">
          <button class="btn-tab pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'kds' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="kds">
            ${icon('file-text', 'w-4 h-4')}
            <span>Kitchen Display System (KDS)</span>
            ${incomingOrders.length > 0 ? `
              <span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                ${incomingOrders.length} Baru
              </span>
            ` : ''}
          </button>
          
          <button class="btn-tab pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'menu' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="menu">
            ${icon('utensils', 'w-4 h-4')}
            <span>Kelola Menu & Stok (${restMenuItems.length})</span>
          </button>

          <button class="btn-tab pb-3 text-sm font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'analytics' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="analytics">
            ${icon('bar-chart', 'w-4 h-4')}
            <span>Ringkasan Penjualan</span>
          </button>
        </div>

        <!-- Tab 1: KDS Kanban Board -->
        ${activeTab === 'kds' ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Column 1: Incoming Orders (SLA ≤ 60s) -->
            <div class="bg-slate-100/80 border border-slate-200/80 rounded-3xl p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <h3 class="font-bold text-xs text-slate-900">Pesanan Masuk</h3>
                </div>
                <span class="bg-red-100 text-red-800 font-bold text-xs px-2 py-0.5 rounded-md">
                  ${incomingOrders.length}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-3">
                ${incomingOrders.length === 0 ? `
                  <div class="h-36 flex items-center justify-center text-slate-400 text-xs text-center">
                    Tidak ada pesanan baru
                  </div>
                ` : incomingOrders.map(order => `
                  <div class="bg-white border border-red-200 rounded-2xl p-3.5 shadow-sm space-y-3">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="font-mono font-black text-sm text-slate-900">#${order.orderNumber}</span>
                        <span class="text-[11px] text-slate-500 block">${order.customer.name}</span>
                      </div>
                      <span class="bg-red-50 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded">
                        Perlu Respon
                      </span>
                    </div>

                    <div class="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      ${order.items.map(i => `
                        <div class="font-medium">${i.quantity}x ${i.menuItem.name}</div>
                      `).join('')}
                    </div>

                    <div class="flex gap-2 pt-1">
                      <button class="btn-reject-order flex-1 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition-colors" data-id="${order.id}">
                        Tolak
                      </button>
                      <button class="btn-accept-order flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${order.id}">
                        Terima & Masak
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Column 2: In Kitchen / Preparing -->
            <div class="bg-slate-100/80 border border-slate-200/80 rounded-3xl p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 class="font-bold text-xs text-slate-900">Sedang Dimasak</h3>
                </div>
                <span class="bg-amber-100 text-amber-900 font-bold text-xs px-2 py-0.5 rounded-md">
                  ${preparingOrders.length}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-3">
                ${preparingOrders.length === 0 ? `
                  <div class="h-36 flex items-center justify-center text-slate-400 text-xs text-center">
                    Dapur sedang kosong
                  </div>
                ` : preparingOrders.map(order => `
                  <div class="bg-white border border-amber-200 rounded-2xl p-3.5 shadow-sm space-y-3">
                    <div class="flex justify-between items-start">
                      <span class="font-mono font-black text-sm text-slate-900">#${order.orderNumber}</span>
                      <span class="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded">
                        Waktu: ${order.prepTimeMinutes}m
                      </span>
                    </div>

                    <div class="text-xs text-slate-700 space-y-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      ${order.items.map(i => `
                        <div class="font-medium">${i.quantity}x ${i.menuItem.name}</div>
                      `).join('')}
                    </div>

                    <button class="btn-ready-order w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all" data-id="${order.id}">
                      Tandai Siap Diambil &rarr;
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Column 3: Ready for Pickup -->
            <div class="bg-slate-100/80 border border-slate-200/80 rounded-3xl p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h3 class="font-bold text-xs text-slate-900">Siap Diambil Driver</h3>
                </div>
                <span class="bg-blue-100 text-blue-900 font-bold text-xs px-2 py-0.5 rounded-md">
                  ${readyOrders.length}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-3">
                ${readyOrders.length === 0 ? `
                  <div class="h-36 flex items-center justify-center text-slate-400 text-xs text-center">
                    Tidak ada antrean pickup
                  </div>
                ` : readyOrders.map(order => `
                  <div class="bg-white border border-blue-200 rounded-2xl p-3.5 shadow-sm space-y-3">
                    <div class="flex justify-between items-start">
                      <span class="font-mono font-black text-sm text-slate-900">#${order.orderNumber}</span>
                      <span class="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        ${order.courier ? `Driver: ${order.courier.name}` : 'Mencari driver...'}
                      </span>
                    </div>

                    <p class="text-xs text-slate-500 font-normal">
                      Pesanan telah dikemas rapi di meja counter.
                    </p>

                    <button class="btn-handover-order w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all" data-id="${order.id}">
                      Serahkan ke Driver
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Column 4: Handed Over / Completed -->
            <div class="bg-slate-100/80 border border-slate-200/80 rounded-3xl p-4 space-y-3 flex flex-col">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 class="font-bold text-xs text-slate-900">Selesai / Diantar</h3>
                </div>
                <span class="bg-emerald-100 text-emerald-900 font-bold text-xs px-2 py-0.5 rounded-md">
                  ${completedOrders.length}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-3">
                ${completedOrders.length === 0 ? `
                  <div class="h-36 flex items-center justify-center text-slate-400 text-xs text-center">
                    Belum ada order selesai
                  </div>
                ` : completedOrders.map(order => `
                  <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1.5">
                    <div class="flex justify-between">
                      <span class="font-mono font-black text-xs text-slate-900">#${order.orderNumber}</span>
                      <span class="text-emerald-700 font-bold text-[10px]">
                        ${order.status === 'DELIVERED' ? 'Selesai' : 'Dalam Pengantaran'}
                      </span>
                    </div>
                    <span class="text-xs font-bold text-slate-800">${stateService.formatCurrency(order.grandTotal)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        ` : ''}

        <!-- Tab 2: Menu Stock & Availability Manager -->
        ${activeTab === 'menu' ? `
          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-display font-extrabold text-base text-slate-900">Daftar Menu & Status Stok</h2>
              <span class="text-xs text-slate-500">Atur ketersediaan menu secara langsung</span>
            </div>

            <div class="divide-y divide-slate-100">
              ${restMenuItems.map(item => `
                <div class="py-3.5 flex items-center justify-between gap-4">
                  <div class="flex items-center space-x-3.5">
                    <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100" />
                    <div>
                      <h4 class="font-bold text-xs text-slate-900">${item.name}</h4>
                      <span class="text-[11px] font-bold text-slate-800">${stateService.formatCurrency(item.price)}</span>
                      <span class="text-[10px] text-slate-400 block">${item.category}</span>
                    </div>
                  </div>

                  <!-- Stock Switch -->
                  <div class="flex items-center space-x-3">
                    <button class="btn-toggle-item-stock px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${item.isAvailable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'}" data-id="${item.id}">
                      ${item.isAvailable ? 'Tersedia' : 'Stok Habis'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tab 3: Sales Analytics -->
        ${activeTab === 'analytics' ? `
          <div class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
                <span class="text-xs text-slate-400 block font-medium">Pendapatan Hari Ini</span>
                <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
                  ${stateService.formatCurrency(todayGmv)}
                </h3>
                <span class="text-[11px] text-emerald-700 font-bold mt-1 block">Tingkat konfirmasi 100%</span>
              </div>

              <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
                <span class="text-xs text-slate-400 block font-medium">Total Pesanan Diproses</span>
                <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
                  ${restOrders.length} Pesanan
                </h3>
                <span class="text-[11px] text-slate-500 font-normal mt-1 block">SLA respon di bawah 60 detik</span>
              </div>

              <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
                <span class="text-xs text-slate-400 block font-medium">Rata-Rata Waktu Masak</span>
                <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
                  12.5 Menit
                </h3>
                <span class="text-[11px] text-emerald-700 font-bold mt-1 block">Standar dapur terpenuhi</span>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // Handlers
    container.querySelector('#select-outlet')?.addEventListener('change', (e) => {
      selectedRestId = (e.target as HTMLSelectElement).value;
      render();
    });

    container.querySelector('#btn-toggle-store')?.addEventListener('click', () => {
      stateService.toggleStoreStatus(selectedRestId);
    });

    container.querySelectorAll('.btn-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = (e.currentTarget as HTMLElement).dataset.tab as any;
        render();
      });
    });

    container.querySelectorAll('.btn-accept-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        stateService.acceptOrder(id, 15);
        stateService.startPreparingOrder(id);
      });
    });

    container.querySelectorAll('.btn-reject-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const reason = prompt('Masukkan alasan penolakan pesanan:', 'Bahan habis / Overload dapur');
        if (reason) stateService.rejectOrder(id, reason);
      });
    });

    container.querySelectorAll('.btn-ready-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        stateService.markOrderReady(id);
        stateService.assignCourierToOrder(id);
      });
    });

    container.querySelectorAll('.btn-handover-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        stateService.courierPickedUp(id);
      });
    });

    container.querySelectorAll('.btn-toggle-item-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        stateService.toggleItemAvailability(id);
      });
    });
  };

  render();
  return stateService.subscribe(update);
}
