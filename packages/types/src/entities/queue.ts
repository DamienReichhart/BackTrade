/**
 * Queue message structure
 *
 * Represents a message that can be queued for processing by workers.
 * This is a shared schema used by both the API (for queuing) and Worker (for processing).
 */
export interface QueueMessage {
    id: string;
    type: string;
    data: unknown;
    timestamp: string;
}
