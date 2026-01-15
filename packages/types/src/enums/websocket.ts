import { z } from "zod";

/**
 * WebSocket close codes following RFC 6455 with custom application codes
 *
 * Standard codes (1000-1015): RFC 6455
 * Application codes (4000-4999): Custom application-specific codes
 */
export const WebSocketCloseCode = {
    // Standard codes
    NORMAL_CLOSURE: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    INVALID_PAYLOAD: 1007,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    INTERNAL_ERROR: 1011,

    // Application-specific codes (4000-4999)
    AUTHENTICATION_FAILED: 4001,
    AUTHENTICATION_TIMEOUT: 4002,
    AUTHENTICATION_REQUIRED: 4003,
    TOKEN_EXPIRED: 4004,
    USER_BANNED: 4005,
    INVALID_MESSAGE_FORMAT: 4006,
    RATE_LIMITED: 4007,
    SERVER_SHUTDOWN: 4008,
} as const;

export type WebSocketCloseCode =
    (typeof WebSocketCloseCode)[keyof typeof WebSocketCloseCode];

/**
 * WebSocket connection state values as const object for easy access
 * This matches the existing usage pattern in the codebase
 */
export const WsConnectionState = {
    CONNECTING: "connecting",
    CONNECTED: "connected",
    AUTHENTICATING: "authenticating",
    AUTHENTICATED: "authenticated",
    DISCONNECTING: "disconnecting",
    DISCONNECTED: "disconnected",
} as const;

/**
 * Possible states of a WebSocket connection
 */
export const WsConnectionStateSchema = z.enum([
    WsConnectionState.CONNECTING,
    WsConnectionState.CONNECTED,
    WsConnectionState.AUTHENTICATING,
    WsConnectionState.AUTHENTICATED,
    WsConnectionState.DISCONNECTING,
    WsConnectionState.DISCONNECTED,
]);

/**
 * Type for WebSocket connection state
 */
export type WsConnectionState =
    (typeof WsConnectionState)[keyof typeof WsConnectionState];
