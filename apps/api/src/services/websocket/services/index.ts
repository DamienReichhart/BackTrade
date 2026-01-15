/**
 * WebSocket Services
 *
 * Core services for WebSocket authentication and connection management.
 */

export { default as wsAuthService } from "./auth-service";
export type {
    AuthenticationResult,
    AuthenticationSuccess,
    AuthenticationFailure,
} from "./auth-service";

export {
    default as wsConnectionService,
    WsConnectionService,
} from "./connection-service";
export type {
    WsClientConnection,
    WsConnectionServiceConfig,
} from "./connection-service";
