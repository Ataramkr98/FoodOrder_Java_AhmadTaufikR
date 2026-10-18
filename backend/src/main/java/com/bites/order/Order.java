package com.bites.order;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "orders")
public class Order extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "order_number", nullable = false, unique = true)
    public String orderNumber;
    @Column(name = "customer_id", length = 40)
    public String customerId;
    @Column(name = "restaurant_id", length = 40, nullable = false)
    public String restaurantId;
    @Column(name = "courier_id", length = 40)
    public String courierId;
    @Column(nullable = false, length = 30)
    public String status = OrderStatus.PENDING.name();
    @Column(name = "service_mode", nullable = false, length = 20)
    public String serviceMode = "delivery";
    @Column(name = "customer_name", nullable = false)
    public String customerName;
    @Column(name = "customer_phone")
    public String customerPhone;
    @Column(name = "delivery_address", nullable = false, columnDefinition = "text")
    public String deliveryAddress;
    @Column(name = "delivery_notes", columnDefinition = "text")
    public String deliveryNotes;
    @Column(name = "delivery_lat", nullable = false)
    public double deliveryLat;
    @Column(name = "delivery_lng", nullable = false)
    public double deliveryLng;
    @Column(nullable = false)
    public long subtotal;
    @Column(name = "delivery_fee", nullable = false)
    public long deliveryFee;
    @Column(name = "service_fee", nullable = false)
    public long serviceFee;
    @Column(name = "discount", nullable = false)
    public long discount;
    @Column(name = "promo_code")
    public String promoCode;
    @Column(nullable = false)
    public long tip;
    @Column(name = "grand_total", nullable = false)
    public long grandTotal;
    @Column(name = "payment_method", nullable = false, length = 30)
    public String paymentMethod;
    @Column(name = "payment_status", nullable = false, length = 20)
    public String paymentStatus = "UNPAID";
    @Column(name = "payment_ref")
    public String paymentRef;
    @Column(nullable = false, length = 4)
    public String pin;
    @Column(name = "prep_time_minutes", nullable = false)
    public int prepTimeMinutes = 15;
    @Column(name = "eta_minutes_remaining")
    public Integer etaMinutesRemaining;
    @Column(name = "placed_at", nullable = false)
    public Instant placedAt = Instant.now();
    public Instant acceptedAt;
    public Instant preparingAt;
    public Instant readyAt;
    @Column(name = "courier_assigned_at")
    public Instant courierAssignedAt;
    @Column(name = "picked_up_at")
    public Instant pickedUpAt;
    @Column(name = "delivered_at")
    public Instant deliveredAt;
    public Instant cancelledAt;
    @Column(name = "cancel_reason", columnDefinition = "text")
    public String cancelReason;
    @Column(name = "refund_amount", nullable = false)
    public long refundAmount;
    public Integer foodStars;
    public Integer courierStars;
    @Column(name = "rating_comment", columnDefinition = "text")
    public String ratingComment;
    @Column(name = "created_at", nullable = false)
    public Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt = Instant.now();

    public OrderStatus statusEnum() {
        return OrderStatus.valueOf(status);
    }

    /** PRD §12.4 refund rules by status at cancellation time. */
    public long refundPercent() {
        return switch (statusEnum()) {
            case PENDING, AWAITING_RESTAURANT, ACCEPTED -> 100;
            case PREPARING, READY_FOR_PICKUP -> 50;
            default -> 0;
        };
    }
}
