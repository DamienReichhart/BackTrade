/**
 * WebSocket Subscription Handler
 *
 * Handles subscribe and unsubscribe messages for channel management.
 */

import {
    WebSocketCloseCode,
    type WsSubscribedMessage,
    type WsUnsubscribedMessage,
} from "@backtrade/types";
import { BaseService } from "../../base/base-service";
import { wsConnectionService, type WsClientConnection } from "../services";
import wsMessageSender from "../message-sender";

/**
 * Subscription Handler
 *
 * Responsibilities:
 * - Process subscribe messages
 * - Process unsubscribe messages
 * - Channel authorization (extensible)
 */
class WsSubscriptionHandler extends BaseService {
    constructor() {
        super("ws-subscription-handler");
    }

    /**
     * Handle channel subscription request
     *
     * @param connection - Client connection
     * @param channel - Channel name to subscribe to
     * @param params - Optional subscription parameters
     */
    handleSubscribe(
        connection: WsClientConnection,
        channel: string,
        _params?: Record<string, unknown>
    ): void {
        const { connectionId, socket, user } = connection;

        // TODO: Add channel authorization logic here
        // For example, check if user has permission to subscribe to this channel
        // const authorized = await this.authorizeChannel(user, channel, params);

        const success = wsConnectionService.subscribe(connectionId, channel);

        if (success) {
            const response: WsSubscribedMessage = {
                type: "subscribed",
                payload: { channel },
            };
            wsMessageSender.send(socket, response);

            this.logger.debug(
                { connectionId, userId: user?.id, channel },
                "Client subscribed to channel"
            );
        } else {
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.AUTHENTICATION_REQUIRED,
                "Subscription failed"
            );
        }
    }

    /**
     * Handle channel unsubscription request
     *
     * @param connection - Client connection
     * @param channel - Channel name to unsubscribe from
     */
    handleUnsubscribe(connection: WsClientConnection, channel: string): void {
        const { connectionId, socket, user } = connection;

        wsConnectionService.unsubscribe(connectionId, channel);

        const response: WsUnsubscribedMessage = {
            type: "unsubscribed",
            payload: { channel },
        };
        wsMessageSender.send(socket, response);

        this.logger.debug(
            { connectionId, userId: user?.id, channel },
            "Client unsubscribed from channel"
        );
    }
}

export default new WsSubscriptionHandler();
