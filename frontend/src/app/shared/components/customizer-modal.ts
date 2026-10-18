import { MenuItem, SelectedModifier, CartItem } from '../../core/models/types';
import { stateService } from '../../core/services/state.service';
import { i18n } from '../../core/services/i18n.service';
import { icon } from './icons';
import { toast } from './toast';

export function openCustomizerModal(menuItem: MenuItem, onAdded?: () => void) {
  let quantity = 1;
  const selectedModifiers: { [groupId: string]: SelectedModifier[] } = {};
  let specialInstructions = '';

  // Initialize default selections for required modifier groups
  if (menuItem.modifierGroups) {
    menuItem.modifierGroups.forEach(group => {
      if (group.required && group.options.length > 0) {
        const def = group.options.find(o => o.isDefault) || group.options[0];
        selectedModifiers[group.id] = [
          {
            groupId: group.id,
            groupName: group.name,
            optionId: def.id,
            optionName: def.name,
            price: def.price,
          }
        ];
      } else {
        selectedModifiers[group.id] = [];
      }
    });
  }

  // Create modal container
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in';
  
  const calculateTotal = (): number => {
    let modsTotal = 0;
    Object.values(selectedModifiers).forEach(list => {
      list.forEach(m => (modsTotal += m.price));
    });
    return (menuItem.price + modsTotal) * quantity;
  };

  const calculateUnitPrice = (): number => {
    let modsTotal = 0;
    Object.values(selectedModifiers).forEach(list => {
      list.forEach(m => (modsTotal += m.price));
    });
    return menuItem.price + modsTotal;
  };

  const renderContent = () => {
    const grandTotal = calculateTotal();

    modalOverlay.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        <!-- Header Image & Close Button -->
        <div class="relative h-56 sm:h-64 bg-slate-100 flex-shrink-0">
          <img src="${menuItem.image}" alt="${menuItem.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20"></div>
          
          <button id="btn-close-modal" class="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105">
            ${icon('x', 'w-4 h-4 text-slate-800')}
          </button>

          <div class="absolute bottom-4 left-4 right-4 text-white">
            <span class="bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-1.5 inline-block">
              ${menuItem.category}
            </span>
            <h3 class="text-xl font-display font-extrabold leading-tight text-white drop-shadow">
              ${menuItem.name}
            </h3>
            <p class="text-xs text-white/90 line-clamp-2 mt-0.5 font-normal">
              ${menuItem.description}
            </p>
          </div>
        </div>

        <!-- Scrollable Options Body -->
        <div class="p-5 overflow-y-auto flex-1 space-y-6">
          
          <!-- Base Price -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <span class="text-xs font-semibold text-slate-500">Harga Dasar</span>
            <span class="text-sm font-extrabold text-slate-900">
              ${stateService.formatCurrency(menuItem.price)}
            </span>
          </div>

          <!-- Modifier Groups -->
          ${(menuItem.modifierGroups || []).map(group => {
            const isSingle = group.maxSelection === 1;
            const currentSelected = selectedModifiers[group.id] || [];

            return `
              <div class="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <h4 class="font-bold text-xs text-slate-900">${group.name}</h4>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${group.required ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'}">
                      ${group.required ? i18n.t('required_select') : i18n.t('optional_select')}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-medium">
                    ${isSingle ? 'Pilih 1' : `Maks. ${group.maxSelection}`}
                  </span>
                </div>

                <div class="space-y-2">
                  ${group.options.map(option => {
                    const isChecked = currentSelected.some(m => m.optionId === option.id);

                    return `
                      <label class="flex items-center justify-between p-3 rounded-xl border bg-white cursor-pointer transition-all ${isChecked ? 'border-brand-500 bg-brand-50/25 shadow-sm ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}">
                        <div class="flex items-center space-x-3">
                          <input
                            type="${isSingle ? 'radio' : 'checkbox'}"
                            name="mod-group-${group.id}"
                            value="${option.id}"
                            ${isChecked ? 'checked' : ''}
                            class="mod-input text-brand-600 focus:ring-brand-500 w-4 h-4 rounded"
                            data-group-id="${group.id}"
                            data-group-name="${group.name}"
                            data-option-id="${option.id}"
                            data-option-name="${option.name}"
                            data-price="${option.price}"
                            data-single="${isSingle}"
                          />
                          <span class="text-xs font-semibold text-slate-800">${option.name}</span>
                        </div>
                        <span class="text-xs font-bold ${option.price > 0 ? 'text-brand-600' : 'text-slate-400'}">
                          ${option.price > 0 ? `+${stateService.formatCurrency(option.price)}` : 'Gratis'}
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}

          <!-- Special Instructions -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              ${icon('file-text', 'w-3.5 h-3.5 text-slate-500')}
              <span>Catatan Tambahan untuk Dapur (Opsional)</span>
            </label>
            <textarea
              id="input-special-notes"
              rows="2"
              placeholder="${i18n.t('special_notes_placeholder')}"
              class="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            >${specialInstructions}</textarea>
          </div>

        </div>

        <!-- Sticky Footer Action -->
        <div class="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shadow-lg">
          
          <!-- Quantity Stepper -->
          <div class="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button id="btn-qty-minus" class="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
              ${icon('minus', 'w-3.5 h-3.5')}
            </button>
            <span class="w-8 text-center font-extrabold text-sm text-slate-900">
              ${quantity}
            </span>
            <button id="btn-qty-plus" class="w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors">
              ${icon('plus', 'w-3.5 h-3.5')}
            </button>
          </div>

          <!-- Add to Cart Button -->
          <button id="btn-submit-add-cart" class="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between transition-all">
            <span>${i18n.t('add_to_cart')}</span>
            <span class="font-extrabold">${stateService.formatCurrency(grandTotal)}</span>
          </button>

        </div>

      </div>
    `;

    // Handlers
    modalOverlay.querySelector('#btn-close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });

    const notesEl = modalOverlay.querySelector('#input-special-notes') as HTMLTextAreaElement;
    if (notesEl) {
      notesEl.addEventListener('input', () => {
        specialInstructions = notesEl.value;
      });
    }

    modalOverlay.querySelector('#btn-qty-minus')?.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        renderContent();
      }
    });

    modalOverlay.querySelector('#btn-qty-plus')?.addEventListener('click', () => {
      quantity++;
      renderContent();
    });

    modalOverlay.querySelectorAll('.mod-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const groupId = target.dataset.groupId!;
        const groupName = target.dataset.groupName!;
        const optionId = target.dataset.optionId!;
        const optionName = target.dataset.optionName!;
        const price = parseInt(target.dataset.price || '0', 10);
        const isSingle = target.dataset.single === 'true';

        if (isSingle) {
          selectedModifiers[groupId] = [{ groupId, groupName, optionId, optionName, price }];
        } else {
          if (!selectedModifiers[groupId]) selectedModifiers[groupId] = [];
          if (target.checked) {
            selectedModifiers[groupId].push({ groupId, groupName, optionId, optionName, price });
          } else {
            selectedModifiers[groupId] = selectedModifiers[groupId].filter(m => m.optionId !== optionId);
          }
        }
        renderContent();
      });
    });

    modalOverlay.querySelector('#btn-submit-add-cart')?.addEventListener('click', () => {
      if (menuItem.modifierGroups) {
        for (const group of menuItem.modifierGroups) {
          if (group.required && (!selectedModifiers[group.id] || selectedModifiers[group.id].length === 0)) {
            toast(`Silakan pilih salah satu opsi pada bagian "${group.name}" terlebih dahulu.`);
            return;
          }
        }
      }

      const allSelected: SelectedModifier[] = [];
      Object.values(selectedModifiers).forEach(list => allSelected.push(...list));

      const cartItem: CartItem = {
        uid: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        menuItem,
        quantity,
        selectedModifiers: allSelected,
        specialInstructions,
        unitPrice: calculateUnitPrice(),
        totalPrice: calculateTotal(),
      };

      stateService.addToCart(cartItem);
      document.body.removeChild(modalOverlay);
      if (onAdded) onAdded();
    });
  };

  renderContent();
  document.body.appendChild(modalOverlay);
}
