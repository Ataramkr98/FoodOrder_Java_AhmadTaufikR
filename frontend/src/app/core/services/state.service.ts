import {
  Role,
  ServiceMode,
  PaymentMethodType,
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  PromoCode,
  UserAddress,
  Courier
} from '../models/types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_PROMOS,
  INITIAL_ADDRESSES,
  DEFAULT_COURIER
} from '../data/mock-data';
import { pingBackend, api, restaurantApi, courierApi, adminApi, subscribeTracking } from './api-client';

export interface StateData {
  currentRole: Role;
  serviceMode: ServiceMode;
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  promos: PromoCode[];
  addresses: UserAddress[];
  currentAddress: UserAddress;
  cart: CartItem[];
  appliedPromo: PromoCode | null;
  courierTip: number;
  orders: Order[];
  activeOrderId: string | null;
  courier: Courier;
  autoSimulate: boolean;
  selectedRestaurantId: string | null;
  searchQuery: string;
  selectedCuisine: string;
}

class StateService {
  private state: StateData;
  private listeners: ((state: StateData) => void)[] = [];
  private simulationInterval: any = null;

  constructor() {
    const savedCart = localStorage.getItem('bites_cart');
    const savedOrders = localStorage.getItem('bites_orders');

    this.state = {
      currentRole: 'customer',
      serviceMode: 'delivery',
      restaurants: JSON.parse(JSON.stringify(INITIAL_RESTAURANTS)),
      menuItems: JSON.parse(JSON.stringify(INITIAL_MENU_ITEMS)),
      promos: JSON.parse(JSON.stringify(INITIAL_PROMOS)),
      addresses: JSON.parse(JSON.stringify(INITIAL_ADDRESSES)),
      currentAddress: INITIAL_ADDRESSES[0],
      cart: savedCart ? JSON.parse(savedCart) : [],
      appliedPromo: null,
      courierTip: 0,
      orders: savedOrders ? JSON.parse(savedOrders) : this.createInitialOrders(),
      activeOrderId: null,
      courier: JSON.parse(JSON.stringify(DEFAULT_COURIER)),
      autoSimulate: true,
      selectedRestaurantId: null,
      searchQuery: '',
      selectedCuisine: 'all',
    };

    // If there is an in-flight order, set it as active
    const inFlight = this.state.orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    if (inFlight) {
      this.state.activeOrderId = inFlight.id;
    }

    // Connect to the Quarkus backend if reachable (falls back to local simulation)
    this.initBackend();
  }

  // ============ Backend integration (PRD §16) ============
  private backendOnline = false;
  private wsDisposers: { [orderId: string]: () => void } = {};

  private initBackend(): void {
    pingBackend().then(ok => {
      this.backendOnline = ok;
      if (ok) {
        console.info('[bites] backend online — hydrating from API');
        this.hydrateFromBackend();
      } else {
        console.info('[bites] backend offline — using local simulation');
      }
    });
  }

  isBackendOnline(): boolean {
    return this.backendOnline;
  }

  private async hydrateFromBackend(): Promise<void> {
    try {
      const [restaurants, menuItems, promos, orders] = await Promise.all([
        api.getRestaurants(),
        api.getAllMenuItems(),
        api.getPromos(),
        api.getOrderList(),
      ]);
      this.state.restaurants = restaurants;
      this.state.menuItems = menuItems;
      this.state.promos = promos;
      this.state.orders = orders.map(o => this.mapBackendOrder(o));
      const inFlight = this.state.orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
      if (inFlight) {
        this.state.activeOrderId = inFlight.id;
        this.attachTracking(inFlight.id);
      }
      this.notify();
    } catch (e) {
      console.warn('[bites] hydrate failed, staying on local data', e);
    }
  }

  /** Fire-and-forget server sync for portal actions. */
  private serverSync(orderId: string, action: string, arg?: any): void {
    if (!this.backendOnline) return;
    const call = (p: Promise<unknown>) => p.catch(err => console.warn(`[bites] ${action} failed:`, err.message));
    switch (action) {
      case 'accept': call(restaurantApi.accept(orderId, arg)); break;
      case 'start-prep': call(restaurantApi.startPrep(orderId)); break;
      case 'ready': call(restaurantApi.ready(orderId)); break;
      case 'reject': call(restaurantApi.reject(orderId, arg)); break;
      case 'courier-accept': call(courierApi.accept(orderId)); break;
      case 'courier-status': call(courierApi.updateStatus(orderId, arg)); break;
      case 'courier-deliver': call(courierApi.deliver(orderId, arg)); break;
      case 'courier-location': call(courierApi.location(arg.lat, arg.lng, arg.heading)); break;
      case 'availability': call(restaurantApi.setAvailability(orderId, arg)); break;
      case 'rating': call(api.submitRating(orderId, arg)); break;
    }
  }

  /** Maps a backend Order JSON to the frontend Order shape. */
  private mapBackendOrder(o: any): Order {
    const labels: { [s: string]: string } = {
      PENDING: 'Pesanan Dibuat', AWAITING_RESTAURANT: 'Menunggu Konfirmasi Restoran',
      ACCEPTED: 'Diterima oleh Restoran', PREPARING: 'Sedang Dimasak oleh Dapur',
      READY_FOR_PICKUP: 'Makanan Siap Diambil', COURIER_ASSIGNED: 'Driver Ditugaskan',
      EN_ROUTE_TO_PICKUP: 'Driver Menuju Restoran', ARRIVED_AT_PICKUP: 'Driver Tiba di Restoran',
      PICKED_UP: 'Pesanan Diambil Driver', EN_ROUTE_TO_DROP: 'Menuju Lokasimu',
      ARRIVED_AT_DROP: 'Driver Tiba di Lokasi', DELIVERED: 'Pesanan Selesai',
      CANCELLED: 'Pesanan Dibatalkan', PAYMENT_FAILED: 'Pembayaran Gagal',
    };
    const order: Order = {
      ...o,
      timeline: (o.timeline || []).map((e: any) => ({
        status: e.status,
        label: labels[e.status] || e.status,
        timestamp: e.timestamp,
        description: e.description,
      })),
      routeCoordinates: [],
    };
    if (o.courier && !order.courier) order.courier = { ...this.state.courier, ...o.courier };
    return order;
  }

  /** Subscribes the tracking WS channel and applies server events to the local order. */
  attachTracking(orderId: string): void {
    if (!this.backendOnline || this.wsDisposers[orderId]) return;
    this.wsDisposers[orderId] = subscribeTracking(orderId, evt => this.applyTrackingEvent(evt));
  }

  private applyTrackingEvent(evt: any): void {
    const order = this.state.orders.find(o => o.id === evt.orderId);
    if (evt.type === 'order_status') {
      const target = this.state.orders.find(o => o.id === evt.orderId);
      if (target && target.status !== evt.to) {
        target.status = evt.to;
        target.timeline.push({
          status: evt.to,
          label: (evt.to as string).replace(/_/g, ' '),
          timestamp: evt.at || Date.now(),
          description: 'Update real-time dari server',
        });
        if (evt.to === 'DELIVERED' || evt.to === 'CANCELLED') {
          this.playAudioChime(evt.to === 'DELIVERED' ? 'success' : 'alert');
          this.wsDisposers[evt.orderId]?.();
          delete this.wsDisposers[evt.orderId];
        }
        this.notify();
      }
    } else if (evt.type === 'courier_assigned' && order) {
      order.courier = {
        ...this.state.courier,
        id: evt.courier.id,
        name: evt.courier.name,
        vehicle: evt.courier.vehicle,
        maskedPhone: evt.courier.phoneMasked,
        currentLat: evt.courier.location.lat,
        currentLng: evt.courier.location.lng,
      };
      this.notify();
    } else if (evt.type === 'courier_location' && order?.courier) {
      order.courier.currentLat = evt.lat;
      order.courier.currentLng = evt.lng;
      order.courier.heading = evt.heading;
      this.notify();
    } else if (evt.type === 'eta_update' && order) {
      order.etaMinutesRemaining = Math.max(1, Math.round(evt.etaSeconds / 60));
      this.notify();
    }
  }

  /** Backend order placement: POST /orders (idempotent) + simulated settlement + WS tracking. */
  private async placeOrderOnBackend(shell: Order, paymentMethod: PaymentMethodType): Promise<void> {
    const payloadItems = shell.items.map(ci => ({
      menuItemId: ci.menuItem.id,
      quantity: ci.quantity,
      selectedModifiers: ci.selectedModifiers.map(m => ({
        groupId: m.groupId, groupName: m.groupName, optionId: m.optionId, optionName: m.optionName, price: m.price,
      })),
      specialInstructions: ci.specialInstructions,
    }));
    try {
      const res = await api.placeOrder({
        restaurantId: shell.restaurant.id,
        serviceMode: shell.serviceMode,
        items: payloadItems,
        address: shell.customer.address,
        addressNotes: shell.customer.landmark,
        lat: shell.customer.lat,
        lng: shell.customer.lng,
        paymentMethod,
        promoCode: shell.promoCode,
        tip: shell.tip,
      });
      shell.id = res.id;
      shell.orderNumber = res.orderNumber;
      shell.pin = res.pin;
      shell.grandTotal = res.grandTotal;
      shell.paymentStatus = 'UNPAID';
      shell.status = 'PENDING';
      this.state.activeOrderId = shell.id;
      this.notify();
      // Settle payment through the webhook flow (simulated gateway)
      await api.simulatePayment(shell.id);
      shell.paymentStatus = 'PAID';
      this.attachTracking(shell.id);
      this.notify();
    } catch (e: any) {
      console.error('[bites] backend order placement failed, continuing locally', e);
    }
  }

  private createInitialOrders(): Order[] {
    const sampleRest = INITIAL_RESTAURANTS[0];
    const sampleItem = INITIAL_MENU_ITEMS[0];
    const pastOrder: Order = {
      id: 'ord-past-101',
      orderNumber: 'BTS-9814',
      restaurant: sampleRest,
      customer: {
        name: 'Andini Putri',
        phone: '+62 812-9988-7766',
        address: INITIAL_ADDRESSES[0].address,
        landmark: INITIAL_ADDRESSES[0].notes,
        lat: INITIAL_ADDRESSES[0].lat,
        lng: INITIAL_ADDRESSES[0].lng,
      },
      items: [
        {
          uid: 'cart-init-1',
          menuItem: sampleItem,
          quantity: 2,
          selectedModifiers: [
            { groupId: 'mod-panas1-ayam', groupName: 'Varian Ayam', optionId: 'opt-krispy', optionName: 'Ayam Krispy Original', price: 0 },
            { groupId: 'mod-panas1-pedas', groupName: 'Tingkat Pedas', optionId: 'opt-lvl-3', optionName: 'Level 3 (Pedas Nendang)', price: 0 }
          ],
          unitPrice: 36000,
          totalPrice: 72000,
        }
      ],
      serviceMode: 'delivery',
      status: 'DELIVERED',
      subtotal: 72000,
      deliveryFee: 8000,
      serviceFee: 2000,
      discount: 0,
      tip: 5000,
      grandTotal: 87000,
      paymentMethod: 'qris',
      paymentStatus: 'PAID',
      paymentRef: 'QRIS-MIDTRANS-981472',
      courier: DEFAULT_COURIER,
      pin: '4892',
      prepTimeMinutes: 15,
      timestamps: {
        placedAt: Date.now() - 3600000 * 2,
        acceptedAt: Date.now() - 3600000 * 2 + 45000,
        preparingAt: Date.now() - 3600000 * 2 + 60000,
        readyAt: Date.now() - 3600000 * 2 + 900000,
        pickedUpAt: Date.now() - 3600000 * 2 + 1200000,
        deliveredAt: Date.now() - 3600000 * 2 + 2100000,
      },
      timeline: [
        { status: 'PENDING', label: 'Pesanan Dibuat', timestamp: Date.now() - 7200000 },
        { status: 'ACCEPTED', label: 'Diterima Restoran', timestamp: Date.now() - 7155000 },
        { status: 'PREPARING', label: 'Sedang Dimasak', timestamp: Date.now() - 7140000 },
        { status: 'READY_FOR_PICKUP', label: 'Siap Diambil Driver', timestamp: Date.now() - 6300000 },
        { status: 'PICKED_UP', label: 'Makanan Diambil Driver', timestamp: Date.now() - 6000000 },
        { status: 'DELIVERED', label: 'Pesanan Selesai Diterima', timestamp: Date.now() - 5100000 }
      ],
      rating: {
        foodStars: 5,
        courierStars: 5,
        comment: 'Ayamnya renyah banget, hangat, sambal pedasnya pas. Driver sopan!',
      }
    };
    return [pastOrder];
  }

  // Getters
  getState(): StateData {
    return this.state;
  }

  subscribe(listener: (state: StateData) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    localStorage.setItem('bites_cart', JSON.stringify(this.state.cart));
    localStorage.setItem('bites_orders', JSON.stringify(this.state.orders));
    this.listeners.forEach(l => l(this.state));
  }

  // Audio chimes
  playAudioChime(type: 'ding' | 'success' | 'alert') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // State Mutators
  setRole(role: Role) {
    this.state.currentRole = role;
    this.notify();
  }

  setServiceMode(mode: ServiceMode) {
    this.state.serviceMode = mode;
    this.notify();
  }

  setSearchQuery(q: string) {
    this.state.searchQuery = q;
    this.notify();
  }

  setSelectedCuisine(cuisine: string) {
    this.state.selectedCuisine = cuisine;
    this.notify();
  }

  setSelectedRestaurant(id: string | null) {
    this.state.selectedRestaurantId = id;
    this.notify();
  }

  setAddress(address: UserAddress) {
    this.state.currentAddress = address;
    this.notify();
  }

  toggleAutoSimulate() {
    this.state.autoSimulate = !this.state.autoSimulate;
    this.notify();
  }

  // Cart actions
  addToCart(item: CartItem) {
    // Single-restaurant cart: auto-replace with toast (no native confirm dialog)
    if (this.state.cart.length > 0) {
      const existingRestaurantId = this.state.cart[0].menuItem.restaurantId;
      if (existingRestaurantId !== item.menuItem.restaurantId) {
        this.state.cart = [];
        this.state.appliedPromo = null;
      }
    }

    // Match existing item with identical modifiers
    const existingIndex = this.state.cart.findIndex(c => {
      if (c.menuItem.id !== item.menuItem.id) return false;
      if (c.selectedModifiers.length !== item.selectedModifiers.length) return false;
      const cMods = c.selectedModifiers.map(m => m.optionId).sort().join(',');
      const itemMods = item.selectedModifiers.map(m => m.optionId).sort().join(',');
      return cMods === itemMods;
    });

    if (existingIndex >= 0) {
      this.state.cart[existingIndex].quantity += item.quantity;
      this.state.cart[existingIndex].totalPrice =
        this.state.cart[existingIndex].unitPrice * this.state.cart[existingIndex].quantity;
    } else {
      this.state.cart.push(item);
    }
    this.playAudioChime('ding');
    this.notify();
  }

  updateCartItemQty(uid: string, delta: number) {
    const itemIndex = this.state.cart.findIndex(i => i.uid === uid);
    if (itemIndex === -1) return;

    const item = this.state.cart[itemIndex];
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.state.cart.splice(itemIndex, 1);
    } else {
      item.totalPrice = item.unitPrice * item.quantity;
    }
    this.notify();
  }

  removeFromCart(uid: string) {
    this.state.cart = this.state.cart.filter(i => i.uid !== uid);
    this.notify();
  }

  clearCart() {
    this.state.cart = [];
    this.state.appliedPromo = null;
    this.state.courierTip = 0;
    this.notify();
  }

  applyPromo(codeStr: string): { success: boolean; message: string } {
    const promo = this.state.promos.find(
      p => p.code.toUpperCase() === codeStr.trim().toUpperCase() && p.isActive
    );
    if (!promo) {
      return { success: false, message: 'Kode promo tidak valid atau telah kedaluwarsa' };
    }
    if (promo.validUntil && new Date(promo.validUntil).getTime() < Date.now()) {
      return { success: false, message: 'Kode promo telah kedaluwarsa' };
    }
    const subtotal = this.getCartSubtotal();
    if (subtotal < promo.minSpend) {
      return {
        success: false,
        message: `Minimal pembelanjaan untuk kode ini adalah ${this.formatCurrency(promo.minSpend)}`
      };
    }
    this.state.appliedPromo = promo;
    this.notify();
    return { success: true, message: `Berhasil menggunakan promo: ${promo.title}` };
  }

  removePromo() {
    this.state.appliedPromo = null;
    this.notify();
  }

  setCourierTip(tip: number) {
    this.state.courierTip = tip;
    this.notify();
  }

  // Calculations
  getCartSubtotal(): number {
    return this.state.cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  getDeliveryFee(): number {
    if (this.state.serviceMode !== 'delivery') return 0;
    if (this.state.cart.length === 0) return 0;
    const rest = this.state.restaurants.find(r => r.id === this.state.cart[0].menuItem.restaurantId);
    return rest ? rest.deliveryFee : 8000;
  }

  getServiceFee(): number {
    return this.state.cart.length > 0 ? 2000 : 0;
  }

  getDiscountAmount(): number {
    if (!this.state.appliedPromo) return 0;
    const subtotal = this.getCartSubtotal();
    const deliveryFee = this.getDeliveryFee();
    const promo = this.state.appliedPromo;

    if (promo.discountType === 'percentage') {
      const disc = Math.round((subtotal * promo.discountValue) / 100);
      return promo.maxDiscount ? Math.min(disc, promo.maxDiscount) : disc;
    } else if (promo.discountType === 'free_delivery') {
      return Math.min(deliveryFee, promo.discountValue);
    } else if (promo.discountType === 'flat') {
      return Math.min(subtotal, promo.discountValue);
    }
    return 0;
  }

  getGrandTotal(): number {
    const subtotal = this.getCartSubtotal();
    const delivery = this.getDeliveryFee();
    const service = this.getServiceFee();
    const discount = this.getDiscountAmount();
    const tip = this.state.courierTip;
    return Math.max(0, subtotal + delivery + service - discount + tip);
  }

  // Order Lifecycle
  placeOrder(paymentMethod: PaymentMethodType): Order {
    if (this.state.cart.length === 0) throw new Error('Cart is empty');

    const rest = this.state.restaurants.find(r => r.id === this.state.cart[0].menuItem.restaurantId)!;
    const subtotal = this.getCartSubtotal();
    const deliveryFee = this.getDeliveryFee();
    const serviceFee = this.getServiceFee();
    const discount = this.getDiscountAmount();
    const tip = this.state.courierTip;
    const grandTotal = this.getGrandTotal();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Generate Route polyline from Restaurant to Customer
    const routeCoords = this.generateRoutePath(
      [rest.lat, rest.lng],
      [this.state.currentAddress.lat, this.state.currentAddress.lng]
    );

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: 'BTS-' + Math.floor(1000 + Math.random() * 9000),
      restaurant: rest,
      customer: {
        name: 'Andini Putri',
        phone: '+62 812-9988-7766',
        address: this.state.currentAddress.address,
        landmark: this.state.currentAddress.notes,
        lat: this.state.currentAddress.lat,
        lng: this.state.currentAddress.lng,
      },
      items: [...this.state.cart],
      serviceMode: this.state.serviceMode,
      status: 'PENDING',
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      promoCode: this.state.appliedPromo?.code,
      tip,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      paymentRef: 'MIDTRANS-' + Date.now().toString(36).toUpperCase(),
      courier: {
        ...this.state.courier,
        currentLat: rest.lat,
        currentLng: rest.lng,
      },
      pin,
      prepTimeMinutes: 15,
      timestamps: {
        placedAt: Date.now(),
      },
      timeline: [
        {
          status: 'PENDING',
          label: 'Pesanan Dibuat & Pembayaran Dikonfirmasi',
          timestamp: Date.now(),
          description: `Metode pembayaran: ${paymentMethod.toUpperCase()}`,
        }
      ],
      etaMinutesRemaining: rest.etaMinutes,
      routeCoordinates: routeCoords,
    };

    this.state.orders.unshift(newOrder);
    this.state.activeOrderId = newOrder.id;
    this.clearCart();
    this.playAudioChime('success');
    this.notify();

    if (this.backendOnline) {
      // Real flow: POST /orders → simulated settlement → WS tracking.
      // The server state machine + dispatch drive the lifecycle; the local
      // auto-simulation stays OFF for this order.
      this.placeOrderOnBackend(newOrder, paymentMethod);
      return newOrder;
    }

    if (this.state.autoSimulate) {
      this.runAutoSimulation(newOrder.id);
    }

    return newOrder;
  }

  private generateRoutePath(start: [number, number], end: [number, number]): [number, number][] {
    const points: [number, number][] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const factor = i / steps;
      // Add slight organic curves
      const jitterLat = Math.sin(factor * Math.PI) * 0.0025;
      const jitterLng = Math.cos(factor * Math.PI) * 0.0018;
      const lat = start[0] + (end[0] - start[0]) * factor + jitterLat;
      const lng = start[1] + (end[1] - start[1]) * factor + jitterLng;
      points.push([lat, lng]);
    }
    return points;
  }

  // Restaurant Portal Actions
  acceptOrder(orderId: string, prepTime: number = 15) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'accept', prepTime);
    order.status = 'ACCEPTED';
    order.prepTimeMinutes = prepTime;
    order.timestamps.acceptedAt = Date.now();
    order.timeline.push({
      status: 'ACCEPTED',
      label: 'Diterima oleh Restoran',
      timestamp: Date.now(),
      description: `Estimasi waktu memasak ${prepTime} menit`,
    });
    this.playAudioChime('ding');
    this.notify();
  }

  startPreparingOrder(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'start-prep');
    order.status = 'PREPARING';
    order.timestamps.preparingAt = Date.now();
    order.timeline.push({
      status: 'PREPARING',
      label: 'Sedang Dimasak oleh Dapur',
      timestamp: Date.now(),
    });
    this.notify();
  }

  markOrderReady(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'ready');
    order.status = 'READY_FOR_PICKUP';
    order.timestamps.readyAt = Date.now();
    order.timeline.push({
      status: 'READY_FOR_PICKUP',
      label: 'Makanan Selesai Dimasak & Siap Diambil',
      timestamp: Date.now(),
    });
    this.playAudioChime('ding');
    this.notify();
  }

  rejectOrder(orderId: string, reason: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'reject', reason);
    order.status = 'CANCELLED';
    order.cancelReason = reason;
    order.timestamps.cancelledAt = Date.now();
    order.paymentStatus = 'REFUNDED';
    order.timeline.push({
      status: 'CANCELLED',
      label: 'Pesanan Ditolak oleh Restoran',
      timestamp: Date.now(),
      description: `Alasan: ${reason}. Dana telah dikembalikan ke metode pembayaran.`,
    });
    this.playAudioChime('alert');
    this.notify();
  }

  toggleItemAvailability(itemId: string) {
    const item = this.state.menuItems.find(i => i.id === itemId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      this.serverSync(itemId, 'availability', item.isAvailable);
      this.notify();
    }
  }

  updateItemPrice(itemId: string, newPrice: number) {
    const item = this.state.menuItems.find(i => i.id === itemId);
    if (item && newPrice > 0) {
      item.price = newPrice;
      this.notify();
    }
  }

  toggleStoreStatus(restaurantId: string) {
    const rest = this.state.restaurants.find(r => r.id === restaurantId);
    if (rest) {
      rest.isOpen = !rest.isOpen;
      this.notify();
    }
  }

  // Courier Actions
  toggleCourierOnline() {
    this.state.courier.isOnline = !this.state.courier.isOnline;
    this.notify();
  }

  assignCourierToOrder(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'courier-accept');
    order.status = 'COURIER_ASSIGNED';
    order.timestamps.courierAssignedAt = Date.now();
    order.courier = { ...this.state.courier };
    order.timeline.push({
      status: 'COURIER_ASSIGNED',
      label: `Driver ${this.state.courier.name} Ditugaskan`,
      timestamp: Date.now(),
      description: `Kendaraan: ${this.state.courier.vehicle} (${this.state.courier.plateNumber})`,
    });
    this.notify();
  }

  courierEnRoutePickup(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'courier-status', 'EN_ROUTE_TO_PICKUP');
    order.status = 'EN_ROUTE_TO_PICKUP';
    order.timeline.push({
      status: 'EN_ROUTE_TO_PICKUP',
      label: 'Driver Menuju Restoran',
      timestamp: Date.now(),
    });
    this.notify();
  }

  courierArrivedPickup(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'courier-status', 'ARRIVED_AT_PICKUP');
    order.status = 'ARRIVED_AT_PICKUP';
    order.timeline.push({
      status: 'ARRIVED_AT_PICKUP',
      label: 'Driver Tiba di Restoran',
      timestamp: Date.now(),
    });
    this.playAudioChime('ding');
    this.notify();
  }

  courierPickedUp(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'courier-status', 'PICKED_UP');
    order.status = 'PICKED_UP';
    order.timestamps.pickedUpAt = Date.now();
    order.timeline.push({
      status: 'PICKED_UP',
      label: 'Driver Mengambil Pesanan dari Restoran',
      timestamp: Date.now(),
      description: 'Makanan telah diserahkan dan driver memulai perjalanan ke tujuanmu',
    });
    this.notify();

    // Start live GPS movement along route
    this.startLiveGpsMovement(orderId);
  }

  courierArrivedDrop(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.serverSync(orderId, 'courier-status', 'ARRIVED_AT_DROP');
    order.status = 'ARRIVED_AT_DROP';
    order.timeline.push({
      status: 'ARRIVED_AT_DROP',
      label: 'Driver Tiba di Alamat Pengantaran!',
      timestamp: Date.now(),
      description: `Siapkan PIN 4-digit (${order.pin}) untuk diserahkan ke driver`,
    });
    this.playAudioChime('alert');
    this.notify();
  }

  verifyPinAndDeliver(orderId: string, inputPin: string): boolean {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.pin !== inputPin.trim()) return false;

    this.serverSync(orderId, 'courier-deliver', inputPin.trim());

    order.status = 'DELIVERED';
    order.timestamps.deliveredAt = Date.now();
    order.timeline.push({
      status: 'DELIVERED',
      label: 'Pesanan Berhasil Diserahkan & Selesai',
      timestamp: Date.now(),
      description: 'Selamat menikmati hidangan lezatmu!',
    });
    this.playAudioChime('success');
    this.notify();
    return true;
  }

  submitRating(orderId: string, foodStars: number, courierStars: number, comment?: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.rating = { foodStars, courierStars, comment };
      this.serverSync(orderId, 'rating', { foodStars, courierStars, comment });
      this.playAudioChime('success');
      this.notify();
    }
  }

  // Admin Actions
  cancelOrderAdmin(orderId: string, reason: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = 'CANCELLED';
    order.cancelReason = reason;
    order.paymentStatus = 'REFUNDED';
    order.timestamps.cancelledAt = Date.now();
    order.timeline.push({
      status: 'CANCELLED',
      label: 'Dibatalkan oleh Admin Pusat',
      timestamp: Date.now(),
      description: `Alasan: ${reason}. Pengembalian dana penuh telah diproses.`,
    });
    this.notify();
  }

  refundOrderAdmin(orderId: string, amount: number, reason: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.paymentStatus = 'REFUNDED';
    order.timeline.push({
      status: order.status,
      label: `Pengembalian Dana Manual Rp ${amount.toLocaleString('id-ID')}`,
      timestamp: Date.now(),
      description: `Alasan refund: ${reason}`,
    });
    this.notify();
  }

  redispatchOrderAdmin(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = 'COURIER_ASSIGNED';
    order.timeline.push({
      status: 'COURIER_ASSIGNED',
      label: 'Penugasan Ulang Driver oleh Admin (Re-dispatch)',
      timestamp: Date.now(),
    });
    this.notify();
  }

  addPromo(promo: PromoCode) {
    this.state.promos.push(promo);
    this.notify();
  }

  togglePromo(code: string) {
    const p = this.state.promos.find(x => x.code === code);
    if (p) {
      p.isActive = !p.isActive;
      if (this.backendOnline) {
        adminApi.togglePromo(code, p.isActive).catch(err => console.warn('[bites] promo toggle failed:', err));
      }
      this.notify();
    }
  }

  // Live GPS Simulation
  private startLiveGpsMovement(orderId: string) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || !order.routeCoordinates || order.routeCoordinates.length === 0) return;

    let currentIndex = 0;
    const totalSteps = order.routeCoordinates.length;

    if (this.simulationInterval) clearInterval(this.simulationInterval);

    this.simulationInterval = setInterval(() => {
      const currentOrder = this.state.orders.find(o => o.id === orderId);
      if (!currentOrder || currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED') {
        clearInterval(this.simulationInterval);
        return;
      }

      if (currentIndex < totalSteps) {
        const coord = currentOrder.routeCoordinates![currentIndex];
        if (currentOrder.courier) {
          currentOrder.courier.currentLat = coord[0];
          currentOrder.courier.currentLng = coord[1];
          // Calculate heading
          if (currentIndex < totalSteps - 1) {
            const nextCoord = currentOrder.routeCoordinates![currentIndex + 1];
            const dy = nextCoord[0] - coord[0];
            const dx = nextCoord[1] - coord[1];
            currentOrder.courier.heading = (Math.atan2(dx, dy) * 180) / Math.PI;
          }
        }
        // Update ETA remaining
        const progress = currentIndex / totalSteps;
        currentOrder.etaMinutesRemaining = Math.max(1, Math.round((1 - progress) * 12));
        currentIndex++;
        this.notify();
      } else {
        clearInterval(this.simulationInterval);
        this.courierArrivedDrop(orderId);
      }
    }, 1800);
  }

  // Automated Simulation Engine across 4 roles
  private runAutoSimulation(orderId: string) {
    setTimeout(() => {
      const order = this.state.orders.find(o => o.id === orderId);
      if (order && order.status === 'PENDING') {
        this.acceptOrder(orderId, 12);

        setTimeout(() => {
          this.startPreparingOrder(orderId);

          setTimeout(() => {
            this.markOrderReady(orderId);
            this.assignCourierToOrder(orderId);

            setTimeout(() => {
              this.courierEnRoutePickup(orderId);

              setTimeout(() => {
                this.courierArrivedPickup(orderId);

                setTimeout(() => {
                  this.courierPickedUp(orderId);
                }, 4000);
              }, 4000);
            }, 3000);
          }, 5000);
        }, 3000);
      }
    }, 2500);
  }

  // Utilities
  formatCurrency(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  resetAllData() {
    localStorage.removeItem('bites_cart');
    localStorage.removeItem('bites_orders');
    this.state.cart = [];
    this.state.appliedPromo = null;
    this.state.courierTip = 0;
    this.state.restaurants = JSON.parse(JSON.stringify(INITIAL_RESTAURANTS));
    this.state.menuItems = JSON.parse(JSON.stringify(INITIAL_MENU_ITEMS));
    this.state.orders = this.createInitialOrders();
    this.state.activeOrderId = this.state.orders[0]?.id || null;
    this.notify();
  }
}

export const stateService = new StateService();
