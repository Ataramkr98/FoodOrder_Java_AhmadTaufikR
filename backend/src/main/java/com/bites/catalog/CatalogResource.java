package com.bites.catalog;

import com.bites.common.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.*;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
public class CatalogResource {

    @Inject
    CatalogViewMapper mapper;

    /** GET /restaurants?lat=&lng=&q= — frontend Restaurant shape. */
    @GET
    @Path("/restaurants")
    public ApiResponse<List<Map<String, Object>>> restaurants(@QueryParam("q") String q) {
        List<Restaurant> all = q == null || q.isBlank()
                ? Restaurant.listAllOpen()
                : Restaurant.list("lower(name) like ?1 and isOpen", "%" + q.toLowerCase() + "%");
        List<Map<String, Object>> out = new ArrayList<>();
        for (Restaurant r : all) out.add(mapper.restaurantView(r));
        return ApiResponse.ok(out, "OK");
    }

    /** GET /restaurants/{slugOrId} */
    @GET
    @Path("/restaurants/{key}")
    public ApiResponse<Map<String, Object>> restaurant(@PathParam("key") String key) {
        Restaurant r = Restaurant.findBySlug(key);
        if (r == null) r = Restaurant.findById(key);
        if (r == null) throw new NotFoundException("Restaurant not found: " + key);
        return ApiResponse.ok(mapper.restaurantView(r), "OK");
    }

    /** GET /restaurants/{slugOrId}/menu — frontend MenuItem shape incl. modifierGroups. */
    @GET
    @Path("/restaurants/{key}/menu")
    public ApiResponse<List<Map<String, Object>>> menu(@PathParam("key") String key) {
        Restaurant r = Restaurant.findBySlug(key);
        if (r == null) r = Restaurant.findById(key);
        if (r == null) throw new NotFoundException("Restaurant not found: " + key);
        List<Map<String, Object>> out = new ArrayList<>();
        for (MenuItem item : MenuItem.byRestaurant(r.id)) {
            out.add(mapper.menuItemView(item));
        }
        return ApiResponse.ok(out, "OK");
    }

    /** GET /menu-items/{id} — single item with modifiers. */
    @GET
    @Path("/menu-items/{id}")
    public ApiResponse<Map<String, Object>> menuItem(@PathParam("id") String id) {
        MenuItem item = MenuItem.findById(id);
        if (item == null) throw new NotFoundException("Menu item not found: " + id);
        return ApiResponse.ok(mapper.menuItemView(item), "OK");
    }

    /** GET /promos — frontend PromoCode shape. */
    @GET
    @Path("/promos")
    public ApiResponse<List<Map<String, Object>>> promos() {
        List<Map<String, Object>> out = new ArrayList<>();
        List<com.bites.order.PromoCode> all = com.bites.common.Casts.list(com.bites.order.PromoCode.listAll());
        for (com.bites.order.PromoCode p : all) {
            if (p.isActive) out.add(mapper.promoView(p));
        }
        return ApiResponse.ok(out, "OK");
    }
}
