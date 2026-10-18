package com.bites.common;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

public final class Ids {
    private Ids() {}

    public static String uuid() {
        return UUID.randomUUID().toString();
    }

    public static String orderNumber() {
        var d = java.time.LocalDate.now();
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "BTS-" + String.format("%04d%02d%02d", d.getYear(), d.getMonthValue(), d.getDayOfMonth()) + "-" + suffix;
    }

    public static String pin4() {
        return String.format("%04d", new java.security.SecureRandom().nextInt(10000));
    }

    public static String sha512Hex(String input) {
        try {
            var md = MessageDigest.getInstance("SHA-512");
            return HexFormat.of().formatHex(md.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    /** Distance in meters between two lat/lng points (Haversine). */
    public static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
