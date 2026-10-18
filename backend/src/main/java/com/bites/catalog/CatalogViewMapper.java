package com.bites.catalog;

import com.bites.order.PromoCode;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;

/** Maps DB entities to the exact JSON shapes the frontend TypeScript types expect. */
@ApplicationScoped
public class CatalogViewMapper {

    public Map<String, Object> restaurantView(Restaurant r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.id);
        m.put("slug", r.slug);
        m.put("name", r.name);
        m.put("tagline", r.tagline);
        m.put("logo", r.logo);
        m.put("banner", r.banner);
        m.put("cuisine", r.cuisineList());
        m.put("rating", r.ratingAvg);
        m.put("reviewCount", r.ratingCount);
        m.put("distanceKm", r.distanceKm);
        m.put("etaMinutes", r.etaMinutes);
        m.put("deliveryFee", r.deliveryFee);
        m.put("minOrder", r.minOrder);
        m.put("address", r.addressDetail);
        m.put("lat", r.lat);
        m.put("lng", r.lng);
        m.put("isOpen", r.isOpen);
        m.put("isBusy", r.isBusy);
        m.put("openingHours", r.openingHours);
        m.put("categories", r.categoryList());
        return m;
    }

    public Map<String, Object> menuItemView(MenuItem item) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", item.id);
        m.put("restaurantId", item.restaurantId);
        m.put("name", item.name);
        m.put("description", item.description);
        m.put("price", item.price);
        m.put("originalPrice", item.originalPrice);
        m.put("category", item.category);
        m.put("image", item.image);
        m.put("isAvailable", item.available);
        m.put("isBestSeller", item.isBestseller);
        m.put("isSpicy", item.isSpicy);

        List<Map<String, Object>> groups = new ArrayList<>();
        List<ModifierGroup> grpList = com.bites.common.Casts.list(ModifierGroup.list("menuItemId", item.id));
        for (ModifierGroup g : grpList) {
            Map<String, Object> gm = new LinkedHashMap<>();
            gm.put("id", g.id);
            gm.put("name", g.name);
            gm.put("required", g.required);
            gm.put("minSelection", g.minSelection);
            gm.put("maxSelection", g.maxSelection);
            List<Map<String, Object>> opts = new ArrayList<>();
            List<Modifier> optList = com.bites.common.Casts.list(Modifier.list("groupId", g.id));
            for (Modifier o : optList) {
                Map<String, Object> om = new LinkedHashMap<>();
                om.put("id", o.id);
                om.put("name", o.name);
                om.put("price", o.price);
                om.put("isDefault", o.isDefault);
                opts.add(om);
            }
            gm.put("options", opts);
            groups.add(gm);
        }
        m.put("modifierGroups", groups);
        return m;
    }

    public Map<String, Object> promoView(PromoCode p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("code", p.code);
        m.put("title", p.title);
        m.put("description", p.description);
        m.put("discountType", p.discountType);
        m.put("discountValue", p.discountValue);
        m.put("minSpend", p.minSpend);
        m.put("maxDiscount", p.maxDiscount);
        m.put("validUntil", String.valueOf(p.validUntil));
        m.put("isActive", p.isActive);
        return m;
    }
}
