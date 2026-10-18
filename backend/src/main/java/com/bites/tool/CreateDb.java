package com.bites.tool;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/** One-off helper: creates the bites database if it does not exist (used before first Flyway run). */
public class CreateDb {
    public static void main(String[] args) throws Exception {
        String host = env("DB_HOST", "localhost");
        String port = env("DB_PORT", "5432");
        String db = env("DB_DATABASE", "bites");
        String user = env("DB_USERNAME", "postgres");
        String pass = env("DB_PASSWORD", "admin");
        String url = String.format("jdbc:postgresql://%s:%s/postgres", host, port);
        try (Connection c = DriverManager.getConnection(url, user, pass); Statement st = c.createStatement()) {
            var rs = st.executeQuery("SELECT 1 FROM pg_database WHERE datname = '" + db + "'");
            if (rs.next()) {
                System.out.println("Database '" + db + "' already exists");
            } else {
                st.executeUpdate("CREATE DATABASE " + db);
                System.out.println("Database '" + db + "' created");
            }
        }
    }

    private static String env(String k, String d) {
        String v = System.getenv(k);
        return v == null || v.isBlank() ? d : v;
    }
}
