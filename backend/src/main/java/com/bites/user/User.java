package com.bites.user;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
    @Id
    @Column(name = "id", length = 40)
    public String id;
    public String email;
    public String phone;
    @Column(name = "display_name", nullable = false)
    public String displayName;
    @Column(name = "password_hash")
    public String passwordHash;
    @Column(nullable = false, length = 20)
    public String role; // CUSTOMER | RESTAURANT_OWNER | COURIER | ADMIN

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
