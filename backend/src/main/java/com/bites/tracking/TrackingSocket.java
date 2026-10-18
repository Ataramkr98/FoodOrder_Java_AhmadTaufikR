package com.bites.tracking;

import io.quarkus.websockets.next.*;
import jakarta.inject.Inject;

/** WS /ws/tracking/{orderId} — streams TrackingEvent frames to the customer UI (PRD §14.1, §16.4). */
@WebSocket(path = "/ws/tracking/{orderId}")
public class TrackingSocket {

    @Inject
    TrackingHub hub;

    @OnOpen
    public void onOpen(WebSocketConnection connection) {
        String orderId = connection.pathParam("orderId");
        hub.subscribe(orderId, connection);
    }

    @OnClose
    public void onClose(WebSocketConnection connection) {
        hub.unsubscribe(connection);
    }
}
