export type ServiceMode = 'delivery' | 'pickup' | 'dine_in' | 'drive_thru';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COURIER_ASSIGNED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKED_UP'
  | 'EN_ROUTE_TO_DROP'
  | 'ARRIVED_AT_DROP'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethodType =
  | 'qris'
  | 'va_bca'
  | 'va_mandiri'
  | 'va_bri'
  | 'va_bni'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'card';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isSpicy?: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  banner: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  distanceKm: number;
  etaMinutes: number;
  deliveryFee: number;
  minOrder: number;
  address: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  isBusy?: boolean;
  openingHours: string;
  categories: string[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  uid: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  maskedPhone: string;
  vehicle: string;
  plateNumber: string;
  photo: string;
  rating: number;
  tripsCompleted: number;
  currentLat: number;
  currentLng: number;
  heading: number;
  isOnline: boolean;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: number;
  description?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurant: Restaurant;
  customer: {
    name: string;
    phone: string;
    address: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  items: CartItem[];
  serviceMode: ServiceMode;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  promoCode?: string;
  tip: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  courier?: Courier;
  pin: string;
  prepTimeMinutes: number;
  timestamps: {
    placedAt: number;
    acceptedAt?: number;
    preparingAt?: number;
    readyAt?: number;
    courierAssignedAt?: number;
    pickedUpAt?: number;
    deliveredAt?: number;
    cancelledAt?: number;
  };
  timeline: OrderTimelineEvent[];
  cancelReason?: string;
  etaMinutesRemaining?: number;
  routeCoordinates?: [number, number][];
  rating?: {
    foodStars: number;
    courierStars: number;
    comment?: string;
  };
}

export interface PromoCode {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat' | 'free_delivery';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface UserAddress {
  id: string;
  label: string; // 'Home' | 'Office' | 'Apartment' | etc.
  address: string;
  notes: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export type Role = 'customer' | 'restaurant' | 'courier' | 'admin';
