package com.bites.common;

import jakarta.persistence.*;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;

@Entity
@Table(name = "idempotency_keys")
public class IdempotencyKey extends PanacheEntityBase {
    @Id
    @Column(name = "key")
    public String key;
    @Column(name = "method", nullable = false, length = 10)
    public String method;
    @Column(name = "path", nullable = false)
    public String path;
    @Column(name = "response_body", columnDefinition = "text")
    public String responseBody;
    @Column(name = "created_at")
    public java.time.Instant createdAt = java.time.Instant.now();
}
