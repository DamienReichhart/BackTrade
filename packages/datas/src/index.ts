/**
 * @backtrade/datas
 *
 * Shared data access package for BackTrade.
 * Contains database client, repositories, and Prisma types.
 */

// Prisma client instance
export { prisma } from "./libs/prisma";

// All repositories
export {
    usersRepo,
    userSessionsRepo,
    plansRepo,
    subscriptionsRepo,
    stripeEventsRepo,
    instrumentsRepo,
    sessionsRepo,
    positionsRepo,
    transactionsRepo,
    datasetsRepo,
    candlesRepo,
    sessionsAnalyticsRepo,
} from "./repositories";

// Repository option types
export type { FindAllOptions as InstrumentsFindAllOptions } from "./repositories/instruments-repository";
export type { FindAllOptions as DatasetsFindAllOptions } from "./repositories/datasets-repository";
export type { FindAllOptions as CandlesFindAllOptions } from "./repositories/candles-repository";

// Re-export all Prisma types and enums for consumer convenience
export type {
    // Models
    User,
    UserSession,
    Plan,
    Subscription,
    StripeEvent,
    Instrument,
    Session,
    Position,
    Transaction,
    Dataset,
    Candle,
    SessionAnalytics,
    // Prisma namespace types
    Prisma,
    PrismaClient,
} from "./generated/prisma/client";

// Re-export enums
export {
    Role,
    SessionStatus,
    Timeframe,
    Speed,
    PositionStatus,
    Side,
    TransactionType,
    SubscriptionStatus,
} from "./generated/prisma/client";
