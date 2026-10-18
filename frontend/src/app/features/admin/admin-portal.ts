import { stateService, StateData } from '../../core/services/state.service';
import { PromoCode } from '../../core/models/types';
import { icon } from '../../shared/components/icons';
import { toast } from '../../shared/components/toast';

export function renderAdminPortal(container: HTMLElement) {
  let activeTab: 'orders' | 'promos' | 'merchants' = 'orders';
  let selectedOrderId: string | null = null;
  let currentState = stateService.getState();

  const update = (state: StateData) => {
    currentState = state;
    render();
  };

  const render = () => {
    const orders = currentState.orders;
    const totalGmv = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const activeInFlight = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

    container.innerHTML = `
      <div class="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        
        <!-- Admin Header -->
        <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-3.5">
            <div class="w-13 h-13 p-3 bg-slate-800 rounded-2xl text-brand-400 flex items-center justify-center font-bold text-xl">
              ${icon('settings', 'w-7 h-7 text-brand-400')}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="font-display font-extrabold text-xl text-white">Bites Admin Back-Office</h1>
                <span class="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-slate-700">
                  Operations Console
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Monitoring transaksi, audit trail, promo code, dan intervensi refund</p>
            </div>
          </div>

          <div class="flex items-center space-x-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-slate-300 font-semibold">Semua Layanan Berjalan Normal</span>
          </div>
        </div>

        <!-- Live Operations Metrics Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
            <span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Volume Transaksi</span>
            <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
              ${stateService.formatCurrency(totalGmv)}
            </h3>
            <span class="text-[11px] text-slate-500 font-normal mt-1 block">Semua pesanan selesai</span>
          </div>

          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
            <span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Pesanan Dalam Proses</span>
            <h3 class="font-display font-extrabold text-2xl text-brand-600 mt-1">
              ${activeInFlight.length} Order
            </h3>
            <span class="text-[11px] text-slate-500 font-normal mt-1 block">Live telemetry aktif</span>
          </div>

          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
            <span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mitra Restoran</span>
            <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
              ${currentState.restaurants.length} Outlet
            </h3>
            <span class="text-[11px] text-slate-500 font-normal mt-1 block">Jakarta Selatan & Pusat</span>
          </div>

          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card">
            <span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Armada Driver</span>
            <h3 class="font-display font-extrabold text-2xl text-slate-900 mt-1">
              ${currentState.courier.isOnline ? '1 Aktif' : '0 Aktif'}
            </h3>
            <span class="text-[11px] text-slate-500 font-normal mt-1 block">Status armada saat ini</span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-200 gap-6 text-sm">
          <button class="btn-admin-tab pb-3 font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'orders' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="orders">
            ${icon('file-text', 'w-4 h-4')}
            <span>Inspeksi Pesanan & Log Audit</span>
          </button>
          
          <button class="btn-admin-tab pb-3 font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'promos' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="promos">
            ${icon('tag', 'w-4 h-4')}
            <span>Manajemen Promo</span>
          </button>

          <button class="btn-admin-tab pb-3 font-bold transition-all border-b-2 flex items-center space-x-2 ${activeTab === 'merchants' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="merchants">
            ${icon('store', 'w-4 h-4')}
            <span>Direktori Mitra Restoran</span>
          </button>
        </div>

        <!-- Tab 1: Order Inspector & Audit Log -->
        ${activeTab === 'orders' ? `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Left Order List (5 cols) -->
            <div class="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-4 shadow-card space-y-3">
              <h3 class="font-bold text-xs text-slate-900 pb-2 border-b border-slate-100">
                Semua Pesanan (${orders.length})
              </h3>

              <div class="space-y-2.5 max-h-[600px] overflow-y-auto">
                ${orders.map(o => {
                  const isSelected = (selectedOrder && selectedOrder.id === o.id);
                  return `
                    <div class="card-admin-order p-3.5 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-brand-500 bg-brand-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'}" data-id="${o.id}">
                      <div class="flex justify-between items-start">
                        <div>
                          <span class="font-mono font-bold text-xs text-slate-900">#${o.orderNumber}</span>
                          <h4 class="font-bold text-xs text-slate-800 truncate max-w-[180px]">${o.restaurant.name}</h4>
                          <span class="text-[11px] text-slate-500">${o.customer.name}</span>
                        </div>
                        <div class="text-right">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : o.status === 'CANCELLED' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                            ${o.status}
                          </span>
                          <span class="block text-xs font-bold text-slate-900 mt-1">${stateService.formatCurrency(o.grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Right Detail Inspector (7 cols) -->
            <div class="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-5">
              ${selectedOrder ? `
                <div class="space-y-4">
                  <!-- Header info -->
                  <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="font-mono font-black text-lg text-slate-900">#${selectedOrder.orderNumber}</span>
                        <span class="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5 rounded-md border border-slate-200 font-mono">
                          ID: ${selectedOrder.id}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">
                        Waktu order: ${new Date(selectedOrder.timestamps.placedAt).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <!-- Payment Ref -->
                    <div class="text-right text-xs">
                      <span class="text-[11px] text-slate-400 block">Referensi Pembayaran</span>
                      <span class="font-mono font-bold text-slate-800">${selectedOrder.paymentRef || 'N/A'}</span>
                    </div>
                  </div>

                  <!-- Customer & Restaurant Info Grid -->
                  <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Pelanggan</span>
                      <h4 class="font-bold text-slate-900 text-xs mt-0.5">${selectedOrder.customer.name}</h4>
                      <p class="text-[11px] text-slate-500 mt-0.5">${selectedOrder.customer.address}</p>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Restoran Mitra</span>
                      <h4 class="font-bold text-slate-900 text-xs mt-0.5">${selectedOrder.restaurant.name}</h4>
                      <p class="text-[11px] text-slate-500 mt-0.5">${selectedOrder.restaurant.address}</p>
                    </div>
                  </div>

                  <!-- Audit Log Timeline -->
                  <div class="space-y-2">
                    <h4 class="font-bold text-xs text-slate-900">Log Riwayat Status</h4>
                    <div class="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden">
                      ${selectedOrder.timeline.map(t => `
                        <div class="p-3 flex items-center justify-between bg-white hover:bg-slate-50/50">
                          <div>
                            <span class="font-mono font-bold text-slate-900">${t.status}</span>
                            <p class="text-[11px] text-slate-600">${t.label} ${t.description ? `— ${t.description}` : ''}</p>
                          </div>
                          <span class="text-[11px] font-mono text-slate-400">
                            ${new Date(t.timestamp).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Admin Interventions -->
                  <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 class="font-bold text-xs text-slate-900">Opsi Tindakan Bantuan</h4>
                    <div class="flex flex-wrap gap-2">
                      <button id="btn-admin-refund" class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs transition-colors shadow-sm" data-id="${selectedOrder.id}">
                        Refund Manual (${stateService.formatCurrency(selectedOrder.grandTotal)})
                      </button>
                      <button id="btn-admin-redispatch" class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs transition-colors shadow-sm" data-id="${selectedOrder.id}">
                        Tugaskan Driver Baru
                      </button>
                      <button id="btn-admin-cancel" class="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors shadow-sm" data-id="${selectedOrder.id}">
                        Batalkan Pesanan
                      </button>
                    </div>
                  </div>

                </div>
              ` : `
                <div class="p-12 text-center text-slate-400 text-xs">Pilih salah satu pesanan untuk melihat detail inspeksi.</div>
              `}
            </div>

          </div>
        ` : ''}

        <!-- Tab 2: Promo Code Engine -->
        ${activeTab === 'promos' ? `
          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-display font-extrabold text-base text-slate-900">Daftar Kode Promo & Voucher</h2>
                <p class="text-xs text-slate-500">Kelola diskon belanja dan syarat minimal transaksi</p>
              </div>
              <button id="btn-add-promo" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm">
                + Tambah Promo Baru
              </button>
            </div>

            <div class="divide-y divide-slate-100">
              ${currentState.promos.map(promo => `
                <div class="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        ${promo.code}
                      </span>
                      <h4 class="font-bold text-xs text-slate-900">${promo.title}</h4>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">${promo.description} (Min: ${stateService.formatCurrency(promo.minSpend)})</p>
                  </div>

                  <button class="btn-toggle-promo px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${promo.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}" data-code="${promo.code}">
                    ${promo.isActive ? 'Aktif' : 'Non-Aktif'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tab 3: Merchants Directory -->
        ${activeTab === 'merchants' ? `
          <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card space-y-4">
            <h2 class="font-display font-extrabold text-base text-slate-900">Mitra Restoran Terverifikasi</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${currentState.restaurants.map(r => `
                <div class="border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-3.5 bg-slate-50/50">
                  <img src="${r.logo}" alt="${r.name}" class="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200" />
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">${r.name}</h4>
                    <span class="text-[11px] text-slate-500 block mt-0.5">${r.address}</span>
                    <span class="text-[10px] text-emerald-700 font-bold mt-1.5 block">Mitra Terverifikasi</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // Handlers
    container.querySelectorAll('.btn-admin-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = (e.currentTarget as HTMLElement).dataset.tab as any;
        render();
      });
    });

    container.querySelectorAll('.card-admin-order').forEach(card => {
      card.addEventListener('click', (e) => {
        selectedOrderId = (e.currentTarget as HTMLElement).dataset.id!;
        render();
      });
    });

    container.querySelector('#btn-admin-refund')?.addEventListener('click', () => {
      if (selectedOrder) {
        stateService.refundOrderAdmin(selectedOrder.id, selectedOrder.grandTotal, 'Refund disetujui oleh Customer Support Pusat');
        toast('Refund dana transaksi berhasil dieksekusi!');
      }
    });

    container.querySelector('#btn-admin-redispatch')?.addEventListener('click', () => {
      if (selectedOrder) {
        stateService.redispatchOrderAdmin(selectedOrder.id);
        toast('Driver baru berhasil ditugaskan ke pesanan!');
      }
    });

    container.querySelector('#btn-admin-cancel')?.addEventListener('click', () => {
      if (selectedOrder) {
        stateService.cancelOrderAdmin(selectedOrder.id, 'Dibatalkan oleh Admin Pusat');
        toast('Pesanan telah dibatalkan!');
      }
    });

    container.querySelector('#btn-add-promo')?.addEventListener('click', () => {
      const code = prompt('Masukkan kode voucher baru (cth: DISKONJUMAT):', 'DISKONJUMAT');
      if (code) {
        const newPromo: PromoCode = {
          code: code.toUpperCase(),
          title: `Promo Spesial ${code.toUpperCase()}`,
          description: `Potongan diskon Rp 20.000 untuk transaksi minimal Rp 60.000`,
          discountType: 'flat',
          discountValue: 20000,
          minSpend: 60000,
          validUntil: '2026-12-31',
          isActive: true,
        };
        stateService.addPromo(newPromo);
      }
    });

    container.querySelectorAll('.btn-toggle-promo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = (e.currentTarget as HTMLElement).dataset.code!;
        stateService.togglePromo(code);
      });
    });
  };

  render();
  return stateService.subscribe(update);
}
