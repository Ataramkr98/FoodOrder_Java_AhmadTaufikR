export type Language = 'id' | 'en';

const TRANSLATIONS = {
  id: {
    app_tagline: 'Dari Ngidam Sampai Depan Pintu — Pantau Langsung di Peta',
    nav_home: 'Beranda',
    nav_orders: 'Pesanan Saya',
    nav_profile: 'Profil',
    nav_cart: 'Keranjang',
    mode_delivery: 'Pesan Antar',
    mode_pickup: 'Ambil Sendiri',
    mode_dine_in: 'Makan di Tempat',
    mode_drive_thru: 'Drive-Thru',
    search_placeholder: 'Cari ayam krispy, burger, kopi susu, atau restoran...',
    filter_all: 'Semua',
    filter_ayam: 'Ayam & Nasi',
    filter_burger: 'Burger & Western',
    filter_coffee: 'Kopi & Teh',
    filter_drinks: 'Minuman Segar',
    filter_combos: 'Paket Hemat',
    sort_popular: 'Terpopuler',
    sort_rating: 'Rating Tertinggi',
    sort_distance: 'Terdekat',
    sort_speed: 'Paling Cepat',
    promo_badge: 'PROMO',
    add_to_cart: 'Tambah',
    customization_title: 'Kustomisasi Pesanan',
    required_select: 'Wajib pilih',
    optional_select: 'Opsional',
    special_notes_placeholder: 'Catatan tambahan untuk restoran (cth: jangan terlalu manis, saus dipisah)...',
    cart_empty: 'Keranjang belanja Anda masih kosong',
    cart_empty_sub: 'Yuk cari makanan dan minuman favorit Anda di Bites!',
    checkout_title: 'Konfirmasi Pesanan',
    delivery_address: 'Alamat Pengantaran',
    payment_method: 'Metode Pembayaran',
    promo_code: 'Kode Promo / Voucher',
    apply_promo: 'Pakai',
    promo_applied: 'Voucher berhasil digunakan',
    subtotal: 'Subtotal Makanan',
    delivery_fee: 'Biaya Pengiriman',
    service_fee: 'Biaya Layanan Aplikasi',
    discount: 'Potongan Diskon',
    courier_tip: 'Tip untuk Driver',
    grand_total: 'Total Pembayaran',
    pay_now: 'Bayar Sekarang',
    order_placed_success: 'Pesanan Berhasil Dibuat!',
    tracking_live_title: 'Pelacakan Pesanan Langsung',
    eta_text: 'Estimasi Tiba',
    eta_minutes: 'menit',
    courier_info: 'Informasi Driver',
    call_courier: 'Hubungi Driver',
    chat_courier: 'Chat In-App',
    delivery_pin: 'PIN Bukti Pengantaran',
    pin_instruction: 'Berikan 4 angka PIN ini kepada driver saat makanan tiba di tempat:',
    share_link: 'Bagikan Link Pelacakan',
    rating_title: 'Bagaimana Pengalaman Makanmu?',
    rate_food: 'Beri nilai rasa makanan',
    rate_courier: 'Beri nilai pelayanan driver',
    submit_review: 'Kirim Penilaian & Review',
    status_pending: 'Menunggu Konfirmasi',
    status_accepted: 'Diterima Restoran',
    status_preparing: 'Sedang Dimasak',
    status_ready: 'Siap Diambil Driver',
    status_assigned: 'Driver Ditugaskan',
    status_en_route_pickup: 'Driver Menuju Restoran',
    status_arrived_pickup: 'Driver Tiba di Restoran',
    status_picked_up: 'Makanan Diambil Driver',
    status_en_route_drop: 'Driver Menuju Alamatmu',
    status_arrived_drop: 'Driver Tiba di Depan Pintu',
    status_delivered: 'Pesanan Telah Tiba & Selesai',
    status_cancelled: 'Pesanan Dibatalkan',
  },
  en: {
    app_tagline: 'From craving to doorstep — see every step on the map',
    nav_home: 'Home',
    nav_orders: 'My Orders',
    nav_profile: 'Profile',
    nav_cart: 'Cart',
    mode_delivery: 'Delivery',
    mode_pickup: 'Pickup',
    mode_dine_in: 'Dine-In',
    mode_drive_thru: 'Drive-Thru',
    search_placeholder: 'Search crispy chicken, burgers, artisan lattes, restaurants...',
    filter_all: 'All',
    filter_ayam: 'Chicken & Rice',
    filter_burger: 'Burgers & Western',
    filter_coffee: 'Coffee & Tea',
    filter_drinks: 'Cold Drinks',
    filter_combos: 'Combos & Value',
    sort_popular: 'Most Popular',
    sort_rating: 'Top Rated',
    sort_distance: 'Nearest',
    sort_speed: 'Fastest ETA',
    promo_badge: 'PROMO',
    add_to_cart: 'Add',
    customization_title: 'Customize Your Order',
    required_select: 'Required',
    optional_select: 'Optional',
    special_notes_placeholder: 'Special instructions for kitchen (e.g. less sweet, sauce on side)...',
    cart_empty: 'Your shopping cart is empty',
    cart_empty_sub: 'Discover delicious food & drinks around you on Bites!',
    checkout_title: 'Order Checkout',
    delivery_address: 'Delivery Address',
    payment_method: 'Payment Method',
    promo_code: 'Promo / Voucher Code',
    apply_promo: 'Apply',
    promo_applied: 'Voucher applied successfully',
    subtotal: 'Items Subtotal',
    delivery_fee: 'Delivery Fee',
    service_fee: 'Platform Service Fee',
    discount: 'Discount Savings',
    courier_tip: 'Courier Tip',
    grand_total: 'Total Amount',
    pay_now: 'Place Order & Pay',
    order_placed_success: 'Order Placed Successfully!',
    tracking_live_title: 'Live Order Tracking',
    eta_text: 'Estimated Arrival',
    eta_minutes: 'mins',
    courier_info: 'Courier Details',
    call_courier: 'Call Driver',
    chat_courier: 'In-App Chat',
    delivery_pin: 'Proof of Delivery PIN',
    pin_instruction: 'Provide this 4-digit PIN to your driver upon arrival at your doorstep:',
    share_link: 'Share Live Tracking',
    rating_title: 'How was your dining experience?',
    rate_food: 'Rate the food taste',
    rate_courier: 'Rate the driver service',
    submit_review: 'Submit Review & Rating',
    status_pending: 'Awaiting Confirmation',
    status_accepted: 'Accepted by Restaurant',
    status_preparing: 'Preparing in Kitchen',
    status_ready: 'Ready for Pickup',
    status_assigned: 'Courier Assigned',
    status_en_route_pickup: 'Courier Heading to Kitchen',
    status_arrived_pickup: 'Courier Arrived at Store',
    status_picked_up: 'Order Picked Up',
    status_en_route_drop: 'Courier On The Way to You',
    status_arrived_drop: 'Courier Arrived at Doorstep',
    status_delivered: 'Delivered & Complete',
    status_cancelled: 'Order Cancelled',
  }
};

class I18nService {
  private currentLang: Language = (localStorage.getItem('bites_lang') as Language) || 'id';
  private listeners: ((lang: Language) => void)[] = [];

  get lang(): Language {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    this.currentLang = lang;
    localStorage.setItem('bites_lang', lang);
    this.notify();
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'id' ? 'en' : 'id');
  }

  t(key: keyof typeof TRANSLATIONS['id']): string {
    return TRANSLATIONS[this.currentLang][key] || key;
  }

  subscribe(listener: (lang: Language) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentLang));
  }
}

export const i18n = new I18nService();
