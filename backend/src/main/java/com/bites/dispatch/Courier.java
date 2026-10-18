package com.bites.dispatch;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "couriers")
public class Courier extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    @Column(name = "user_id", length = 40)
    public String userId;
    @Column(nullable = false)
    public String name;
    public String phone;
    @Column(name = "masked_phone")
    public String maskedPhone;
    @Column(nullable = false)
    public String vehicle = "Motor";
    @Column(name = "plate_number")
    public String plateNumber;
    @Column(columnDefinition = "text")
    public String photo;
    @Column(name = "rating_avg", precision = 3, scale = 2)
    public java.math.BigDecimal ratingAvg = java.math.BigDecimal.valueOf(5);
    @Column(name = "trips_completed")
    public int tripsCompleted;
    /** OFFLINE | AVAILABLE | BUSY */
    @Column(nullable = false, length = 20)
    public String status = "OFFLINE";
    @Column(name = "current_lat")
    public double currentLat;
    @Column(name = "current_lng")
    public double currentLng;
    public double heading;

    public static Courier findById(String id) {
        return find("id", id).firstResult();
    }

    public static void setBusy(String id) {
        Courier c = findById(id);
        if (c != null) c.status = "BUSY";
    }
}
