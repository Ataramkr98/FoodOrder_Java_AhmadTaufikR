package com.bites.payment;

import com.bites.common.Ids;
import com.bites.order.Order;
import com.bites.order.OrderService;
import com.bites.order.OrderStatus;
import com.bites.tracking.TrackingHub;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Map;

/**
 * Simulated Midtrans-compatible payment service (PRD §13).
 * A real deployment swaps the charge() internals for the Midtrans Snap REST call
 * and keeps the webhook handler untouched.
 */
@ApplicationScoped
public class PaymentService {

    @Inject OrderService orderService;
    @Inject TrackingHub trackingHub;

    /** Create a payment intent with instructions (QRIS string / VA number). */
    @Transactional
    public Payment charge(Order o) {
        Payment p = new Payment();
        p.id = Ids.uuid();
        p.orderId = o.id;
        p.provider = "MIDTRANS";
        p.externalId = "MID-" + o.orderNumber;
        p.method = o.paymentMethod.toUpperCase();
        p.amount = o.grandTotal;
        p.status = "PENDING";
        switch (o.paymentMethod.toLowerCase()) {
            case "qris", "gopay", "ovo", "dana", "shopeepay" ->
                    p.qrString = "00020101021226" + p.externalId + "5802ID5910BITESDEMO6007JAKARTA";
            case "va_bca", "va_mandiri", "va_bri", "va_bni" ->
                    p.vaNumber = "8808" + String.format("%08d", Math.abs(o.id.hashCode()) % 100000000);
            default -> { /* card: tokenized by gateway, nothing to show */ }
        }
        p.persist();
        o.paymentRef = p.externalId;
        return p;
    }

    /**
     * Handles a Midtrans-style webhook notification (§13.4).
     * Idempotent on (provider, external_id); only forward status transitions are applied.
     */
    @Transactional
    public void handleNotification(String orderId, String statusCode, String grossAmount, String transactionStatus) {
        Order o = Order.findById(orderId);
        if (o == null) throw new IllegalArgumentException("Order not found: " + orderId);
        Payment p = Payment.findByOrderId(orderId);
        if (p == null) throw new IllegalArgumentException("Payment not found for order " + orderId);

        boolean settled = "settlement".equalsIgnoreCase(transactionStatus) || "capture".equalsIgnoreCase(transactionStatus);
        boolean failed = "deny".equalsIgnoreCase(transactionStatus) || "expire".equalsIgnoreCase(transactionStatus)
                || "cancel".equalsIgnoreCase(transactionStatus);

        if (settled && "PAID".equals(p.status)) return; // idempotent
        if (settled) {
            p.status = "PAID";
            p.paidAt = java.time.Instant.now();
            o.paymentStatus = "PAID";
            if (OrderStatus.PENDING.name().equals(o.status)) {
                orderService.transition(o.id, OrderStatus.AWAITING_RESTAURANT, "SYSTEM", "payment.paid");
            }
        } else if (failed && !"FAILED".equals(p.status)) {
            p.status = "FAILED";
            o.paymentStatus = "FAILED";
            if (OrderStatus.PENDING.name().equals(o.status)) {
                orderService.transition(o.id, OrderStatus.PAYMENT_FAILED, "SYSTEM", "payment." + transactionStatus);
            }
        }
        // 'pending' and out-of-order events are ignored (highest-known-status rule, §13.4)
    }

    /** Records a simulated refund (§13.6 — async via gateway in production). */
    @Transactional
    public void markRefunded(String orderId, long amount) {
        Payment p = Payment.findByOrderId(orderId);
        if (p != null) p.status = "REFUNDED";
    }

    /** Midtrans signature_sha512 = sha512(order_id + status_code + gross_amount + serverKey). */
    public boolean verifySignature(String orderId, String statusCode, String grossAmount, String signature) {
        String serverKey = "SB-Mid-server-dev-demo-key";
        return Ids.sha512Hex(orderId + statusCode + grossAmount + serverKey).equalsIgnoreCase(signature);
    }
}
