// Clean, production-grade SVG icons inspired by Lucide / Feather Icons

export function icon(name: string, className: string = 'w-4 h-4', strokeWidth: number = 2): string {
  const c = className;
  const s = strokeWidth;

  switch (name) {
    case 'search':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    case 'map-pin':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    case 'user':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    case 'shopping-bag':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;
    case 'shopping-cart':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
    case 'clock':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    case 'star':
      return `<svg class="${c}" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    case 'check':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    case 'check-circle':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    case 'x':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    case 'chevron-right':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    case 'chevron-left':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    case 'chevron-down':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    case 'plus':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    case 'minus':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    case 'trash':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    case 'phone':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    case 'message-square':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    case 'share':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
    case 'credit-card':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
    case 'qr-code':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
    case 'store':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    case 'bike':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l4.5-3 2 4H19"></path></svg>`;
    case 'utensils':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 11v11"></path><path d="M5 2v20"></path><path d="M9 2v4a2 2 0 0 1-2 2 2 2 0 0 1-2-2V2"></path></svg>`;
    case 'chef-hat':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>`;
    case 'tag':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
    case 'refresh':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
    case 'shield':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    case 'flame':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
    case 'coffee':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
    case 'navigation':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
    case 'settings':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
    case 'file-text':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    case 'bar-chart':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`;
    case 'send':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    case 'arrow-right':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    case 'arrow-left':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
    case 'alert':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    case 'home':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    case 'burger':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3z"></path><rect x="4" y="14" width="16" height="2" rx="1"></rect><path d="M5 19h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"></path></svg>`;
    case 'drink':
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10"></path><path d="M12 21a7 7 0 0 0 7-7H5a7 7 0 0 0 7 7z"></path><path d="M5 14l1.5-10h11L19 14"></path></svg>`;
    default:
      return `<svg class="${c}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="${s}"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}
