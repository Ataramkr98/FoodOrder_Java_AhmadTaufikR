import * as L from 'leaflet';
import { Order } from '../../core/models/types';

export class LiveTrackingMap {
  private map: L.Map | null = null;
  private courierMarker: L.Marker | null = null;

  init(container: HTMLElement, order: Order) {
    // If map already exists, remove it first to avoid duplicate init
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const restCoord: [number, number] = [order.restaurant.lat, order.restaurant.lng];
    const custCoord: [number, number] = [order.customer.lat, order.customer.lng];
    const courierCoord: [number, number] = order.courier
      ? [order.courier.currentLat, order.courier.currentLng]
      : restCoord;

    // Center map
    const midLat = (restCoord[0] + custCoord[0]) / 2;
    const midLng = (restCoord[1] + custCoord[1]) / 2;

    this.map = L.map(container, {
      center: [midLat, midLng],
      zoom: 14,
      zoomControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Custom Icons
    const restaurantIcon = L.divIcon({
      className: 'custom-restaurant-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="restaurant-pin shadow-lg hover:scale-110 transition-transform">🍳</div>
          <div class="absolute -bottom-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
            ${order.restaurant.name.split('—')[0]}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const customerIcon = L.divIcon({
      className: 'custom-customer-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="customer-pin shadow-lg hover:scale-110 transition-transform">🏠</div>
          <div class="absolute -bottom-6 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
            Lokasi Pengantaran
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(restCoord, { icon: restaurantIcon }).addTo(this.map);
    L.marker(custCoord, { icon: customerIcon }).addTo(this.map);

    // Draw route polyline
    if (order.routeCoordinates && order.routeCoordinates.length > 0) {
      L.polyline(order.routeCoordinates, {
        color: '#F97316',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 8',
      }).addTo(this.map);
    }

    // Add courier marker if assigned
    if (order.courier) {
      this.updateCourierPosition(courierCoord, order.courier.heading, order.courier.name);
    }

    // Fit bounds
    const bounds = L.latLngBounds([restCoord, custCoord]);
    if (order.courier) bounds.extend(courierCoord);
    this.map.fitBounds(bounds, { padding: [60, 60] });
  }

  updateCourierPosition(coord: [number, number], heading: number = 0, courierName: string = 'Rio') {
    if (!this.map) return;

    const courierIcon = L.divIcon({
      className: 'custom-courier-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="pulse-ring"></div>
          <div class="courier-pin shadow-xl" style="transform: rotate(${heading}deg);">
            🛵
          </div>
          <div class="absolute -bottom-6 bg-brand-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow whitespace-nowrap">
            ${courierName} (Driver)
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!this.courierMarker) {
      this.courierMarker = L.marker(coord, { icon: courierIcon }).addTo(this.map);
    } else {
      this.courierMarker.setLatLng(coord);
      this.courierMarker.setIcon(courierIcon);
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
