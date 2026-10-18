package com.bites.admin;

import com.bites.catalog.CatalogViewMapper;
import com.bites.common.Casts;
import com.bites.order.PromoCode;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Admin back-office API (PRD §16.8 / FR-A.4). */
@Path("/api/v1/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminResource {

    @Inject CatalogViewMapper catalog;

    @GET
    @Path("/promos")
    public List<Map<String, Object>> promos() {
        List<Map<String, Object>> out = new ArrayList<>();
        List<PromoCode> all = Casts.list(PromoCode.listAll());
        for (PromoCode p : all) out.add(catalog.promoView(p));
        return out;
    }

    @POST
    @Path("/promos")
    @Transactional
    public Map<String, Object> createPromo(Map<String, Object> body) {
        PromoCode p = new PromoCode();
        p.code = String.valueOf(body.get("code")).toUpperCase();
        p.title = String.valueOf(body.getOrDefault("title", p.code));
        p.description = String.valueOf(body.getOrDefault("description", ""));
        p.discountType = String.valueOf(body.getOrDefault("discountType", "flat"));
        p.discountValue = body.get("discountValue") instanceof Number n ? n.longValue() : 0;
        p.minSpend = body.get("minSpend") instanceof Number n ? n.longValue() : 0;
        p.maxDiscount = body.get("maxDiscount") instanceof Number n ? n.longValue() : null;
        p.validUntil = Instant.parse(String.valueOf(body.getOrDefault("validUntil", "2027-12-31T00:00:00Z")));
        p.isActive = true;
        p.persist();
        return catalog.promoView(p);
    }

    @PATCH
    @Path("/promos/{code}")
    @Transactional
    public Map<String, Object> togglePromo(@PathParam("code") String code, Map<String, Object> body) {
        PromoCode p = PromoCode.findById(code.toUpperCase());
        if (p == null) throw new NotFoundException();
        if (body.containsKey("isActive")) p.isActive = Boolean.TRUE.equals(body.get("isActive"));
        return catalog.promoView(p);
    }

    /** GET /admin/dashboard/operations (FR-A.5 — light KPI snapshot). */
    @GET
    @Path("/dashboard/operations")
    public Map<String, Object> operations() {
        long active = com.bites.order.Order.count("status not in ('DELIVERED','CANCELLED','PAYMENT_FAILED')");
        long couriers = com.bites.dispatch.Courier.count();
        long availableCouriers = com.bites.dispatch.Courier.count("status = 'AVAILABLE'");
        return Map.of("activeOrders", active, "couriers", couriers, "availableCouriers", availableCouriers);
    }
}
