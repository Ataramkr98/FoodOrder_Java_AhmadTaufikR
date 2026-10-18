package com.bites.order;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "order_events")
public class OrderEvent extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "order_id", length = 40, nullable = false)
    public String orderId;
    @Column(name = "from_status", length = 30)
    public String fromStatus;
    @Column(name = "to_status", nullable = false, length = 30)
    public String toStatus;
    @Column(nullable = false, length = 20)
    public String actor;
    @Column(columnDefinition = "text")
    public String reason;
    @Column(nullable = false)
    public Instant at = Instant.now();

    public static OrderEvent create(String orderId, String from, String to, String actor, String reason) {
        OrderEvent e = new OrderEvent();
        e.id = com.bites.common.Ids.uuid();
        e.orderId = orderId;
        e.fromStatus = from;
        e.toStatus = to;
        e.actor = actor;
        e.reason = reason;
        return e;
    }
}
