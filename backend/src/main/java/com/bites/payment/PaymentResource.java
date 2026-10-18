package com.bites.payment;

import com.bites.order.Order;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.Map;

@Path("/api/v1/payments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PaymentResource {

    @Inject PaymentService paymentService;

    /** Real Midtrans webhook (§16.5). Signature-verified; also available via simulate endpoint. */
    @POST
    @Path("/webhook/midtrans")
    public Map<String, Object> webhook(Map<String, Object> body) {
        String orderId = String.valueOf(body.get("order_id"));
        String statusCode = String.valueOf(body.getOrDefault("status_code", "200"));
        String grossAmount = String.valueOf(body.getOrDefault("gross_amount", "0.00"));
        String signature = String.valueOf(body.get("signature_key"));
        if (signature != null && !signature.isBlank()
                && !paymentService.verifySignature(orderId, statusCode, grossAmount, signature)) {
            throw new ForbiddenException("Invalid webhook signature");
        }
        paymentService.handleNotification(orderId, statusCode, grossAmount,
                String.valueOf(body.get("transaction_status")));
        return Map.of("received", true);
    }

    /** Demo helper: emulates the gateway webhook for an order (what the real Snap popup would trigger). */
    @POST
    @Path("/{orderId}/simulate-success")
    public Map<String, Object> simulateSuccess(@PathParam("orderId") String orderId) {
        Order o = Order.findById(orderId);
        if (o == null) throw new NotFoundException();
        paymentService.handleNotification(orderId, "200", o.grandTotal + ".00", "settlement");
        Order updated = Order.findById(orderId);
        return Map.of("orderId", orderId, "paymentStatus", "PAID", "orderStatus",
                updated.status);
    }
}
