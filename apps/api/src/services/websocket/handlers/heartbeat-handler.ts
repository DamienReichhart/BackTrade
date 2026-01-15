/**
 * WebSocket Heartbeat Handler
 *
 * Handles ping/pong messages for connection health monitoring.
 */

import type { WsPongMessage } from "@backtrade/types";
import { BaseService } from "../../base/base-service";
import type { WsClientConnection } from "../services";
import wsMessageSender from "../message-sender";

/**
 * Heartbeat Handler
 *
 * Responsibilities:
 * - Process ping messages
 * - Send pong responses with server timestamp
 */
class WsHeartbeatHandler extends BaseService {
    constructor() {
        super("ws-heartbeat-handler");
    }

    /**
     * Handle ping/heartbeat message
     *
     * @param connection - Client connection
     * @param clientTimestamp - Client's timestamp from ping message
     */
    handlePing(connection: WsClientConnection, clientTimestamp: number): void {
        const response: WsPongMessage = {
            type: "pong",
            payload: {
                timestamp: clientTimestamp,
                serverTime: Date.now(),
            },
        };
        wsMessageSender.send(connection.socket, response);
    }
}

export default new WsHeartbeatHandler();
