package com.bites.catalog;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "restaurants")
public class Restaurant extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "owner_id", length = 40)
    public String ownerId;
    @Column(nullable = false)
    public String name;
    @Column(nullable = false)
    public String slug;
    @Column(columnDefinition = "text")
    public String tagline;
    @Column(columnDefinition = "text")
    public String logo;
    @Column(columnDefinition = "text")
    public String banner;
    @Column(nullable = false, columnDefinition = "text")
    public String cuisine;
    @Column(name = "rating_avg", precision = 3, scale = 2)
    public java.math.BigDecimal ratingAvg = java.math.BigDecimal.ZERO;
    @Column(name = "rating_count")
    public int ratingCount;
    @Column(name = "distance_km")
    public double distanceKm;
    @Column(name = "eta_minutes")
    public int etaMinutes;
    @Column(name = "delivery_fee")
    public long deliveryFee;
    @Column(name = "min_order")
    public long minOrder;
    @Column(name = "address_detail", nullable = false, columnDefinition = "text")
    public String addressDetail;
    public double lat;
    public double lng;
    @Column(name = "is_open")
    public boolean isOpen;
    @Column(name = "is_busy")
    public boolean isBusy;
    @Column(name = "opening_hours")
    public String openingHours;
    @Column(nullable = false, columnDefinition = "text")
    public String categories;

    public static Restaurant findById(String id) {
        return find("id", id).firstResult();
    }

    public static Restaurant findBySlug(String slug) {
        return find("slug", slug).firstResult();
    }

    public static List<Restaurant> listAllOpen() {
        return list("isOpen", true);
    }

    public List<String> cuisineList() {
        return Arrays.stream(cuisine.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    public List<String> categoryList() {
        return Arrays.stream(categories.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
