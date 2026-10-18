import { stateService } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { icon } from './icons';
import { toast } from './toast';

export function openCartDrawer(onProceedToCheckout: () => void) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in';

  let promoInputVal = '';

  const render = () => {
    const state = stateService.getState();
    const subtotal = stateService.getCartSubtotal();
    const deliveryFee = stateService.getDeliveryFee();
    const serviceFee = stateService.getServiceFee();
    const discount = stateService.getDiscountAmount();
    const tip = state.courierTip;
    const grandTotal = stateService.getGrandTotal();
    const totalItems = state.cart.reduce((s, i) => s + i.quantity, 0);

    overlay.innerHTML = `
      <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-left">
        
        <!-- Drawer Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 bg-brand-50 text-brand-600 rounded-xl">
              ${icon('shopping-bag', 'w-5 h-5')}
            </div>
            <div>
              <h3 class="font-display font-extrabold text-base text-slate-900">${i18n.t('nav_cart')}</h3>
              <span class="text-[11px] text-slate-500 font-medium">${totalItems} item dipilih</span>
            </div>
          </div>
          <button id="btn-close-cart" class="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          ${state.cart.length === 0 ? `
            <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                ${icon('shopping-bag', 'w-8 h-8')}
              </div>
              <h4 class="font-bold text-slate-800 text-sm">${i18n.t('cart_empty')}</h4>
              <p class="text-xs text-slate-400 max-w-xs">${i18n.t('cart_empty_sub')}</p>
            </div>
          ` : `
            
            <!-- Restaurant Info Header -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3">
              <div class="p-2 bg-white rounded-xl text-slate-700 shadow-sm">
                ${icon('store', 'w-4 h-4 text-brand-600')}
              </div>
              <div class="truncate">
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Restoran Pilihan</span>
                <h4 class="font-bold text-xs text-slate-900 truncate">${state.cart[0].menuItem.restaurantId === 'res-pak-budi' ? 'Ayam Crispy Pak Budi — Tebet' : 'Restoran Pilihan'}</h4>
              </div>
            </div>

            <!-- Items List -->
            <div class="space-y-3">
              ${state.cart.map(item => `
                <div class="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm space-y-2">
                  <div class="flex items-start space-x-3">
                    <img src="${item.menuItem.image}" alt="${item.menuItem.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-100 border border-slate-100" />
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-xs text-slate-900 truncate">${item.menuItem.name}</h4>
                      
                      <!-- Modifiers pills -->
                      ${item.selectedModifiers.length > 0 ? `
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${item.selectedModifiers.map(m => `
                            <span class="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                              ${m.optionName}
                            </span>
                          `).join('')}
                        </div>
                      ` : ''}

                      ${item.specialInstructions ? `
                        <p class="text-[10px] text-amber-800 bg-amber-50/80 border border-amber-200/60 p-1.5 rounded-lg mt-1.5 font-normal">
                          "${item.specialInstructions}"
                        </p>
                      ` : ''}

                      <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        <span class="font-extrabold text-xs text-slate-900">
                          ${stateService.formatCurrency(item.totalPrice)}
                        </span>

                        <!-- Stepper -->
                        <div class="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                          <button class="btn-item-minus w-6 h-6 rounded-md bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shadow-sm" data-uid="${item.uid}">
                            ${icon('minus', 'w-3 h-3')}
                          </button>
                          <span class="w-6 text-center font-bold text-xs text-slate-900">${item.quantity}</span>
                          <button class="btn-item-plus w-6 h-6 rounded-md bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm" data-uid="${item.uid}">
                            ${icon('plus', 'w-3 h-3')}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Promo Code Box -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
              <div class="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                ${icon('tag', 'w-3.5 h-3.5 text-slate-600')}
                <span>${i18n.t('promo_code')}</span>
              </div>
              
              ${state.appliedPromo ? `
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-emerald-700 font-bold text-xs font-mono">${state.appliedPromo.code}</span>
                    <span class="text-[11px] text-emerald-700 font-medium">(-${stateService.formatCurrency(discount)})</span>
                  </div>
                  <button id="btn-remove-promo" class="text-[11px] font-bold text-rose-600 hover:underline">
                    Hapus
                  </button>
                </div>
              ` : `
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="input-promo-code"
                    placeholder="Contoh: BITESHEMAT / FREESHIP"
                    value="${promoInputVal}"
                    class="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono text-slate-800"
                  />
                  <button id="btn-apply-promo" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors">
                    ${i18n.t('apply_promo')}
                  </button>
                </div>
              `}
            </div>

            <!-- Driver Tip Selector -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                ${icon('user', 'w-3.5 h-3.5 text-slate-600')}
                <span>${i18n.t('courier_tip')}</span>
              </label>
              <div class="grid grid-cols-4 gap-1.5">
                ${[0, 2000, 5000, 10000].map(tipAmount => `
                  <button class="btn-tip px-2 py-2 rounded-xl text-xs font-bold border transition-all ${tip === tipAmount ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}" data-tip="${tipAmount}">
                    ${tipAmount === 0 ? 'Tanpa Tip' : stateService.formatCurrency(tipAmount)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Detailed Cost Breakdown -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>${i18n.t('subtotal')}</span>
                <span>${stateService.formatCurrency(subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>${i18n.t('delivery_fee')}</span>
                <span>${stateService.formatCurrency(deliveryFee)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>${i18n.t('service_fee')}</span>
                <span>${stateService.formatCurrency(serviceFee)}</span>
              </div>
              ${discount > 0 ? `
                <div class="flex justify-between text-emerald-700 font-bold">
                  <span>${i18n.t('discount')}</span>
                  <span>-${stateService.formatCurrency(discount)}</span>
                </div>
              ` : ''}
              ${tip > 0 ? `
                <div class="flex justify-between text-brand-700 font-bold">
                  <span>${i18n.t('courier_tip')}</span>
                  <span>+${stateService.formatCurrency(tip)}</span>
                </div>
              ` : ''}
              <div class="border-t border-slate-200 pt-2.5 flex justify-between font-extrabold text-sm text-slate-900">
                <span>${i18n.t('grand_total')}</span>
                <span class="text-brand-600">${stateService.formatCurrency(grandTotal)}</span>
              </div>
            </div>

          `}

        </div>

        <!-- Drawer Footer -->
        ${state.cart.length > 0 ? `
          <div class="p-4 bg-white border-t border-slate-100 shadow-lg space-y-2">
            <button id="btn-proceed-checkout" class="w-full bg-brand-500 hover:bg-brand-600 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all">
              <span>Lanjut ke Pembayaran</span>
              <span class="font-extrabold flex items-center space-x-1">
                <span>${stateService.formatCurrency(grandTotal)}</span>
                ${icon('arrow-right', 'w-4 h-4')}
              </span>
            </button>
          </div>
        ` : ''}

      </div>
    `;

    // Event Handlers
    overlay.querySelector('#btn-close-cart')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.querySelectorAll('.btn-item-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = (e.currentTarget as HTMLElement).dataset.uid!;
        stateService.updateCartItemQty(uid, -1);
        render();
      });
    });

    overlay.querySelectorAll('.btn-item-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = (e.currentTarget as HTMLElement).dataset.uid!;
        stateService.updateCartItemQty(uid, 1);
        render();
      });
    });

    overlay.querySelectorAll('.btn-tip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tipVal = parseInt((e.currentTarget as HTMLElement).dataset.tip || '0', 10);
        stateService.setCourierTip(tipVal);
        render();
      });
    });

    const promoInput = overlay.querySelector('#input-promo-code') as HTMLInputElement;
    if (promoInput) {
      promoInput.addEventListener('input', () => {
        promoInputVal = promoInput.value;
      });
    }

    overlay.querySelector('#btn-apply-promo')?.addEventListener('click', () => {
      if (!promoInputVal) return;
      const res = stateService.applyPromo(promoInputVal);
      if (!res.success) {
        toast(res.message, 'error');
      } else {
        toast(res.message, 'success');
      }
      render();
    });

    overlay.querySelector('#btn-remove-promo')?.addEventListener('click', () => {
      stateService.removePromo();
      promoInputVal = '';
      render();
    });

    overlay.querySelector('#btn-proceed-checkout')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      onProceedToCheckout();
    });
  };

  render();
  document.body.appendChild(overlay);
}
