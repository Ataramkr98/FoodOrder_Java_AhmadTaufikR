package com.bites.catalog;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "modifier_groups")
public class ModifierGroup extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "menu_item_id", length = 40, nullable = false)
    public String menuItemId;
    @Column(nullable = false)
    public String name;
    public boolean required;
    @Column(name = "min_selection")
    public int minSelection;
    @Column(name = "max_selection")
    public int maxSelection;
    @Column(name = "sort_order")
    public int sortOrder;
}
