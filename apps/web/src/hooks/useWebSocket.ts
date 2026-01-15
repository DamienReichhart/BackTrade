/**
 * WebSocket Hook
 *
 * Provides authenticated WebSocket connection management for React components.
 * Handles connection lifecycle, authentication, token refresh, and reconnection.
 *
 * Features:
 * - Automatic authentication on connect
 * - Token refresh before expiration
 * - Automatic reconnection with exponential backoff
 * - Heartbeat mechanism to detect stale connections
 * - Channel subscription management
 * - Type-safe message handling
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     state,
 *     subscribe,
 *     unsubscribe,
 *     sendMessage,
 *   } = useWebSocket({
 *     onData: (channel, data) => {
 *       console.log(`Received on ${channel}:`, data);
 *     },
 *   });
 *
 *   useEffect(() => {
 *     subscribe('updates');
 *     return () => unsubscribe('updates');
 *   }, [subscribe, unsubscribe]);
 *
 *   return <div>Status: {state}</div>;
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth";
import {
    WsConnectionState,
    type WsClientMessage,
    type WsServerMessage,
} from "@backtrade/types";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get WebSocket URL from environment or default
 */
function getWebSocketUrl(): string {
    const apiUrl =
        import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";
    // Convert HTTP URL to WebSocket URL
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const urlWithoutProtocol = apiUrl.replace(/^https?:\/\//, "");
    // Remove /api/v1 suffix if present
    const baseUrl = urlWithoutProtocol.replace(/\/api\/v\d+$/, "");
    return `${wsProtocol}://${baseUrl}`;
}

/**
 * WebSocket configuration
 */
interface WebSocketConfig {
    /** Ping interval in milliseconds */
    pingIntervalMs: number;
    /** Time before token expiration to trigger refresh (ms) */
    tokenRefreshBufferMs: number;
    /** Initial reconnection delay (ms) */
    initialReconnectDelayMs: number;
    /** Maximum reconnection delay (ms) */
    maxReconnectDelayMs: number;
    /** Maximum reconnection attempts (0 for unlimited) */
    maxReconnectAttempts: number;
}

const DEFAULT_CONFIG: WebSocketConfig = {
    pingIntervalMs: 25_000, // 25 seconds
    tokenRefreshBufferMs: 60_000, // Refresh 1 minute before expiration
    initialReconnectDelayMs: 1_000, // Start at 1 second
    maxReconnectDelayMs: 30_000, // Max 30 seconds
    maxReconnectAttempts: 0, // Unlimited
};

// ============================================================================
// HOOK OPTIONS
// ============================================================================

/**
 * Options for useWebSocket hook
 */
export interface UseWebSocketOptions {
    /** Called when connection state changes */
    onStateChange?: (state: WsConnectionState) => void;
    /** Called when data is received on a subscribed channel */
    onData?: (channel: string, data: unknown) => void;
    /** Called when an error occurs */
    onError?: (code: number, message: string) => void;
    /** Called when successfully authenticated */
    onAuthenticated?: (userId: number) => void;
    /** Called when connection is lost */
    onDisconnect?: (code: number, reason: string) => void;
    /** Auto-connect on mount (default: true) */
    autoConnect?: boolean;
    /** Custom configuration */
    config?: Partial<WebSocketConfig>;
}

/**
 * Return type for useWebSocket hook
 */
export interface UseWebSocketReturn {
    /** Current connection state */
    state: WsConnectionState;
    /** Whether the connection is authenticated */
    isAuthenticated: boolean;
    /** Whether the connection is connecting or reconnecting */
    isConnecting: boolean;
    /** Connect to WebSocket server */
    connect: () => void;
    /** Disconnect from WebSocket server */
    disconnect: () => void;
    /** Subscribe to a channel */
    subscribe: (channel: string, params?: Record<string, unknown>) => void;
    /** Unsubscribe from a channel */
    unsubscribe: (channel: string) => void;
    /** Check if subscribed to a channel */
    isSubscribed: (channel: string) => boolean;
    /** Get all active subscriptions */
    subscriptions: Set<string>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * WebSocket hook for authenticated real-time communication
 */
export function useWebSocket(
    options: UseWebSocketOptions = {}
): UseWebSocketReturn {
    const {
        onStateChange,
        onData,
        onError,
        onAuthenticated,
        onDisconnect,
        autoConnect = true,
        config: userConfig,
    } = options;

    const config = { ...DEFAULT_CONFIG, ...userConfig };

    // Auth store access
    const accessToken = useAuthStore((state) => state.accessToken);

    // State
    const [state, setState] = useState<WsConnectionState>(
        WsConnectionState.DISCONNECTED
    );
    const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());

    // Refs for mutable values
    const socketRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const tokenExpiresAtRef = useRef<number | null>(null);
    const pendingSubscriptionsRef = useRef<Set<string>>(new Set());
    const isManualDisconnectRef = useRef(false);
    // Ref to hold connect function for use in handleClose
    const connectRef = useRef<() => void>(() => {});

    // Update state with callback
    const updateState = useCallback(
        (newState: WsConnectionState) => {
            setState(newState);
            onStateChange?.(newState);
        },
        [onStateChange]
    );

    // Clear all intervals and timeouts
    const clearTimers = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        if (tokenRefreshTimeoutRef.current) {
            clearTimeout(tokenRefreshTimeoutRef.current);
            tokenRefreshTimeoutRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    // Send a message to the server
    const sendMessage = useCallback((message: WsClientMessage) => {
        const socket = socketRef.current;
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    // Schedule token refresh
    const scheduleTokenRefresh = useCallback(
        (expiresAt: number) => {
            tokenExpiresAtRef.current = expiresAt;

            // Clear existing timeout
            if (tokenRefreshTimeoutRef.current) {
                clearTimeout(tokenRefreshTimeoutRef.current);
            }

            const timeUntilRefresh =
                expiresAt - Date.now() - config.tokenRefreshBufferMs;

            if (timeUntilRefresh > 0) {
                tokenRefreshTimeoutRef.current = setTimeout(() => {
                    // Get fresh token from store
                    const currentToken = useAuthStore.getState().accessToken;
                    if (currentToken) {
                        sendMessage({
                            type: "refresh_token",
                            payload: { token: currentToken },
                        });
                    }
                }, timeUntilRefresh);
            }
        },
        [config.tokenRefreshBufferMs, sendMessage]
    );

    // Start ping interval
    const startPingInterval = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }

        pingIntervalRef.current = setInterval(() => {
            sendMessage({
                type: "ping",
                payload: { timestamp: Date.now() },
            });
        }, config.pingIntervalMs);
    }, [config.pingIntervalMs, sendMessage]);

    // Handle incoming messages
    const handleMessage = useCallback(
        (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data) as WsServerMessage;

                switch (message.type) {
                    case "connected":
                        // Server acknowledged connection, now authenticate
                        if (accessToken) {
                            sendMessage({
                                type: "authenticate",
                                payload: { token: accessToken },
                            });
                            updateState(WsConnectionState.AUTHENTICATING);
                        }
                        break;

                    case "authenticated":
                        updateState(WsConnectionState.AUTHENTICATED);
                        reconnectAttemptsRef.current = 0;
                        scheduleTokenRefresh(message.payload.expiresAt);
                        startPingInterval();
                        onAuthenticated?.(message.payload.userId);

                        // Restore subscriptions
                        for (const channel of pendingSubscriptionsRef.current) {
                            sendMessage({
                                type: "subscribe",
                                payload: { channel },
                            });
                        }
                        break;

                    case "token_refreshed":
                        scheduleTokenRefresh(message.payload.expiresAt);
                        break;

                    case "pong":
                        // Connection is healthy
                        break;

                    case "subscribed":
                        setSubscriptions((prev) => {
                            const next = new Set(prev);
                            next.add(message.payload.channel);
                            return next;
                        });
                        break;

                    case "unsubscribed":
                        setSubscriptions((prev) => {
                            const next = new Set(prev);
                            next.delete(message.payload.channel);
                            return next;
                        });
                        pendingSubscriptionsRef.current.delete(
                            message.payload.channel
                        );
                        break;

                    case "data":
                        onData?.(message.payload.channel, message.payload.data);
                        break;

                    case "error":
                        onError?.(
                            message.payload.code,
                            message.payload.message
                        );
                        break;
                }
            } catch {
                // Message parsing failed - likely invalid JSON from server
                onError?.(0, "Failed to parse WebSocket message");
            }
        },
        [
            accessToken,
            sendMessage,
            updateState,
            scheduleTokenRefresh,
            startPingInterval,
            onAuthenticated,
            onData,
            onError,
        ]
    );

    // Calculate reconnect delay with exponential backoff
    const getReconnectDelay = useCallback(() => {
        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(
            config.initialReconnectDelayMs * Math.pow(2, attempts),
            config.maxReconnectDelayMs
        );
        // Add jitter (±10%)
        return delay * (0.9 + Math.random() * 0.2);
    }, [config.initialReconnectDelayMs, config.maxReconnectDelayMs]);

    // Handle WebSocket close
    const handleClose = useCallback(
        (event: CloseEvent) => {
            clearTimers();
            updateState(WsConnectionState.DISCONNECTED);
            onDisconnect?.(event.code, event.reason);

            // Don't reconnect if manually disconnected
            if (isManualDisconnectRef.current) {
                isManualDisconnectRef.current = false;
                return;
            }

            // Check max reconnect attempts
            if (
                config.maxReconnectAttempts > 0 &&
                reconnectAttemptsRef.current >= config.maxReconnectAttempts
            ) {
                onError?.(0, "Max reconnection attempts reached");
                return;
            }

            // Schedule reconnection using ref to avoid circular dependency
            const delay = getReconnectDelay();
            reconnectAttemptsRef.current++;

            reconnectTimeoutRef.current = setTimeout(() => {
                connectRef.current();
            }, delay);
        },
        [
            clearTimers,
            updateState,
            onDisconnect,
            config.maxReconnectAttempts,
            getReconnectDelay,
            onError,
        ]
    );

    // Connect to WebSocket server
    const connect = useCallback(() => {
        // Don't connect without a token
        if (!accessToken) {
            // No token available - user may not be logged in
            return;
        }

        // Close existing connection
        if (socketRef.current) {
            socketRef.current.close();
        }

        const wsUrl = getWebSocketUrl();
        const socket = new WebSocket(wsUrl);

        // Set connecting state when socket starts connecting
        // Using queueMicrotask to defer state update per react-hooks guidelines
        queueMicrotask(() => {
            if (socket.readyState === WebSocket.CONNECTING) {
                updateState(WsConnectionState.CONNECTING);
            }
        });

        socket.onopen = () => {
            updateState(WsConnectionState.CONNECTED);
        };

        socket.onmessage = handleMessage;

        socket.onclose = handleClose;

        socket.onerror = () => {
            // WebSocket error occurred - connection will be closed
            // The onclose handler will handle reconnection logic
        };

        socketRef.current = socket;
    }, [accessToken, updateState, handleMessage, handleClose]);

    // Keep connectRef in sync with connect function for reconnection
    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    // Disconnect from WebSocket server
    const disconnect = useCallback(() => {
        isManualDisconnectRef.current = true;
        clearTimers();

        if (socketRef.current) {
            socketRef.current.close(1000, "Client disconnect");
            socketRef.current = null;
        }

        updateState(WsConnectionState.DISCONNECTED);
        setSubscriptions(new Set());
        pendingSubscriptionsRef.current.clear();
    }, [clearTimers, updateState]);

    // Subscribe to a channel
    const subscribe = useCallback(
        (channel: string, params?: Record<string, unknown>) => {
            pendingSubscriptionsRef.current.add(channel);

            if (state === WsConnectionState.AUTHENTICATED) {
                sendMessage({
                    type: "subscribe",
                    payload: { channel, params },
                });
            }
        },
        [state, sendMessage]
    );

    // Unsubscribe from a channel
    const unsubscribe = useCallback(
        (channel: string) => {
            pendingSubscriptionsRef.current.delete(channel);

            if (state === WsConnectionState.AUTHENTICATED) {
                sendMessage({
                    type: "unsubscribe",
                    payload: { channel },
                });
            }

            setSubscriptions((prev) => {
                const next = new Set(prev);
                next.delete(channel);
                return next;
            });
        },
        [state, sendMessage]
    );

    // Check if subscribed to a channel
    const isSubscribed = useCallback(
        (channel: string) => subscriptions.has(channel),
        [subscriptions]
    );

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect && accessToken) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, accessToken, connect, disconnect]);

    // Reconnect when token changes (e.g., after refresh)
    useEffect(() => {
        if (
            accessToken &&
            state === WsConnectionState.DISCONNECTED &&
            !isManualDisconnectRef.current
        ) {
            connect();
        }
    }, [accessToken, state, connect]);

    return {
        state,
        isAuthenticated: state === WsConnectionState.AUTHENTICATED,
        isConnecting:
            state === WsConnectionState.CONNECTING ||
            state === WsConnectionState.AUTHENTICATING,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        isSubscribed,
        subscriptions,
    };
}
