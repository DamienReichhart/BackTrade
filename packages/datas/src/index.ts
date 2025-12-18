/**
 * @backtrade/datas
 *
 * Shared data access package for BackTrade.
 * Contains database client and repositories.
 */

// Database client instances
export { prisma } from "./libs/prisma";
export { clickhouse } from "./libs/clickhouse";

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
// Re-export types from @backtrade/types for consumer convenience
export type {
    // Entity types
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
    // Query types
    UserWhereInput,
    UserCreateInput,
    UserUpdateInput,
    UserOrderBy,
    UserSessionWhereInput,
    UserSessionCreateInput,
    UserSessionUpdateInput,
    UserSessionOrderBy,
    PlanWhereInput,
    PlanCreateInput,
    PlanUpdateInput,
    PlanOrderBy,
    SubscriptionWhereInput,
    SubscriptionCreateInput,
    SubscriptionUpdateInput,
    SubscriptionOrderBy,
    StripeEventWhereInput,
    StripeEventCreateInput,
    StripeEventUpdateInput,
    StripeEventOrderBy,
    InstrumentWhereInput,
    InstrumentCreateInput,
    InstrumentUpdateInput,
    InstrumentOrderBy,
    SessionWhereInput,
    SessionCreateInput,
    SessionUpdateInput,
    SessionOrderBy,
    PositionWhereInput,
    PositionCreateInput,
    PositionUpdateInput,
    PositionOrderBy,
    TransactionWhereInput,
    TransactionCreateInput,
    TransactionUpdateInput,
    TransactionOrderBy,
    DatasetWhereInput,
    DatasetCreateInput,
    DatasetUpdateInput,
    DatasetOrderBy,
    CandleWhereInput,
    CandleCreateInput,
    CandleOrderBy,
    SessionAnalyticsWhereInput,
    SessionAnalyticsCreateInput,
    SessionAnalyticsUpdateInput,
    SessionAnalyticsOrderBy,
    // Enums
    Role,
    SessionStatus,
    Timeframe,
    Speed,
    PositionStatus,
    Side,
    TransactionType,
    SubscriptionStatus,
} from "@backtrade/types";
