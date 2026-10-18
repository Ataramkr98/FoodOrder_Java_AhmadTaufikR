package com.bites.restaurantops;

import com.bites.catalog.MenuItem;
import com.bites.order.Order;
import com.bites.order.OrderService;
import com.bites.order.OrderStatus;
import com.bites.order.OrderViewMapper;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.Map;

/** Restaurant operator console API (PRD §16.6 / FR-R). Demo scope: the seeded owner manages all seeded restaurants. */
@Path("/api/v1/restaurant/me")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantOpsResource {

    @Inject OrderService orderService;
    @Inject OrderViewMapper mapper;

    /** GET /restaurant/me/orders?status= */
    @GET
    @Path("/orders")
    public List<Map<String, Object>> orders(@QueryParam("status") String status) {
        List<Order> orders = status == null || status.isBlank()
                ? Order.list("status not in ('DELIVERED','CANCELLED','PAYMENT_FAILED') order by placedAt desc")
                : Order.list("status", status);
        return orders.stream().map(mapper::orderFullView).toList();
    }

    /** POST /restaurant/me/orders/{id}/accept (FR-R.5). */
    @POST
    @Path("/orders/{id}/accept")
    @Transactional
    public Map<String, Object> accept(@PathParam("id") String id, Map<String, Object> body) {
        Integer prep = body == null ? null : (Integer) body.get("prepTimeMinutes");
        Order o = Order.findById(id);
        if (o != null && prep != null) o.prepTimeMinutes = prep;
        orderService.transition(id, OrderStatus.ACCEPTED, "RESTAURANT", "Restaurant accepted");
        return mapper.orderFullView(Order.findById(id));
    }

    /** POST /restaurant/me/orders/{id}/reject */
    @POST
    @Path("/orders/{id}/reject")
    @Transactional
    public Map<String, Object> reject(@PathParam("id") String id, Map<String, String> body) {
        return orderService.transition(id, OrderStatus.CANCELLED, "RESTAURANT",
                body != null ? body.getOrDefault("reason", "Rejected by restaurant") : "Rejected by restaurant")
                == null ? Map.of() : mapper.orderFullView(Order.findById(id));
    }

    /** POST /restaurant/me/orders/{id}/start-prep */
    @POST
    @Path("/orders/{id}/start-prep")
    @Transactional
    public Map<String, Object> startPrep(@PathParam("id") String id) {
        orderService.transition(id, OrderStatus.PREPARING, "RESTAURANT", "Kitchen started preparing");
        return mapper.orderFullView(Order.findById(id));
    }

    /** POST /restaurant/me/orders/{id}/ready (FR-R.7 — triggers courier dispatch). */
    @POST
    @Path("/orders/{id}/ready")
    @Transactional
    public Map<String, Object> ready(@PathParam("id") String id) {
        orderService.transition(id, OrderStatus.READY_FOR_PICKUP, "RESTAURANT", "Food packed");
        return mapper.orderFullView(Order.findById(id));
    }

    /** PATCH /restaurant/me/menu/items/{id}/availability (FR-R.3). */
    @PATCH
    @Path("/menu/items/{id}/availability")
    @Transactional
    public MenuItem availability(@PathParam("id") String id, Map<String, Boolean> body) {
        MenuItem mi = MenuItem.findById(id);
        if (mi == null) throw new NotFoundException();
        mi.available = Boolean.TRUE.equals(body.get("available"));
        mi.updatedAt = java.time.Instant.now();
        return mi;
    }

    /** GET /restaurant/me/analytics (FR-R.8 — simple aggregates). */
    @GET
    @Path("/analytics")
    public Map<String, Object> analytics() {
        long totalOrders = Order.count();
        long delivered = Order.count("status", OrderStatus.DELIVERED.name());
        double avgTotal = totalOrders == 0 ? 0
                : Order.<Order>listAll().stream().mapToLong(o -> o.grandTotal).average().orElse(0);
        return Map.of(
                "totalOrders", totalOrders,
                "deliveredOrders", delivered,
                "activeOrders", totalOrders - delivered,
                "avgOrderValue", Math.round(avgTotal));
    }
}
