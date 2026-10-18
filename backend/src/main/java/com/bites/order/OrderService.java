package com.bites.order;

import com.bites.catalog.MenuItem;
import com.bites.catalog.Restaurant;
import com.bites.common.Ids;
import com.bites.dispatch.Courier;
import com.bites.dispatch.DispatchService;
import com.bites.payment.PaymentService;
import com.bites.tracking.TrackingHub;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.*;

@ApplicationScoped
public class OrderService {

    public static final long SERVICE_FEE = 2000;

    @Inject TrackingHub trackingHub;
    @Inject DispatchService dispatchService;
    @Inject PaymentService paymentService;

    // ---------- Totals (PRD FR-C.17) ----------
    public record Totals(long subtotal, long deliveryFee, long serviceFee, long discount, long tip, long total) {}

    public Totals computeTotals(String restaurantId, long itemsSubtotal, long tip, String promoCode) {
        Restaurant r = Restaurant.findById(restaurantId);
        long deliveryFee = r != null ? r.deliveryFee : 0;
        long discount = 0;
        if (promoCode != null && !promoCode.isBlank()) {
            PromoCode p = PromoCode.findById(promoCode.trim().toUpperCase());
            if (p == null) throw new IllegalArgumentException("Promo code not found: " + promoCode);
            discount = p.discountFor(itemsSubtotal, deliveryFee);
        }
        long total = Math.max(0, itemsSubtotal + deliveryFee + SERVICE_FEE - discount + tip);
        return new Totals(itemsSubtotal, deliveryFee, SERVICE_FEE, discount, tip, total);
    }

    // ---------- Place order (PRD FR-C.18, §13.3) ----------
    @Transactional
    public Order placeOrder(OrderResource.PlaceOrderReq req, String customerId) {
        Restaurant r = Restaurant.findById(req.restaurantId());
        if (r == null) throw new IllegalArgumentException("Restaurant not found");
        if (!r.isOpen) throw new IllegalArgumentException("Restaurant is closed");
        if (req.items() == null || req.items().isEmpty()) throw new IllegalArgumentException("Cart is empty");

        long subtotal = 0;
        Order order = new Order();
        order.id = Ids.uuid();
        order.orderNumber = Ids.orderNumber();
        order.customerId = customerId;
        order.restaurantId = r.id;
        order.serviceMode = req.serviceMode() != null ? req.serviceMode() : "delivery";
        order.customerName = req.customerName() != null ? req.customerName() : "Andini Putri";
        order.customerPhone = req.customerPhone() != null ? req.customerPhone() : "+62 812-9988-7766";
        order.deliveryAddress = req.address();
        order.deliveryNotes = req.addressNotes();
        order.deliveryLat = req.lat();
        order.deliveryLng = req.lng();
        order.paymentMethod = req.paymentMethod() != null ? req.paymentMethod() : "qris";
        order.promoCode = req.promoCode();
        order.tip = req.tip() != null ? req.tip() : 0;
        order.pin = Ids.pin4();
        order.prepTimeMinutes = Math.max(10, Math.min(20, r.etaMinutes));
        order.status = OrderStatus.PENDING.name();
        order.persist();

        for (OrderResource.ItemReq ir : req.items()) {
            MenuItem mi = MenuItem.findById(ir.menuItemId());
            if (mi == null) throw new IllegalArgumentException("Menu item not found: " + ir.menuItemId());
            if (!mi.available) throw new IllegalArgumentException("Item out of stock: " + mi.name);
            long unit = mi.price;
            List<Map<String, Object>> mods = new ArrayList<>();
            if (ir.selectedModifiers() != null) {
                for (OrderResource.ModifierSel ms : ir.selectedModifiers()) {
                    unit += ms.price() != null ? ms.price() : 0;
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("groupId", ms.groupId());
                    m.put("groupName", ms.groupName());
                    m.put("optionId", ms.optionId());
                    m.put("optionName", ms.optionName());
                    m.put("price", ms.price() != null ? ms.price() : 0);
                    mods.add(m);
                }
            }
            long lineTotal = unit * ir.quantity();
            subtotal += lineTotal;

            OrderItem oi = new OrderItem();
            oi.id = Ids.uuid();
            oi.orderId = order.id;
            oi.menuItemId = mi.id;
            oi.nameSnapshot = mi.name;
            oi.imageSnapshot = mi.image;
            oi.unitPrice = unit;
            oi.quantity = ir.quantity();
            oi.modifiersJson = toJsonArray(mods);
            oi.notes = ir.specialInstructions();
            oi.lineTotal = lineTotal;
            oi.persist();
        }

        Totals t = computeTotals(r.id, subtotal, order.tip, order.promoCode);
        order.subtotal = t.subtotal();
        order.deliveryFee = t.deliveryFee();
        order.serviceFee = t.serviceFee();
        order.discount = t.discount();
        order.grandTotal = t.total();
        if (order.promoCode != null && order.discount > 0) {
            PromoCode p = PromoCode.findById(order.promoCode.trim().toUpperCase());
            if (p != null) p.redeemedCount++;
        }

        appendEvent(order.id, null, OrderStatus.PENDING, "CUSTOMER", "Order placed");
        // Create payment intent (simulated Midtrans charge — §13.3 step 2-3)
        paymentService.charge(order);
        trackingHub.broadcastStatus(order.id, null, OrderStatus.PENDING, order.etaMinutesRemaining);
        return order;
    }
    // ---------- Validated state transition (PRD §12) ----------
    @Transactional
    public Order transition(String orderId, OrderStatus to, String actor, String reason) {
        Order o = Order.findById(orderId);
        if (o == null) throw new IllegalArgumentException("Order not found");
        OrderStatus from = o.statusEnum();
        if (from == to) return o; // idempotent
        if (!from.canTransitionTo(to)) {
            throw new IllegalStateException("Illegal transition " + from + " → " + to);
        }
        o.status = to.name();
        o.updatedAt = Instant.now();
        switch (to) {
            case ACCEPTED -> o.acceptedAt = Instant.now();
            case PREPARING -> o.preparingAt = Instant.now();
            case READY_FOR_PICKUP -> {
                o.readyAt = Instant.now();
                o.etaMinutesRemaining = o.prepTimeMinutes;
            }
            case COURIER_ASSIGNED -> o.courierAssignedAt = Instant.now();
            case PICKED_UP -> {
                o.pickedUpAt = Instant.now();
                Restaurant r = Restaurant.findById(o.restaurantId);
                double meters = r == null ? 3000 : com.bites.common.Ids.distanceMeters(r.lat, r.lng, o.deliveryLat, o.deliveryLng);
                o.etaMinutesRemaining = Math.max(8, (int) Math.round(meters / 350.0)); // ~21 km/h
                if (o.courierId != null) Courier.setBusy(o.courierId);
            }
            case DELIVERED -> {
                o.deliveredAt = Instant.now();
                o.etaMinutesRemaining = 0;
                if (o.courierId != null) {
                    Courier c = Courier.findById(o.courierId);
                    if (c != null) { c.status = "AVAILABLE"; c.tripsCompleted++; }
                }
            }
            case CANCELLED -> {
                o.cancelledAt = Instant.now();
                o.cancelReason = reason;
                o.refundAmount = o.grandTotal * o.refundPercent() / 100;
                if (o.courierId != null) {
                    Courier c = Courier.findById(o.courierId);
                    if (c != null) c.status = "AVAILABLE";
                }
            }
            default -> { }
        }
        appendEvent(orderId, from, to, actor, reason);
        trackingHub.broadcastStatus(orderId, from, to, o.etaMinutesRemaining);
        if (to == OrderStatus.READY_FOR_PICKUP) {
            dispatchService.assignCourier(o.id); // PRD FR-R.7 trigger dispatch
        }
        return o;
    }

    @Transactional
    public void rateOrder(String orderId, int foodStars, int courierStars, String comment) {
        Order o = Order.findById(orderId);
        if (o == null) throw new IllegalArgumentException("Order not found");
        o.foodStars = foodStars;
        o.courierStars = courierStars;
        o.ratingComment = comment;
    }

    public void appendEvent(String orderId, OrderStatus from, OrderStatus to, String actor, String reason) {
        OrderEvent.create(orderId, from == null ? null : from.name(), to.name(), actor, reason).persist();
    }

    private static String toJsonArray(List<Map<String, Object>> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            Map<String, Object> m = list.get(i);
            sb.append("{");
            int j = 0;
            for (var e : m.entrySet()) {
                if (j++ > 0) sb.append(",");
                sb.append("\"").append(e.getKey()).append("\":");
                Object v = e.getValue();
                if (v instanceof String s) sb.append("\"").append(s.replace("\"", "'")).append("\"");
                else if (v instanceof Number n) sb.append(n);
                else if (v instanceof Boolean b) sb.append(b);
                else sb.append("null");
            }
            sb.append("}");
        }
        return sb.append("]").toString();
    }
}
