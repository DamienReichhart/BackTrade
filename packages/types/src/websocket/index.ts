import { z } from "zod";
import {
    WebSocketCloseCode,
    WsConnectionState,
    type WsConnectionState as WsConnectionStateType,
} from "../enums/websocket";

/**
 * WebSocket Message Types
 *
 * Defines all possible message types for WebSocket communication.
 * Using discriminated unions for type-safe message handling.
 */

// Re-export WebSocket enums for convenience
export { WebSocketCloseCode, WsConnectionState };
export type { WsConnectionStateType };

// ============================================================================
// CLIENT MESSAGE TYPES (Client -> Server)
// ============================================================================

/**
 * Authentication message - sent by client to authenticate the connection
 */
export const WsAuthenticateMessageSchema = z.object({
    type: z.literal("authenticate"),
    payload: z.object({
        token: z.string().min(1, "Token is required"),
    }),
});
export type WsAuthenticateMessage = z.infer<typeof WsAuthenticateMessageSchema>;

/**
 * Heartbeat/Ping message - sent by client to keep connection alive
 */
export const WsPingMessageSchema = z.object({
    type: z.literal("ping"),
    payload: z.object({
        timestamp: z.number(),
    }),
});
export type WsPingMessage = z.infer<typeof WsPingMessageSchema>;

/**
 * Token refresh message - sent when client has a new access token
 */
export const WsRefreshTokenMessageSchema = z.object({
    type: z.literal("refresh_token"),
    payload: z.object({
        token: z.string().min(1, "Token is required"),
    }),
});
export type WsRefreshTokenMessage = z.infer<typeof WsRefreshTokenMessageSchema>;

/**
 * Subscribe to a channel/topic
 */
export const WsSubscribeMessageSchema = z.object({
    type: z.literal("subscribe"),
    payload: z.object({
        channel: z.string().min(1),
        params: z.record(z.string(), z.unknown()).optional(),
    }),
});
export type WsSubscribeMessage = z.infer<typeof WsSubscribeMessageSchema>;

/**
 * Unsubscribe from a channel/topic
 */
export const WsUnsubscribeMessageSchema = z.object({
    type: z.literal("unsubscribe"),
    payload: z.object({
        channel: z.string().min(1),
    }),
});
export type WsUnsubscribeMessage = z.infer<typeof WsUnsubscribeMessageSchema>;

/**
 * Union of all client message types
 */
export const WsClientMessageSchema = z.discriminatedUnion("type", [
    WsAuthenticateMessageSchema,
    WsPingMessageSchema,
    WsRefreshTokenMessageSchema,
    WsSubscribeMessageSchema,
    WsUnsubscribeMessageSchema,
]);
export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;

// ============================================================================
// SERVER MESSAGE TYPES (Server -> Client)
// ============================================================================

/**
 * Connection established acknowledgment
 */
export const WsConnectedMessageSchema = z.object({
    type: z.literal("connected"),
    payload: z.object({
        connectionId: z.string(),
        timestamp: z.number(),
        authTimeoutMs: z.number(),
    }),
});
export type WsConnectedMessage = z.infer<typeof WsConnectedMessageSchema>;

/**
 * Authentication successful response
 */
export const WsAuthenticatedMessageSchema = z.object({
    type: z.literal("authenticated"),
    payload: z.object({
        userId: z.number(),
        expiresAt: z.number(),
    }),
});
export type WsAuthenticatedMessage = z.infer<
    typeof WsAuthenticatedMessageSchema
>;

/**
 * Heartbeat/Pong response
 */
export const WsPongMessageSchema = z.object({
    type: z.literal("pong"),
    payload: z.object({
        timestamp: z.number(),
        serverTime: z.number(),
    }),
});
export type WsPongMessage = z.infer<typeof WsPongMessageSchema>;

/**
 * Token refreshed confirmation
 */
export const WsTokenRefreshedMessageSchema = z.object({
    type: z.literal("token_refreshed"),
    payload: z.object({
        expiresAt: z.number(),
    }),
});
export type WsTokenRefreshedMessage = z.infer<
    typeof WsTokenRefreshedMessageSchema
>;

/**
 * Subscription confirmed
 */
export const WsSubscribedMessageSchema = z.object({
    type: z.literal("subscribed"),
    payload: z.object({
        channel: z.string(),
    }),
});
export type WsSubscribedMessage = z.infer<typeof WsSubscribedMessageSchema>;

/**
 * Unsubscription confirmed
 */
export const WsUnsubscribedMessageSchema = z.object({
    type: z.literal("unsubscribed"),
    payload: z.object({
        channel: z.string(),
    }),
});
export type WsUnsubscribedMessage = z.infer<typeof WsUnsubscribedMessageSchema>;

/**
 * Error response
 */
export const WsErrorMessageSchema = z.object({
    type: z.literal("error"),
    payload: z.object({
        code: z.number(),
        message: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
});
export type WsErrorMessage = z.infer<typeof WsErrorMessageSchema>;

/**
 * Generic data message for channel broadcasts
 */
export const WsDataMessageSchema = z.object({
    type: z.literal("data"),
    payload: z.object({
        channel: z.string(),
        data: z.unknown(),
    }),
});
export type WsDataMessage = z.infer<typeof WsDataMessageSchema>;

/**
 * Union of all server message types
 */
export const WsServerMessageSchema = z.discriminatedUnion("type", [
    WsConnectedMessageSchema,
    WsAuthenticatedMessageSchema,
    WsPongMessageSchema,
    WsTokenRefreshedMessageSchema,
    WsSubscribedMessageSchema,
    WsUnsubscribedMessageSchema,
    WsErrorMessageSchema,
    WsDataMessageSchema,
]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;

// ============================================================================
// CONNECTION STATE
// ============================================================================

// Connection state types are exported from enums/websocket.ts

/**
 * Authenticated client connection information
 *
 * Note: subscriptions is typed as string[] for schema validation,
 * but implemented as Set<string> at runtime for O(1) lookups.
 */
export const WsAuthenticatedConnectionSchema = z.object({
    connectionId: z.string(),
    userId: z.number(),
    authenticatedAt: z.number(),
    tokenExpiresAt: z.number(),
    subscriptions: z.array(z.string()),
});

/**
 * Runtime type for authenticated connection with Set for subscriptions
 */
export interface WsAuthenticatedConnection {
    connectionId: string;
    userId: number;
    authenticatedAt: number;
    tokenExpiresAt: number;
    subscriptions: Set<string>;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Extract the type string from a message schema
 */
export type WsClientMessageType = WsClientMessage["type"];
export type WsServerMessageType = WsServerMessage["type"];
