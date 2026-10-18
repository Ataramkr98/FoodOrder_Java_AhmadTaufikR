package com.bites.order;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import static org.junit.jupiter.api.Assertions.*;

public class PromoCodeTest {
    private PromoCode promo(String type, long value, long min, Long max) {
        PromoCode p = new PromoCode();
        p.code = "TEST";
        p.title = "Test";
        p.discountType = type;
        p.discountValue = value;
        p.minSpend = min;
        p.maxDiscount = max;
        p.isActive = true;
        p.validUntil = Instant.now().plus(30, ChronoUnit.DAYS);
        return p;
    }

    @Test
    public void flatCappedBySubtotal() {
        assertEquals(15000, promo("flat", 15000, 50000, null).discountFor(60000, 8000));
        assertEquals(10000, promo("flat", 15000, 0, null).discountFor(10000, 8000));
    }

    @Test
    public void percentageRespectsMax() {
        assertEquals(20000, promo("percentage", 20, 40000, 25000L).discountFor(100000, 8000));
        assertEquals(25000, promo("percentage", 50, 30000, 25000L).discountFor(100000, 8000));
    }

    @Test
    public void freeDeliveryReturnsFee() {
        assertEquals(8000, promo("free_delivery", 10000, 0, null).discountFor(50000, 8000));
    }

    @Test
    public void belowMinSpendGivesZero() {
        assertEquals(0, promo("flat", 15000, 50000, null).discountFor(30000, 8000));
    }
}
