package com.bites.payment;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "order_id", length = 40, nullable = false)
    public String orderId;
    @Column(nullable = false, length = 20)
    public String provider = "MIDTRANS";
    @Column(name = "external_id", length = 120)
    public String externalId;
    @Column(name = "method", length = 40)
    public String method;
    /** PENDING | PAID | FAILED | EXPIRED | REFUNDED */
    @Column(nullable = false, length = 20)
    public String status = "PENDING";
    @Column(nullable = false)
    public long amount;
    @Column(name = "qr_string", columnDefinition = "text")
    public String qrString;
    @Column(name = "va_number", length = 40)
    public String vaNumber;
    @Column(name = "created_at", nullable = false)
    public Instant createdAt = Instant.now();
    @Column(name = "paid_at")
    public Instant paidAt;

    public static Payment findByOrderId(String orderId) {
        return find("orderId", orderId).firstResult();
    }

    public static Payment findByExternalId(String provider, String externalId) {
        return find("provider = ?1 and externalId = ?2", provider, externalId).firstResult();
    }
}
