import './style.css';
import { stateService, StateData } from './app/core/services/state.service';
import { renderHeader } from './app/shared/components/header';
import { renderFooter } from './app/shared/components/footer';
import { renderHomeView } from './app/features/customer/home-view';
import { renderRestaurantView } from './app/features/customer/restaurant-view';
import { renderTrackingView } from './app/features/customer/tracking-view';
import { renderOrdersView } from './app/features/customer/orders-view';
import { renderProfileView } from './app/features/customer/profile-view';
import { renderRestaurantPortal } from './app/features/restaurant/restaurant-portal';
import { renderCourierPortal } from './app/features/courier/courier-portal';
import { renderAdminPortal } from './app/features/admin/admin-portal';
import { openCartDrawer } from './app/shared/components/cart-drawer';
import { openCheckoutModal } from './app/shared/components/checkout-modal';
import { renderNotFound, renderErrorView } from './app/features/system/system-views';
import { renderAuthView, isDemoLoggedIn } from './app/features/auth/auth-view';
import { toast } from './app/shared/components/toast';
import { icon } from './app/shared/components/icons';

type CustomerView = 'home' | 'restaurant' | 'tracking' | 'orders' | 'profile' | 'auth' | 'notfound';

class App {
  private appContainer: HTMLElement;
  private headerContainer: HTMLElement;
  private viewContainer: HTMLElement;
  private footerContainer: HTMLElement;
  private mobileNavContainer: HTMLElement;

  private activeCustomerView: CustomerView = 'home';
  private selectedRestaurantId: string | null = null;
  private activeTrackingOrderId: string | null = null;

  private currentViewUnsubscribe: (() => void) | null = null;

  constructor() {
    this.appContainer = document.getElementById('app')!;
    this.appContainer.innerHTML = `
      <div id="header-root"></div>
      <main id="view-root" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12"></main>
      <div id="footer-root"></div>
      <div id="mobile-nav-root"></div>
    `;

    this.headerContainer = document.getElementById('header-root')!;
    this.viewContainer = document.getElementById('view-root')!;
    this.footerContainer = document.getElementById('footer-root')!;
    this.mobileNavContainer = document.getElementById('mobile-nav-root')!;

    this.init();
  }

  private init() {
    // Deep-link support for QA/showcase: ?view=notfound or #/404 renders the 404 page.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'notfound' || window.location.hash === '#/404') {
        this.activeCustomerView = 'notfound';
      }
    } catch { /* ignore URL parse errors */ }
    // Render persistent header
    renderHeader(
      this.headerContainer,
      () => this.handleOpenCart(),
      () => this.navigateToCustomerView('orders'),
      () => this.navigateToCustomerView('profile'),
      () => this.navigateToCustomerView('home')
    );

    // Render persistent footer
    renderFooter(this.footerContainer, (cat) => {
      stateService.setSelectedCuisine(cat);
      this.navigateToCustomerView('home');
    });

    // Subscribe to state changes for role switching
    stateService.subscribe((state) => {
      this.renderCurrentView(state);
      this.renderMobileNav(state);
      this.toggleFooterVisibility(state);
    });
  }

  private toggleFooterVisibility(state: StateData) {
    // Show full footer on customer portal, hide or show minimal on other consoles
    if (state.currentRole === 'customer') {
      this.footerContainer.style.display = 'block';
    } else {
      this.footerContainer.style.display = 'none';
    }
  }

  private handleOpenCart() {
    openCartDrawer(() => {
      openCheckoutModal((orderId) => {
        this.activeTrackingOrderId = orderId;
        this.navigateToCustomerView('tracking');
      });
    });
  }

  private navigateToCustomerView(view: CustomerView, param?: string) {
    if (this.currentViewUnsubscribe) {
      this.currentViewUnsubscribe();
      this.currentViewUnsubscribe = null;
    }

    this.activeCustomerView = view;
    if (view === 'restaurant' && param) {
      this.selectedRestaurantId = param;
    } else if (view === 'tracking' && param) {
      this.activeTrackingOrderId = param;
    }

    this.renderCurrentView(stateService.getState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private renderCurrentView(state: StateData) {
    if (this.currentViewUnsubscribe) {
      this.currentViewUnsubscribe();
      this.currentViewUnsubscribe = null;
    }

    this.viewContainer.innerHTML = '';

    try {
    if (state.currentRole === 'restaurant') {
      this.currentViewUnsubscribe = renderRestaurantPortal(this.viewContainer);
    } else if (state.currentRole === 'courier') {
      this.currentViewUnsubscribe = renderCourierPortal(this.viewContainer);
    } else if (state.currentRole === 'admin') {
      this.currentViewUnsubscribe = renderAdminPortal(this.viewContainer);
    } else {
      // Customer Views
      const needsAuth = this.activeCustomerView === 'orders' || this.activeCustomerView === 'profile' || this.activeCustomerView === 'tracking';
      if (needsAuth && !isDemoLoggedIn()) {
        this.currentViewUnsubscribe = renderAuthView(this.viewContainer, () => this.navigateToCustomerView('home'));
        return;
      }
      switch (this.activeCustomerView) {
        case 'auth':
          this.currentViewUnsubscribe = renderAuthView(this.viewContainer, () => this.navigateToCustomerView('home'));
          break;
        case 'notfound':
          this.currentViewUnsubscribe = renderNotFound(this.viewContainer, () => this.navigateToCustomerView('home'));
          break;
        case 'home':
          this.currentViewUnsubscribe = renderHomeView(this.viewContainer, (restId) => {
            this.navigateToCustomerView('restaurant', restId);
          });
          break;

        case 'restaurant':
          this.currentViewUnsubscribe = renderRestaurantView(
            this.viewContainer,
            this.selectedRestaurantId || state.restaurants[0].id,
            () => this.navigateToCustomerView('home')
          );
          break;

        case 'tracking':
          const orderIdToTrack =
            this.activeTrackingOrderId ||
            state.activeOrderId ||
            state.orders[0]?.id;
          this.currentViewUnsubscribe = renderTrackingView(
            this.viewContainer,
            orderIdToTrack,
            () => this.navigateToCustomerView('orders')
          );
          break;

        case 'orders':
          this.currentViewUnsubscribe = renderOrdersView(
            this.viewContainer,
            (orderId) => this.navigateToCustomerView('tracking', orderId),
            () => this.navigateToCustomerView('home')
          );
          break;

        case 'profile':
          this.currentViewUnsubscribe = renderProfileView(
            this.viewContainer,
            () => this.navigateToCustomerView('home')
          );
          break;
        default:
          this.currentViewUnsubscribe = renderNotFound(this.viewContainer, () => this.navigateToCustomerView('home'));
          break;
      }
    }
    } catch (err: any) {
      console.error('[bites] view render failed', err);
      toast('Gagal memuat halaman, coba lagi', 'error');
      this.currentViewUnsubscribe = renderErrorView(this.viewContainer, err?.message || 'Gagal memuat halaman.', () => this.renderCurrentView(stateService.getState()));
    }
  }

  private renderMobileNav(state: StateData) {
    if (state.currentRole !== 'customer') {
      this.mobileNavContainer.innerHTML = '';
      return;
    }

    const totalCartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

    this.mobileNavContainer.innerHTML = `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-around shadow-lg">
        <button class="nav-mobile-btn flex flex-col items-center space-y-1 text-[11px] font-semibold ${this.activeCustomerView === 'home' ? 'text-brand-600 font-bold' : 'text-slate-500'}" data-view="home">
          ${icon('home', `w-5 h-5 ${this.activeCustomerView === 'home' ? 'text-brand-600' : 'text-slate-500'}`)}
          <span>Beranda</span>
        </button>

        <button class="nav-mobile-btn flex flex-col items-center space-y-1 text-[11px] font-semibold ${this.activeCustomerView === 'orders' ? 'text-brand-600 font-bold' : 'text-slate-500'}" data-view="orders">
          ${icon('file-text', `w-5 h-5 ${this.activeCustomerView === 'orders' ? 'text-brand-600' : 'text-slate-500'}`)}
          <span>Pesanan</span>
        </button>

        <button id="btn-mobile-cart" class="flex flex-col items-center space-y-1 text-[11px] font-semibold text-slate-500 relative">
          <div class="relative">
            ${icon('shopping-bag', 'w-5 h-5 text-slate-500')}
            ${totalCartCount > 0 ? `
              <span class="absolute -top-1.5 -right-2 bg-brand-500 text-white font-extrabold px-1 rounded-full text-[9px] shadow-sm">
                ${totalCartCount}
              </span>
            ` : ''}
          </div>
          <span>Keranjang</span>
        </button>

        <button class="nav-mobile-btn flex flex-col items-center space-y-1 text-[11px] font-semibold ${this.activeCustomerView === 'profile' ? 'text-brand-600 font-bold' : 'text-slate-500'}" data-view="profile">
          ${icon('user', `w-5 h-5 ${this.activeCustomerView === 'profile' ? 'text-brand-600' : 'text-slate-500'}`)}
          <span>Profil</span>
        </button>
      </nav>
    `;

    this.mobileNavContainer.querySelectorAll('.nav-mobile-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = (e.currentTarget as HTMLElement).dataset.view as CustomerView;
        this.navigateToCustomerView(view);
      });
    });

    this.mobileNavContainer.querySelector('#btn-mobile-cart')?.addEventListener('click', () => {
      this.handleOpenCart();
    });
  }
}

// Initialize Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
