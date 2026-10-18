package com.bites.order;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "order_id", length = 40, nullable = false)
    public String orderId;
    @Column(name = "menu_item_id", length = 40)
    public String menuItemId;
    @Column(name = "name_snapshot", nullable = false)
    public String nameSnapshot;
    @Column(name = "image_snapshot", columnDefinition = "text")
    public String imageSnapshot;
    @Column(name = "unit_price", nullable = false)
    public long unitPrice;
    @Column(name = "quantity", nullable = false)
    public int quantity;
    /** JSON array of {groupId, groupName, optionId, optionName, price} — frontend SelectedModifier shape. */
    @Column(name = "modifiers_json", columnDefinition = "text")
    public String modifiersJson;
    @Column(columnDefinition = "text")
    public String notes;
    @Column(name = "line_total", nullable = false)
    public long lineTotal;
}
