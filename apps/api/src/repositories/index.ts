/**
 * Repositories Module
 *
 * Central export point for all repository functions.
 * Note: Repositories use default exports. Import directly from individual files:
 * import usersRepo from "./repositories/users.repository";
 */

// User-related repositories
export { default as usersRepo } from "./users.repository";
export { default as userSessionsRepo } from "./user-sessions.repository";

// Billing repositories
export { default as plansRepo } from "./plans.repository";
export { default as subscriptionsRepo } from "./subscriptions.repository";
export { default as stripeEventsRepo } from "./stripe-events.repository";

// Trading repositories
export { default as instrumentsRepo } from "./instruments.repository";
export { default as sessionsRepo } from "./sessions.repository";
export { default as positionsRepo } from "./positions.repository";
export { default as transactionsRepo } from "./transactions.repository";

// Data repositories
export { default as datasetsRepo } from "./datasets.repository";
export { default as candlesRepo } from "./candles.repository";

// Analytics repositories
export { default as sessionsAnalyticsRepo } from "./sessions-analytics.repository";
export { default as auditLogsRepo } from "./audit-logs.repository";
