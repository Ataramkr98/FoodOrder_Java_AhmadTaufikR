package com.bites.catalog;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "menu_items")
public class MenuItem extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "restaurant_id", length = 40, nullable = false)
    public String restaurantId;
    @Column(nullable = false)
    public String category;
    @Column(nullable = false)
    public String name;
    @Column(columnDefinition = "text")
    public String description;
    @Column(nullable = false)
    public long price;
    @Column(name = "original_price")
    public Long originalPrice;
    @Column(columnDefinition = "text")
    public String image;
    public boolean available = true;
    @Column(name = "is_bestseller")
    public boolean isBestseller;
    @Column(name = "is_spicy")
    public boolean isSpicy;
    @Column(name = "sort_order")
    public int sortOrder;
    @Column(name = "created_at")
    public Instant createdAt = Instant.now();
    @Column(name = "updated_at")
    public Instant updatedAt = Instant.now();

    public static List<MenuItem> byRestaurant(String restaurantId) {
        return list("restaurantId", restaurantId);
    }
}
