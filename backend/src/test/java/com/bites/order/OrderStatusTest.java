package com.bites.order;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class OrderStatusTest {
    @Test
    public void pendingGoesToAwaitingOrCancelledOnly() {
        assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.AWAITING_RESTAURANT));
        assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED));
        assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.DELIVERED));
        assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.ACCEPTED));
    }

    @Test
    public void deliveredIsTerminal() {
        for (OrderStatus s : OrderStatus.values()) {
            assertFalse(OrderStatus.DELIVERED.canTransitionTo(s), "DELIVERED should not go to " + s);
        }
    }

    @Test
    public void kitchenFlowIsOrdered() {
        assertTrue(OrderStatus.AWAITING_RESTAURANT.canTransitionTo(OrderStatus.ACCEPTED));
        assertTrue(OrderStatus.ACCEPTED.canTransitionTo(OrderStatus.PREPARING));
        assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY_FOR_PICKUP));
    }
}
