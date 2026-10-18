package com.bites.order;

import com.bites.common.ApiResponse;
import com.bites.common.Ids;
import com.bites.common.IdempotencyKey;
import com.bites.dispatch.Courier;
import com.bites.tracking.TrackingHub;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.Instant;
import java.util.*;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject OrderService orderService;
    @Inject TrackingHub trackingHub;
    @Inject OrderViewMapper mapper;

    // ---------- Requests ----------
    public record ModifierSel(String groupId, String groupName, String optionId, String optionName, Long price) {}
    public record ItemReq(String menuItemId, int quantity, List<ModifierSel> selectedModifiers, String specialInstructions) {}
    public record PlaceOrderReq(String restaurantId, String serviceMode, List<ItemReq> items,
                                String customerName, String customerPhone,
                                String address, String addressNotes, Double lat, Double lng,
                                String paymentMethod, String promoCode, Long tip) {}
    public record CancelReq(String reason) {}
    public record RatingReq(Integer foodStars, Integer courierStars, String comment) {}

    /** POST /orders with Idempotency-Key (PRD FR-X.6, §16.3). */
    @POST
    @Path("/orders")
    @Transactional
    public Response place(@HeaderParam("Idempotency-Key") String idemKey, PlaceOrderReq req) {
        if (req == null || req.restaurantId() == null || req.restaurantId().isBlank()) {
            throw new IllegalArgumentException("restaurantId required");
        }
        if (req.items() == null || req.items().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }
        if (idemKey != null && !idemKey.isBlank()) {
            IdempotencyKey existing = IdempotencyKey.findById(idemKey);
            if (existing != null && existing.responseBody != null) {
                return Response.ok(existing.responseBody).header("Content-Type", "application/json").build();
            }
        }
        Order o = orderService.placeOrder(req, "usr-demo-cust");
        Map<String, Object> out = mapper.orderPlacedView(o);
        ApiResponse<Map<String, Object>> wrapped = ApiResponse.ok(out, "Order placed");
        if (idemKey != null && !idemKey.isBlank()) {
            IdempotencyKey key = new IdempotencyKey();
            key.key = idemKey;
            key.method = "POST";
            key.path = "/api/v1/orders";
            key.responseBody = com.bites.common.Json.toJson(wrapped);
            key.createdAt = Instant.now();
            key.persist();
        }
        return Response.status(Response.Status.CREATED).entity(wrapped).build();
    }

    /** GET /orders — my order history (FR-C.3). */
    @GET
    @Path("/orders")
    public ApiResponse<List<Map<String, Object>>> myOrders() {
        List<Order> orders = Order.list("customerId = ?1 order by placedAt desc", "usr-demo-cust");
        List<Map<String, Object>> out = new ArrayList<>();
        for (Order o : orders) out.add(mapper.orderFullView(o));
        return ApiResponse.ok(out, "OK");
    }

    /** GET /orders/{id} */
    @GET
    @Path("/orders/{id}")
    public ApiResponse<Map<String, Object>> get(@PathParam("id") String id) {
        Order o = Order.findById(id);
        if (o == null) throw new NotFoundException("Order not found: " + id);
        return ApiResponse.ok(mapper.orderFullView(o), "OK");
    }

    /** POST /orders/{id}/cancel (FR-C.27 — pre-PICKED_UP only, enforced by state machine). */
    @POST
    @Path("/orders/{id}/cancel")
    @Transactional
    public ApiResponse<Map<String, Object>> cancel(@PathParam("id") String id, CancelReq req) {
        Order o = orderService.transition(id, OrderStatus.CANCELLED, "CUSTOMER",
                req != null && req.reason() != null ? req.reason() : "Customer cancelled");
        return ApiResponse.ok(mapper.orderFullView(o), "Order cancelled");
    }

    /** POST /orders/{id}/rating (FR-C.24). */
    @POST
    @Path("/orders/{id}/rating")
    @Transactional
    public ApiResponse<Map<String, Object>> rate(@PathParam("id") String id, RatingReq req) {
        if (req == null) throw new IllegalArgumentException("rating required");
        orderService.rateOrder(id,
                req.foodStars() != null ? req.foodStars() : 5,
                req.courierStars() != null ? req.courierStars() : 5,
                req.comment());
        Order o = Order.findById(id);
        return ApiResponse.ok(mapper.orderFullView(o), "Rating saved");
    }

    /** GET /orders/{id}/tracking (§16.4) — snapshot; live updates come over WS. */
    @GET
    @Path("/orders/{id}/tracking")
    public ApiResponse<Map<String, Object>> tracking(@PathParam("id") String id) {
        Order o = Order.findById(id);
        if (o == null) throw new NotFoundException("Order not found: " + id);
        return ApiResponse.ok(mapper.trackingView(o), "OK");
    }
}
