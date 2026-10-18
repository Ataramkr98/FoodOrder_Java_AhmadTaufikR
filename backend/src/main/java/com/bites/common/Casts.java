package com.bites.common;

import java.util.List;

/** Casting helpers for Quarkus Panache static query methods (raw generics in dev mode). */
public final class Casts {
    private Casts() {}

    @SuppressWarnings("unchecked")
    public static <T> List<T> list(List<?> raw) {
        return (List<T>) raw;
    }

    @SuppressWarnings("unchecked")
    public static <T> T one(Object raw) {
        return (T) raw;
    }
}