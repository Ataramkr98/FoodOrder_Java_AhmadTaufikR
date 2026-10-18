package com.bites.order;

import com.bites.catalog.CatalogViewMapper;
import com.bites.catalog.MenuItem;
import com.bites.catalog.Restaurant;
import com.bites.common.Casts;
import com.bites.dispatch.Courier;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.*;

/** Builds frontend-shaped JSON for orders. */
@ApplicationScoped
public class OrderViewMapper {

    @Inject CatalogViewMapper catalog;

    public Map<String, Object> orderPlacedView(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.id);
        m.put("orderNumber", o.orderNumber);
        m.put("status", o.status);
        m.put("pin", o.pin);
        m.put("grandTotal", o.grandTotal);
        m.put("paymentStatus", o.paymentStatus);
        m.put("payment", paymentView(o));
        return m;
    }

    public Map<String, Object> paymentView(Order o) {
        Map<String, Object> p = new LinkedHashMap<>();
        var payment = com.bites.payment.Payment.findByOrderId(o.id);
        p.put("method", o.paymentMethod);
        p.put("status", o.paymentStatus);
        if (payment != null) {
            p.put("qrString", payment.qrString);
            p.put("vaNumber", payment.vaNumber);
            p.put("externalId", payment.externalId);
        }
        return p;
    }

    public Map<String, Object> courierView(Order o) {
        if (o.courierId == null) return null;
        Courier c = Courier.findById(o.courierId);
        if (c == null) return null;
        Map<String, Object> cm = new LinkedHashMap<>();
        cm.put("id", c.id);
        cm.put("name", c.name);
        cm.put("phone", c.phone);
        cm.put("maskedPhone", c.maskedPhone);
        cm.put("vehicle", c.vehicle);
        cm.put("plateNumber", c.plateNumber);
        cm.put("photo", c.photo);
        cm.put("rating", c.ratingAvg);
        cm.put("tripsCompleted", c.tripsCompleted);
        cm.put("currentLat", c.currentLat);
        cm.put("currentLng", c.currentLng);
        cm.put("heading", c.heading);
        cm.put("isOnline", !"OFFLINE".equals(c.status));
        return cm;
    }

    public Map<String, Object> trackingView(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderId", o.id);
        m.put("status", o.status);
        m.put("etaSeconds", o.etaMinutesRemaining == null ? null : o.etaMinutesRemaining * 60);
        m.put("courier", courierView(o));
        return m;
    }
    public Map<String, Object> orderFullView(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.id);
        m.put("orderNumber", o.orderNumber);
        Restaurant r = Restaurant.findById(o.restaurantId);
        m.put("restaurant", r == null ? null : catalog.restaurantView(r));
        m.put("customerId", o.customerId);
        m.put("customer", Map.of(
                "name", o.customerName == null ? "" : o.customerName,
                "phone", o.customerPhone == null ? "" : o.customerPhone,
                "address", o.deliveryAddress == null ? "" : o.deliveryAddress,
                "landmark", o.deliveryNotes == null ? "" : o.deliveryNotes,
                "lat", o.deliveryLat,
                "lng", o.deliveryLng));
        List<Map<String, Object>> items = new ArrayList<>();
        List<OrderItem> oiList = Casts.list(OrderItem.list("orderId", o.id));
        for (OrderItem oi : oiList) {
            Map<String, Object> im = new LinkedHashMap<>();
            im.put("uid", oi.id);
            im.put("menuItemId", oi.menuItemId);
            MenuItem mi = oi.menuItemId != null ? MenuItem.findById(oi.menuItemId) : null;
            im.put("menuItem", mi != null ? catalog.menuItemView(mi) : null);
            im.put("name", oi.nameSnapshot);
            im.put("image", oi.imageSnapshot);
            im.put("quantity", oi.quantity);
            im.put("selectedModifiers", oi.modifiersJson == null ? List.of() : parseMods(oi.modifiersJson));
            im.put("specialInstructions", oi.notes);
            im.put("unitPrice", oi.unitPrice);
            im.put("totalPrice", oi.lineTotal);
            items.add(im);
        }
        m.put("items", items);
        m.put("serviceMode", o.serviceMode);
        m.put("status", o.status);
        m.put("subtotal", o.subtotal);
        m.put("deliveryFee", o.deliveryFee);
        m.put("serviceFee", o.serviceFee);
        m.put("discount", o.discount);
        m.put("promoCode", o.promoCode);
        m.put("tip", o.tip);
        m.put("grandTotal", o.grandTotal);
        m.put("paymentMethod", o.paymentMethod);
        m.put("paymentStatus", o.paymentStatus);
        m.put("paymentRef", o.paymentRef);
        m.put("payment", paymentView(o));
        m.put("courier", courierView(o));
        m.put("pin", o.pin);
        m.put("prepTimeMinutes", o.prepTimeMinutes);
        m.put("etaMinutesRemaining", o.etaMinutesRemaining);
        m.put("cancelReason", o.cancelReason);
        m.put("refundAmount", o.refundAmount);
        Map<String, Object> ts = new LinkedHashMap<>();
        ts.put("placedAt", toMs(o.placedAt));
        ts.put("acceptedAt", toMs(o.acceptedAt));
        ts.put("preparingAt", toMs(o.preparingAt));
        ts.put("readyAt", toMs(o.readyAt));
        ts.put("courierAssignedAt", toMs(o.courierAssignedAt));
        ts.put("pickedUpAt", toMs(o.pickedUpAt));
        ts.put("deliveredAt", toMs(o.deliveredAt));
        ts.put("cancelledAt", toMs(o.cancelledAt));
        m.put("timestamps", ts);
        List<Map<String, Object>> timeline = new ArrayList<>();
        List<OrderEvent> evList = Casts.list(OrderEvent.list("orderId = ?1 order by at asc", o.id));
        for (OrderEvent e : evList) {
            Map<String, Object> ev = new LinkedHashMap<>();
            ev.put("status", e.toStatus);
            ev.put("timestamp", e.at.toEpochMilli());
            ev.put("actor", e.actor);
            ev.put("description", e.reason);
            timeline.add(ev);
        }
        m.put("timeline", timeline);
        Map<String, Object> rating = new LinkedHashMap<>();
        rating.put("foodStars", o.foodStars);
        rating.put("courierStars", o.courierStars);
        rating.put("comment", o.ratingComment);
        m.put("rating", (o.foodStars == null && o.courierStars == null) ? null : rating);
        return m;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> parseMods(String json) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    private static Long toMs(java.time.Instant t) {
        return t == null ? null : t.toEpochMilli();
    }
}
