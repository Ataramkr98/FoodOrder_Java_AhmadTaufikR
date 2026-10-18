import { stateService } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { PaymentMethodType } from '../../core/models/types';
import { icon } from './icons';
import { toast } from './toast';

export function openCheckoutModal(onOrderSuccess: (orderId: string) => void) {
  let selectedMethod: PaymentMethodType = 'qris';
  let isProcessing = false;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in';

  const render = () => {
    const state = stateService.getState();
    const grandTotal = stateService.getGrandTotal();
    const currentAddress = state.currentAddress;

    overlay.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 bg-slate-800 rounded-xl text-brand-400">
              ${icon('credit-card', 'w-5 h-5')}
            </div>
            <div>
              <h3 class="font-display font-extrabold text-base text-white">Pembayaran Pesanan</h3>
              <span class="text-[11px] text-slate-400 font-medium">Midtrans Gateway (QRIS, VA & E-Wallet)</span>
            </div>
          </div>
          <button id="btn-close-checkout" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition-colors">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          <!-- Delivery Address Summary -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
            <div class="flex items-center justify-between text-slate-800 font-bold">
              <span class="flex items-center space-x-1.5">
                ${icon('map-pin', 'w-3.5 h-3.5 text-brand-600')}
                <span>${i18n.t('delivery_address')}</span>
              </span>
              <span class="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-bold uppercase">
                ${state.serviceMode}
              </span>
            </div>
            <p class="text-slate-700 font-medium text-xs leading-relaxed">${currentAddress.address}</p>
            ${currentAddress.notes ? `
              <p class="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200/60 font-normal">
                Catatan: ${currentAddress.notes}
              </p>
            ` : ''}
          </div>

          <!-- Total Amount Banner -->
          <div class="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span class="text-[11px] font-medium text-slate-400 block">Total Tagihan</span>
              <p class="text-[10px] text-slate-400">Termasuk ongkir & biaya layanan</p>
            </div>
            <span class="text-xl font-extrabold text-white font-display">
              ${stateService.formatCurrency(grandTotal)}
            </span>
          </div>

          <!-- Payment Methods -->
          <div class="space-y-3">
            <label class="font-bold text-slate-900 block text-xs">Pilih Metode Pembayaran:</label>

            <!-- QRIS Option -->
            <label class="flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === 'qris' ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}">
              <input type="radio" name="pay-method" value="qris" ${selectedMethod === 'qris' ? 'checked' : ''} class="mt-1 text-brand-600 focus:ring-brand-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    ${icon('qr-code', 'w-4 h-4 text-slate-700')}
                    <span>QRIS (GoPay, OVO, DANA, BCA, Livin)</span>
                  </span>
                  <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">Instan</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Scan kode QR dari aplikasi m-banking atau dompet digital apa saja</p>
                
                ${selectedMethod === 'qris' ? `
                  <div class="mt-3 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-2.5">
                    <div class="w-36 h-36 bg-slate-900 rounded-2xl p-3 flex items-center justify-center shadow-sm">
                      <!-- Simulated Clean QR Code -->
                      <div class="w-full h-full bg-white p-2 rounded-xl flex flex-col justify-between">
                        <div class="flex justify-between">
                          <div class="w-6 h-6 bg-slate-900 rounded-md"></div>
                          <div class="w-6 h-6 bg-slate-900 rounded-md"></div>
                        </div>
                        <div class="flex items-center justify-center font-mono font-bold text-[9px] text-slate-900 tracking-wider">
                          QRIS BITES
                        </div>
                        <div class="flex justify-between">
                          <div class="w-6 h-6 bg-slate-900 rounded-md"></div>
                          <div class="w-4 h-4 bg-slate-900 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                    <span class="text-[11px] font-semibold text-slate-600">Scan QRIS menggunakan aplikasi perbankan atau e-wallet pilihanmu</span>
                  </div>
                ` : ''}
              </div>
            </label>

            <!-- Virtual Account -->
            <label class="flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === 'va_bca' ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}">
              <input type="radio" name="pay-method" value="va_bca" ${selectedMethod === 'va_bca' ? 'checked' : ''} class="mt-1 text-brand-600 focus:ring-brand-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    ${icon('credit-card', 'w-4 h-4 text-slate-700')}
                    <span>BCA Virtual Account</span>
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Verifikasi otomatis tanpa perlu upload bukti transfer</p>
                ${selectedMethod === 'va_bca' ? `
                  <div class="mt-2.5 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-mono font-bold text-xs text-slate-800">
                    <span>8809 1082 9918 2931</span>
                    <span class="text-[11px] text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md cursor-pointer font-sans font-bold">Salin</span>
                  </div>
                ` : ''}
              </div>
            </label>

            <!-- GoPay -->
            <label class="flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === 'gopay' ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}">
              <input type="radio" name="pay-method" value="gopay" ${selectedMethod === 'gopay' ? 'checked' : ''} class="mt-1 text-brand-600 focus:ring-brand-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-xs">GoPay / GoPay Later</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Konfirmasi instan terhubung akun Gojek</p>
              </div>
            </label>

            <!-- Credit Card -->
            <label class="flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}">
              <input type="radio" name="pay-method" value="card" ${selectedMethod === 'card' ? 'checked' : ''} class="mt-1 text-brand-600 focus:ring-brand-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-xs">Kartu Debit / Kredit (Visa, Mastercard, JCB)</span>
                </div>
                ${selectedMethod === 'card' ? `
                  <div class="mt-2.5 space-y-2">
                    <input type="text" placeholder="4000 1234 5678 9010" class="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono" />
                    <div class="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM/YY" class="p-2.5 border border-slate-200 rounded-xl text-xs font-mono" />
                      <input type="text" placeholder="CVV" class="p-2.5 border border-slate-200 rounded-xl text-xs font-mono" />
                    </div>
                  </div>
                ` : ''}
              </div>
            </label>

          </div>

        </div>

        <!-- Footer Action -->
        <div class="p-4 bg-white border-t border-slate-100 shadow-lg space-y-2">
          <button id="btn-confirm-payment" ${isProcessing ? 'disabled' : ''} class="w-full bg-brand-500 hover:bg-brand-600 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50">
            ${isProcessing ? `
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Memproses Pembayaran...</span>
            ` : `
              <span>Konfirmasi & Bayar ${stateService.formatCurrency(grandTotal)}</span>
              ${icon('arrow-right', 'w-4 h-4 text-white')}
            `}
          </button>
        </div>

      </div>
    `;

    // Handlers
    overlay.querySelector('#btn-close-checkout')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.querySelectorAll('input[name="pay-method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedMethod = (e.target as HTMLInputElement).value as PaymentMethodType;
        render();
      });
    });

    overlay.querySelector('#btn-confirm-payment')?.addEventListener('click', () => {
      isProcessing = true;
      render();

      setTimeout(() => {
        try {
          const newOrder = stateService.placeOrder(selectedMethod);
          document.body.removeChild(overlay);
          toast('Pesanan berhasil dibuat!', 'success');
          onOrderSuccess(newOrder.id);
        } catch (e: any) {
          toast(e.message || 'Keranjang masih kosong', 'error');
          isProcessing = false;
          render();
        }
      }, 1000);
    });
  };

  render();
  document.body.appendChild(overlay);
}
