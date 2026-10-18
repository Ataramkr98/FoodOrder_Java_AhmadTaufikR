package com.bites.common;

import com.fasterxml.jackson.databind.ObjectMapper;

/** Tiny JSON helper (for storing response snapshots in the idempotency table). */
public final class Json {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Json() {}

    public static String toJson(Object o) {
        try {
            return MAPPER.writeValueAsString(o);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}