package com.bites.dispatch;

import com.bites.common.Ids;
import com.bites.order.Order;
import com.bites.order.OrderService;
import com.bites.order.OrderStatus;
import com.bites.tracking.TrackingHub;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

/** Greedy nearest-available-courier dispatch (PRD §4.2, G4). */
@ApplicationScoped
public class DispatchService {

    @Inject OrderService orderService;
    @Inject TrackingHub trackingHub;

    @Transactional
    public void assignCourier(String orderId) {
        Order o = Order.findById(orderId);
        if (o == null || o.courierId != null) return;
        List<Courier> available = Courier.list("status", "AVAILABLE");
        if (available.isEmpty()) return; // courier portal can pick up later; SLA job retries

        Courier nearest = null;
        double best = Double.MAX_VALUE;
        for (Courier c : available) {
            double d = Ids.distanceMeters(c.currentLat, c.currentLng, o.deliveryLat, o.deliveryLng);
            if (d < best) { best = d; nearest = c; }
        }
        nearest.status = "BUSY";
        o.courierId = nearest.id;
        orderService.transition(orderId, OrderStatus.COURIER_ASSIGNED, "DISPATCH",
                "Nearest courier assigned (" + Math.round(best) + "m)");
        trackingHub.broadcastCourierAssigned(orderId, nearest);
        trackingHub.broadcastLocation(orderId, nearest.currentLat, nearest.currentLng, nearest.heading,
                System.currentTimeMillis());
    }
}
