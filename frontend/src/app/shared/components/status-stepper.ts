import { OrderStatus } from '../../core/models/types';
import { icon } from './icons';

export interface StepInfo {
  key: string;
  iconName: string;
  title: string;
  desc: string;
}

export const ORDER_STEPS: StepInfo[] = [
  { key: 'placed', iconName: 'file-text', title: 'Dipesan', desc: 'Pembayaran terkonfirmasi' },
  { key: 'kitchen', iconName: 'chef-hat', title: 'Dimasak', desc: 'Resto menyiapkan makanan' },
  { key: 'pickup', iconName: 'store', title: 'Diambil', desc: 'Driver mengambil pesanan' },
  { key: 'delivery', iconName: 'bike', title: 'Diantar', desc: 'Perjalanan menuju lokasimu' },
  { key: 'arrived', iconName: 'check-circle', title: 'Selesai', desc: 'Pesanan sampai di tujuan' },
];

export function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'ACCEPTED':
    case 'PREPARING':
      return 1;
    case 'READY_FOR_PICKUP':
    case 'COURIER_ASSIGNED':
    case 'EN_ROUTE_TO_PICKUP':
    case 'ARRIVED_AT_PICKUP':
      return 2;
    case 'PICKED_UP':
    case 'EN_ROUTE_TO_DROP':
      return 3;
    case 'ARRIVED_AT_DROP':
    case 'DELIVERED':
      return 4;
    case 'CANCELLED':
      return -1;
    default:
      return 0;
  }
}

export function renderStatusStepper(status: OrderStatus): string {
  if (status === 'CANCELLED') {
    return `
      <div class="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3">
        <div class="p-2 bg-rose-100 rounded-xl text-rose-600 flex-shrink-0">
          ${icon('x', 'w-5 h-5')}
        </div>
        <div>
          <h4 class="font-bold text-sm">Pesanan Dibatalkan</h4>
          <p class="text-xs text-rose-600">Pesanan ini telah dibatalkan dan pengembalian dana telah diproses.</p>
        </div>
      </div>
    `;
  }

  const currentIdx = getStepIndex(status);

  return `
    <div class="w-full py-3">
      <div class="relative flex items-center justify-between">
        <!-- Connecting Line -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-100 rounded-full z-0">
          <div class="h-full bg-brand-500 rounded-full transition-all duration-700" style="width: ${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%"></div>
        </div>

        ${ORDER_STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          let circleBg = 'bg-slate-50 border-slate-200 text-slate-400';
          if (isDone) circleBg = 'bg-brand-500 border-brand-500 text-white shadow-sm';
          if (isCurrent) circleBg = 'bg-white border-brand-500 text-brand-600 ring-4 ring-brand-50 font-bold';

          return `
            <div class="relative z-10 flex flex-col items-center group">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all ${circleBg}">
                ${isDone ? icon('check', 'w-4 h-4 text-white') : icon(step.iconName, `w-4 h-4 ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`)}
              </div>
              <span class="mt-2 text-[10px] sm:text-xs font-bold text-center ${isCurrent ? 'text-brand-600' : isDone ? 'text-slate-800' : 'text-slate-400'}">
                ${step.title}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
