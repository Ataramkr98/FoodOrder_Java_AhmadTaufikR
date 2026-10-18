package com.bites.tracking;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/** In-memory fan-out hub: orderId -> subscriber connections (PRD §10.8 TrackingHub). */
@ApplicationScoped
public class TrackingHub {

    private final Map<String, List<WebSocketConnection>> subscribers = new ConcurrentHashMap<>();

    public void subscribe(String orderId, WebSocketConnection conn) {
        subscribers.computeIfAbsent(orderId, k -> new CopyOnWriteArrayList<>()).add(conn);
    }

    public void unsubscribe(WebSocketConnection conn) {
        subscribers.values().forEach(list -> list.remove(conn));
    }

    public void broadcast(String orderId, String json) {
        List<WebSocketConnection> conns = subscribers.get(orderId);
        if (conns == null) return;
        for (WebSocketConnection c : List.copyOf(conns)) {
            if (c.isOpen()) c.sendText(json).subscribeAsCompletionStage().exceptionally(ex -> null);
            else unsubscribe(c);
        }
    }

    public void broadcastStatus(String orderId, com.bites.order.OrderStatus from,
                                com.bites.order.OrderStatus to, Integer etaMinutes) {
        broadcast(orderId, String.format(
                "{\"type\":\"order_status\",\"orderId\":\"%s\",\"from\":%s,\"to\":\"%s\",\"at\":%d,\"etaSeconds\":%s}",
                orderId,
                from == null ? "null" : "\"" + from.name() + "\"",
                to.name(), System.currentTimeMillis(),
                etaMinutes == null ? "null" : etaMinutes * 60));
    }

    public void broadcastCourierAssigned(String orderId, com.bites.dispatch.Courier c) {
        broadcast(orderId, String.format(
                "{\"type\":\"courier_assigned\",\"courier\":{\"id\":\"%s\",\"name\":\"%s\",\"vehicle\":\"%s\",\"phoneMasked\":\"%s\",\"location\":{\"lat\":%f,\"lng\":%f}}}",
                c.id, c.name, c.vehicle, c.maskedPhone, c.currentLat, c.currentLng));
    }

    public void broadcastLocation(String orderId, double lat, double lng, double heading, long ts) {
        broadcast(orderId, String.format(
                "{\"type\":\"courier_location\",\"lat\":%f,\"lng\":%f,\"heading\":%f,\"ts\":%d}",
                lat, lng, heading, ts));
    }

    public void broadcastEta(String orderId, int etaSeconds) {
        broadcast(orderId, String.format(
                "{\"type\":\"eta_update\",\"etaSeconds\":%d}", etaSeconds));
    }

    public void broadcastEnded(String orderId) {
        broadcast(orderId, "{\"type\":\"tracking_ended\"}");
    }
}
