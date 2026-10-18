package com.bites.user;

import com.bites.common.Ids;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = "bites")
    String issuer;

    public record RegisterReq(String email, String phone, String password, String displayName) {}
    public record LoginReq(String email, String password) {}

    public record UserView(String userId, String displayName, String email, String role, String accessToken) {}

    private String token(User u) {
        return Jwt.issuer(issuer)
                .upn(u.id)
                .subject(u.id)
                .groups(Set.of(u.role))
                .expiresIn(Duration.ofHours(24))
                .sign();
    }

    private static UserView view(User u) {
        return new UserView(u.id, u.displayName, u.email, u.role, null);
    }

    @POST
    @Path("/register")
    public Response register(RegisterReq req) {
        if (req.email() == null || req.password() == null || User.findByEmail(req.email()) != null) {
            throw new IllegalArgumentException("Email invalid or already registered");
        }
        User u = new User();
        u.id = Ids.uuid();
        u.email = req.email();
        u.phone = req.phone();
        u.displayName = req.displayName() != null ? req.displayName() : "Customer";
        u.passwordHash = hash(req.password());
        u.role = "CUSTOMER";
        u.persist();
        return Response.ok(new UserView(u.id, u.displayName, u.email, u.role, token(u))).build();
    }

    @POST
    @Path("/login")
    public Response login(LoginReq req) {
        User u = User.findByEmail(req.email());
        if (u == null || !hash(req.password()).equals(u.passwordHash)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "Invalid credentials")).build();
        }
        return Response.ok(new UserView(u.id, u.displayName, u.email, u.role, token(u))).build();
    }

    /**
     * Demo login: ensures the seeded demo accounts exist and returns tokens for all roles.
     * Used by the frontend portals (no auth UI in v1 demo).
     */
    @POST
    @Path("/demo")
    public Response demo() {
        User cust = User.findByEmail("demo@bites.co.id");
        User courier = User.findByEmail("rio@bites.co.id");
        User admin = User.findByEmail("admin@bites.co.id");
        return Response.ok(Map.of(
                "customer", Map.of("userId", cust.id, "displayName", cust.displayName, "accessToken", token(cust)),
                "courier", Map.of("userId", courier.id, "displayName", courier.displayName, "accessToken", token(courier)),
                "admin", Map.of("userId", admin.id, "displayName", admin.displayName, "accessToken", token(admin))
        )).build();
    }

    /** Dev-only: passwords are stored as sha512 for demo purposes (prod would use Argon2id per PRD §17). */
    private String hash(String password) {
        return Ids.sha512Hex("bites-salt:" + password);
    }
}
