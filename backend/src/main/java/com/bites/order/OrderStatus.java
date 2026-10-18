package com.bites.order;

import java.util.Map;
import java.util.Set;

/** Order status — string values match the frontend type exactly (PRD §12). */
public enum OrderStatus {
    PENDING, AWAITING_RESTAURANT, ACCEPTED, PREPARING, READY_FOR_PICKUP,
    COURIER_ASSIGNED, EN_ROUTE_TO_PICKUP, ARRIVED_AT_PICKUP, PICKED_UP,
    EN_ROUTE_TO_DROP, ARRIVED_AT_DROP, DELIVERED, CANCELLED, PAYMENT_FAILED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID = Map.ofEntries(
            Map.entry(PENDING, Set.of(AWAITING_RESTAURANT, PAYMENT_FAILED, CANCELLED)),
            Map.entry(PAYMENT_FAILED, Set.of()),
            Map.entry(AWAITING_RESTAURANT, Set.of(ACCEPTED, CANCELLED)),
            Map.entry(ACCEPTED, Set.of(PREPARING, CANCELLED)),
            Map.entry(PREPARING, Set.of(READY_FOR_PICKUP, CANCELLED)),
            Map.entry(READY_FOR_PICKUP, Set.of(COURIER_ASSIGNED, CANCELLED)),
            Map.entry(COURIER_ASSIGNED, Set.of(EN_ROUTE_TO_PICKUP, CANCELLED)),
            Map.entry(EN_ROUTE_TO_PICKUP, Set.of(ARRIVED_AT_PICKUP, PICKED_UP, CANCELLED)),
            Map.entry(ARRIVED_AT_PICKUP, Set.of(PICKED_UP, CANCELLED)),
            Map.entry(PICKED_UP, Set.of(EN_ROUTE_TO_DROP, ARRIVED_AT_DROP)),
            Map.entry(EN_ROUTE_TO_DROP, Set.of(ARRIVED_AT_DROP, DELIVERED)),
            Map.entry(ARRIVED_AT_DROP, Set.of(DELIVERED)),
            Map.entry(DELIVERED, Set.of()),
            Map.entry(CANCELLED, Set.of())
    );

    public boolean canTransitionTo(OrderStatus to) {
        return VALID.getOrDefault(this, Set.of()).contains(to);
    }

    public static boolean terminal(OrderStatus s) {
        return s == DELIVERED || s == CANCELLED || s == PAYMENT_FAILED;
    }
}
