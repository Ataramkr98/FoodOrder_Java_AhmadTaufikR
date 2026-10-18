package com.bites.dispatch;

import com.bites.common.Casts;
import com.bites.order.Order;
import com.bites.order.OrderService;
import com.bites.order.OrderStatus;
import com.bites.tracking.TrackingHub;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.Map;

@Path("/api/v1/courier")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CourierResource {

    public static final String DEMO_COURIER_ID = "courier-rio";

    @Inject OrderService orderService;
    @Inject TrackingHub trackingHub;
    @Inject com.bites.order.OrderViewMapper mapper;

    /** GET /courier/me — demo: returns the seeded courier. */
    @GET
    @Path("/me")
    public Courier me() {
        return Courier.findById(DEMO_COURIER_ID);
    }

    /** PATCH /courier/me/status (FR-D.2). */
    @PATCH
    @Path("/me/status")
    @Transactional
    public Courier setStatus(Map<String, String> body) {
        Courier c = Courier.findById(DEMO_COURIER_ID);
        if (c == null) throw new NotFoundException();
        String s = body.get("status");
        if (!List.of("OFFLINE", "AVAILABLE").contains(s)) {
            throw new IllegalArgumentException("status must be OFFLINE or AVAILABLE");
        }
        c.status = s;
        return c;
    }

    /** GET /courier/me/offers — orders that need a courier (READY_FOR_PICKUP without assignment). */
    @GET
    @Path("/me/offers")
    public List<Map<String, Object>> offers() {
        List<Order> list = Casts.list(Order.list("status = ?1 and courierId is null",
                OrderStatus.READY_FOR_PICKUP.name()));
        return list.stream().map(mapper::orderFullView).toList();
    }

    /** GET /courier/me/jobs — active jobs assigned to this courier. */
    @GET
    @Path("/me/jobs")
    public List<Map<String, Object>> jobs() {
        List<Order> list = Casts.list(Order.list(
                "courierId = ?1 and status not in ('DELIVERED','CANCELLED','PAYMENT_FAILED')", DEMO_COURIER_ID));
        return list.stream().map(mapper::orderFullView).toList();
    }
    /** POST /courier/orders/{id}/accept (FR-D.3). */
    @POST
    @Path("/orders/{id}/accept")
    @Transactional
    public Map<String, Object> accept(@PathParam("id") String id) {
        Order o = Order.findById(id);
        if (o == null) throw new NotFoundException();
        if (o.courierId == null) {
            o.courierId = DEMO_COURIER_ID;
            Courier.setBusy(DEMO_COURIER_ID);
            orderService.transition(id, OrderStatus.COURIER_ASSIGNED, "COURIER", "Courier accepted offer");
        }
        return mapper.orderFullView(Order.findById(id));
    }

    /** POST /courier/orders/{id}/status (FR-D.5). */
    @POST
    @Path("/orders/{id}/status")
    @Transactional
    public Map<String, Object> updateStatus(@PathParam("id") String id, Map<String, String> body) {
        OrderStatus to = OrderStatus.valueOf(body.get("to"));
        orderService.transition(id, to, "COURIER", body.getOrDefault("reason", "courier update"));
        return mapper.orderFullView(Order.findById(id));
    }

    /** POST /courier/location — GPS heartbeat (FR-D.6) with geofence transitions (§14.4). */
    @POST
    @Path("/location")
    @Transactional
    public Map<String, Object> location(Map<String, Object> body) {
        Courier c = Courier.findById(DEMO_COURIER_ID);
        double lat = ((Number) body.get("lat")).doubleValue();
        double lng = ((Number) body.get("lng")).doubleValue();
        double heading = body.get("heading") instanceof Number h ? h.doubleValue() : c.heading;
        c.currentLat = lat;
        c.currentLng = lng;
        c.heading = heading;

        List<Order> activeOrders = Casts.list(Order.list(
                "courierId = ?1 and status in ('COURIER_ASSIGNED','EN_ROUTE_TO_PICKUP','ARRIVED_AT_PICKUP','PICKED_UP','EN_ROUTE_TO_DROP')",
                c.id));
        for (Order o : activeOrders) {
            trackingHub.broadcastLocation(o.id, lat, lng, heading, System.currentTimeMillis());
            var r = com.bites.catalog.Restaurant.findById(o.restaurantId);
            if (r != null) {
                double dPickup = com.bites.common.Ids.distanceMeters(lat, lng, r.lat, r.lng);
                if (OrderStatus.EN_ROUTE_TO_PICKUP.name().equals(o.status) && dPickup < 50) {
                    orderService.transition(o.id, OrderStatus.ARRIVED_AT_PICKUP, "SYSTEM", "geofence(<50m pickup)");
                } else if (OrderStatus.COURIER_ASSIGNED.name().equals(o.status) && dPickup < 50) {
                    orderService.transition(o.id, OrderStatus.EN_ROUTE_TO_PICKUP, "SYSTEM", "geofence approach");
                }
            }
            double dDrop = com.bites.common.Ids.distanceMeters(lat, lng, o.deliveryLat, o.deliveryLng);
            if (OrderStatus.EN_ROUTE_TO_DROP.name().equals(o.status) && dDrop < 50) {
                orderService.transition(o.id, OrderStatus.ARRIVED_AT_DROP, "SYSTEM", "geofence(<50m drop)");
            }
        }
        return Map.of("ok", true);
    }

    /** POST /courier/orders/{id}/deliver — PIN proof of delivery (FR-D.8). */
    @POST
    @Path("/orders/{id}/deliver")
    @Transactional
    public Map<String, Object> deliver(@PathParam("id") String id, Map<String, String> body) {
        Order o = Order.findById(id);
        if (o == null) throw new NotFoundException();
        String pin = body.get("pin");
        if (pin == null || !pin.equals(o.pin)) {
            throw new IllegalArgumentException("Invalid PIN");
        }
        if (o.statusEnum() != OrderStatus.ARRIVED_AT_DROP && o.statusEnum() != OrderStatus.EN_ROUTE_TO_DROP) {
            throw new IllegalArgumentException("Cannot deliver order in status " + o.status);
        }
        if (o.statusEnum() == OrderStatus.EN_ROUTE_TO_DROP) {
            orderService.transition(id, OrderStatus.ARRIVED_AT_DROP, "COURIER", "PIN delivery");
        }
        orderService.transition(id, OrderStatus.DELIVERED, "COURIER", "PIN verified");
        return mapper.orderFullView(Order.findById(id));
    }
}
