import { Courier } from '../../core/models/types';
import { icon } from './icons';

export function openDriverChatModal(courier: Courier) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in';

  const messages: { sender: 'me' | 'driver'; text: string; time: string }[] = [
    { sender: 'driver', text: `Halo kak, saya ${courier.name} yang mengantar pesananmu. Sedang dalam perjalanan ya!`, time: 'Baru saja' },
  ];

  let inputVal = '';

  const render = () => {
    overlay.innerHTML = `
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[90vh] animate-slide-up">
        
        <!-- Header -->
        <div class="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center font-bold">
              ${icon('bike', 'w-5 h-5 text-brand-400')}
            </div>
            <div>
              <h3 class="font-bold text-sm text-white">${courier.name}</h3>
              <span class="text-[11px] text-slate-400 font-normal">${courier.vehicle} • ${courier.plateNumber}</span>
            </div>
          </div>
          <button id="btn-close-chat" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Chat History -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
          ${messages.map(m => `
            <div class="flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}">
              <div class="max-w-[80%] p-3 rounded-2xl ${m.sender === 'me' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}">
                <p class="leading-relaxed font-normal">${m.text}</p>
              </div>
              <span class="text-[9px] text-slate-400 mt-1 px-1 font-mono">${m.time}</span>
            </div>
          `).join('')}
        </div>

        <!-- Quick Replies -->
        <div class="px-3 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          ${['Titip di lobby reception ya', 'Pintu pagar tidak dikunci', 'Terima kasih mas!'].map(quick => `
            <button class="btn-quick-reply text-[11px] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors text-slate-700" data-text="${quick}">
              ${quick}
            </button>
          `).join('')}
        </div>

        <!-- Chat Input -->
        <div class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            id="input-chat-msg"
            placeholder="Tulis pesan untuk driver..."
            value="${inputVal}"
            class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
          />
          <button id="btn-send-chat" class="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            ${icon('send', 'w-4 h-4')}
          </button>
        </div>

      </div>
    `;

    overlay.querySelector('#btn-close-chat')?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    const input = overlay.querySelector('#input-chat-msg') as HTMLInputElement;
    if (input) {
      input.addEventListener('input', () => {
        inputVal = input.value;
      });
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMsg();
      });
    }

    const sendMsg = (customText?: string) => {
      const text = customText || inputVal.trim();
      if (!text) return;
      messages.push({ sender: 'me', text, time: 'Baru saja' });
      inputVal = '';
      render();

      setTimeout(() => {
        messages.push({ sender: 'driver', text: 'Siap kak, terima kasih informasinya!', time: 'Baru saja' });
        render();
      }, 1200);
    };

    overlay.querySelector('#btn-send-chat')?.addEventListener('click', () => sendMsg());

    overlay.querySelectorAll('.btn-quick-reply').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).dataset.text!;
        sendMsg(text);
      });
    });
  };

  render();
  document.body.appendChild(overlay);
}
