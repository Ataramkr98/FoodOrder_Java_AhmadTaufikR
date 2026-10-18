import confetti from 'canvas-confetti';
import { stateService } from '../../core/services/state.service';
import { Order } from '../../core/models/types';
import { icon } from './icons';

export function openRatingModal(order: Order, onDone?: () => void) {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#F97316', '#3B82F6', '#10B981'],
  });

  let foodStars = 5;
  let courierStars = 5;
  let commentVal = '';

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in';

  const render = () => {
    overlay.innerHTML = `
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 animate-slide-up text-center space-y-5">
        
        <!-- Header -->
        <div class="space-y-1.5">
          <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            ${icon('check-circle', 'w-8 h-8 text-emerald-600')}
          </div>
          <h3 class="font-display font-extrabold text-lg text-slate-900">
            Pesanan Berhasil Diserahkan
          </h3>
          <p class="text-xs text-slate-500 font-normal">
            Terima kasih telah memesan di <span class="font-semibold text-slate-800">${order.restaurant.name.split('—')[0]}</span>
          </p>
        </div>

        <!-- Rating Section: Food -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
          <span class="text-xs font-bold text-slate-800 block">Kualitas & Rasa Makanan</span>
          <div class="flex justify-center space-x-2">
            ${[1, 2, 3, 4, 5].map(star => `
              <button class="btn-food-star text-2xl transition-transform hover:scale-110 ${star <= foodStars ? 'text-amber-400' : 'text-slate-300'}" data-star="${star}">
                ★
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Rating Section: Courier -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
          <span class="text-xs font-bold text-slate-800 block">Pelayanan Driver (${order.courier?.name || 'Driver'})</span>
          <div class="flex justify-center space-x-2">
            ${[1, 2, 3, 4, 5].map(star => `
              <button class="btn-courier-star text-2xl transition-transform hover:scale-110 ${star <= courierStars ? 'text-amber-400' : 'text-slate-300'}" data-star="${star}">
                ★
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Review Comment Input -->
        <textarea
          id="input-review-comment"
          rows="2"
          placeholder="Tulis ulasanmu untuk restoran atau driver (opsional)..."
          class="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
        >${commentVal}</textarea>

        <!-- Submit Button -->
        <div class="pt-1 flex gap-3">
          <button id="btn-skip-rating" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors">
            Nanti Saja
          </button>
          <button id="btn-submit-rating" class="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-all">
            Kirim Ulasan
          </button>
        </div>

      </div>
    `;

    overlay.querySelectorAll('.btn-food-star').forEach(btn => {
      btn.addEventListener('click', (e) => {
        foodStars = parseInt((e.currentTarget as HTMLElement).dataset.star!, 10);
        render();
      });
    });

    overlay.querySelectorAll('.btn-courier-star').forEach(btn => {
      btn.addEventListener('click', (e) => {
        courierStars = parseInt((e.currentTarget as HTMLElement).dataset.star!, 10);
        render();
      });
    });

    const commentInput = overlay.querySelector('#input-review-comment') as HTMLTextAreaElement;
    if (commentInput) {
      commentInput.addEventListener('input', () => {
        commentVal = commentInput.value;
      });
    }

    overlay.querySelector('#btn-skip-rating')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      if (onDone) onDone();
    });

    overlay.querySelector('#btn-submit-rating')?.addEventListener('click', () => {
      stateService.submitRating(order.id, foodStars, courierStars, commentVal);
      document.body.removeChild(overlay);
      if (onDone) onDone();
    });
  };

  render();
  document.body.appendChild(overlay);
}
