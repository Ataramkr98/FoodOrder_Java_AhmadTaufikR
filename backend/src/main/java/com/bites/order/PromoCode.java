package com.bites.order;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "promo_codes")
public class PromoCode extends PanacheEntityBase {
    @Id
    @Column(length = 40)
    public String code;
    @Column(nullable = false)
    public String title;
    @Column(columnDefinition = "text")
    public String description;
    /** percentage | flat | free_delivery */
    @Column(name = "discount_type", nullable = false, length = 20)
    public String discountType;
    @Column(name = "discount_value", nullable = false)
    public long discountValue;
    @Column(name = "min_spend", nullable = false)
    public long minSpend;
    @Column(name = "max_discount")
    public Long maxDiscount;
    @Column(name = "valid_until", nullable = false)
    public Instant validUntil = Instant.now().plus(365, ChronoUnit.DAYS);
    @Column(name = "is_active", nullable = false)
    public boolean isActive = true;
    @Column(name = "max_redemptions")
    public Integer maxRedemptions;
    @Column(name = "redeemed_count", nullable = false)
    public int redeemedCount;

    /**
     * PRD FR-C.13 / §16.3 — validate against a subtotal, return discount in rupiah.
     * deliveryFeeOnly marks the free-delivery application.
     */
    public long discountFor(long subtotal, long deliveryFee) {
        if (!isActive || Instant.now().isAfter(validUntil)) return 0;
        if (subtotal < minSpend) return 0;
        switch (discountType) {
            case "flat": return Math.min(discountValue, subtotal);
            case "percentage": {
                long d = subtotal * discountValue / 100;
                return maxDiscount != null ? Math.min(d, maxDiscount) : d;
            }
            case "free_delivery": return Math.min(deliveryFee, discountValue);
            default: return 0;
        }
    }
}
