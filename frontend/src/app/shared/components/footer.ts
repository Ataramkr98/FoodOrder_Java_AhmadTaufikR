import { icon } from './icons';

export function renderFooter(container: HTMLElement, onNavigateCategory?: (category: string) => void) {
  container.innerHTML = `
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 font-sans text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <!-- Main Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          
          <!-- Col 1: Brand & Bio (2 cols on lg) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                ${icon('utensils', 'w-5 h-5 text-white')}
              </div>
              <span class="font-display font-extrabold text-2xl tracking-tight text-white">
                bites<span class="text-brand-500">.</span>
              </span>
            </div>
            
            <p class="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              Platform pemesanan makanan online multi-restoran dengan pelacakan live GPS kurir real-time dari dapur hingga depan pintu.
            </p>

            <div class="pt-2 flex items-center space-x-3 text-[11px] text-slate-300">
              <span class="inline-flex items-center space-x-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Layanan Aktif Jakarta</span>
              </span>
              <span class="inline-flex items-center space-x-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                ${icon('shield', 'w-3.5 h-3.5 text-brand-400')}
                <span>100% Pembayaran Aman</span>
              </span>
            </div>
          </div>

          <!-- Col 2: Menu & Kategori -->
          <div class="space-y-3">
            <h4 class="font-bold text-white text-xs uppercase tracking-wider">Pilihan Kuliner</h4>
            <ul class="space-y-2 text-xs font-normal">
              <li><a href="#" class="hover:text-white transition-colors" data-cat="ayam">Ayam Crispy & Geprek</a></li>
              <li><a href="#" class="hover:text-white transition-colors" data-cat="burger">Gourmet Deluxe Burger</a></li>
              <li><a href="#" class="hover:text-white transition-colors" data-cat="coffee">Kopi & Artisan Brew</a></li>
              <li><a href="#" class="hover:text-white transition-colors" data-cat="beverages">Minuman & Soda Segar</a></li>
              <li><a href="#" class="hover:text-white transition-colors" data-cat="all">Paket PaMer Keluarga</a></li>
            </ul>
          </div>

          <!-- Col 3: Layanan & Fitur -->
          <div class="space-y-3">
            <h4 class="font-bold text-white text-xs uppercase tracking-wider">Layanan Bites</h4>
            <ul class="space-y-2 text-xs font-normal">
              <li><span class="hover:text-white transition-colors cursor-pointer">Pesan Antar (Delivery)</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Ambil Sendiri (Takeaway)</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Makan di Tempat (Dine-In)</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Drive-Thru Express</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Pelacakan Live Map GPS</span></li>
            </ul>
          </div>

          <!-- Col 4: Bantuan & Kemitraan -->
          <div class="space-y-3">
            <h4 class="font-bold text-white text-xs uppercase tracking-wider">Bantuan & Mitra</h4>
            <ul class="space-y-2 text-xs font-normal">
              <li><a href="#" class="hover:text-white transition-colors">Pusat Bantuan & FAQ</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Gabung Mitra Restoran</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Gabung Mitra Driver</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

        </div>

        <!-- Payment Partners & Badges -->
        <div class="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 text-[11px]">
          <div class="flex items-center space-x-2 text-slate-400">
            <span class="font-bold text-slate-300">Metode Pembayaran Resmi:</span>
            <div class="flex flex-wrap gap-1.5">
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">QRIS</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">BCA</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">Mandiri</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">BRI</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">GoPay</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">OVO</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">DANA</span>
              <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-[10px]">Visa / Mastercard</span>
            </div>
          </div>

          <div class="flex items-center space-x-3 text-slate-400">
            <span>Terhubung ke Midtrans Snap Payment Gateway</span>
          </div>
        </div>

        <!-- Copyright Bottom Bar -->
        <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 PT Bites Teknologi Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
          <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
              ${icon('map-pin', 'w-3 h-3 text-slate-400')}
              <span>Jakarta, Indonesia</span>
            </span>
            <span>•</span>
            <span class="font-medium text-slate-400">Versi 1.0.0</span>
          </div>
        </div>

      </div>
    </footer>
  `;

  container.querySelectorAll('a[data-cat]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = (e.currentTarget as HTMLElement).dataset.cat;
      if (cat && onNavigateCategory) {
        onNavigateCategory(cat);
      }
    });
  });
}
