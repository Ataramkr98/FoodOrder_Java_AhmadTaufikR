package com.bites.catalog;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "modifiers")
public class Modifier extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "group_id", length = 40, nullable = false)
    public String groupId;
    @Column(nullable = false)
    public String name;
    @Column(nullable = false)
    public long price;
    @Column(name = "is_default")
    public boolean isDefault;
    public boolean available = true;
    @Column(name = "sort_order")
    public int sortOrder;
}
