/**
 * WebSocket Module
 *
 * Provides WebSocket authentication, connection management,
 * message routing, and message sending utilities.
 *
 * Directory Structure:
 * - services/       - Core services (auth, connection management)
 * - handlers/       - Individual message type handlers
 * - message-router  - Message parsing, validation, and routing
 * - message-sender  - Outbound message utilities
 */

// Services
export {
    wsAuthService,
    wsConnectionService,
    WsConnectionService,
} from "./services";
export type {
    AuthenticationResult,
    AuthenticationSuccess,
    AuthenticationFailure,
    WsClientConnection,
    WsConnectionServiceConfig,
} from "./services";

// Handlers
export {
    wsAuthHandler,
    wsSubscriptionHandler,
    wsHeartbeatHandler,
} from "./handlers";

// Router
export { default as wsMessageRouter } from "./message-router";

// Sender
export { default as wsMessageSender } from "./message-sender";
